import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { toPng } from 'html-to-image';

interface SuburbOption {
    name: string;
    state: string;
    displayName: string;
}

interface TrendPoint {
    year: number;
    [key: string]: number | string;
}

const lineColors = ['#3b82f6', '#f97316', '#10b981', '#8b5cf6', '#ef4444'];

const TrendGraphPanel: React.FC = () => {
    const chartRef = useRef<HTMLDivElement>(null);

    const [searchInput, setSearchInput] = useState('');
    const [selectedSuburbs, setSelectedSuburbs] = useState<string[]>(['Clayton']);
    const [suggestions, setSuggestions] = useState<SuburbOption[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [variable, setVariable] = useState<'tmax' | 'tmin' | 'precip'>('tmax');
    const [yearRange, setYearRange] = useState<5 | 10 | 20>(10);
    const [season, setSeason] = useState<'Summer' | 'Autumn' | 'Winter' | 'Spring'>('Summer');
    const [data, setData] = useState<TrendPoint[]>([]);
    const [suburbs, setSuburbs] = useState<SuburbOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [yAxisRange, setYAxisRange] = useState<[number, number]>([0, 100]);

    useEffect(() => {
        axios.get('http://localhost:3001/api/suburbs')
            .then(res => {
                setSuburbs(res.data);
                setSuggestions(res.data.slice(0, 5));
            })
            .catch(() => console.error('Failed to fetch suburbs'));
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchInput(value);

        if (value.length > 2) {
            const filtered = suburbs.filter(s =>
                s.displayName.toLowerCase().includes(value.toLowerCase())
            );
            setSuggestions(filtered.slice(0, 5));
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleSuburbSelect = (selectedSuburb: SuburbOption) => {
        setSearchInput('');
        setShowSuggestions(false);
        setSuggestions([]);

        setSelectedSuburbs((prev) => {
            if (prev.includes(selectedSuburb.name)) return prev;
            if (prev.length >= 5) return prev;
            return [...prev, selectedSuburb.name];
        });
    };

    const removeSuburb = (name: string) => {
        setSelectedSuburbs((prev) => prev.filter((s) => s !== name));
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const merged: Record<number, any> = {};

                for (const suburb of selectedSuburbs) {
                    const res = await axios.get('http://localhost:3001/seasonal-data', {
                        params: { suburb }
                    });

                    const rawData = res.data;
                    if (!Array.isArray(rawData)) throw new Error("Invalid API response");

                    const allYears = rawData.map(item => item.year);
                    const maxYear = Math.max(...allYears);
                    const startYear = maxYear - yearRange + 1;

                    const filteredData = rawData
                        .filter(item => item.year >= startYear && item.year <= maxYear)
                        .sort((a, b) => a.year - b.year);

                    filteredData.forEach(item => {
                        const value = item[season]?.[variable];
                        if (value !== null && value !== undefined) {
                            if (!merged[item.year]) merged[item.year] = { year: item.year };
                            merged[item.year][suburb] = value;
                        }
                    });
                }

                const finalData = Object.values(merged).sort((a, b) => a.year - b.year);
                setData(finalData);

                const allValues: number[] = [];
                finalData.forEach(entry => {
                    selectedSuburbs.forEach(suburb => {
                        const val = entry[suburb];
                        if (typeof val === 'number') {
                            allValues.push(val);
                        }
                    });
                });

                const minY = Math.floor(Math.min(...allValues));
                const maxY = Math.ceil(Math.max(...allValues));
                setYAxisRange([minY, maxY]);
            } catch (err) {
                console.error("Error:", err);
                setError("Failed to load data");
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedSuburbs, variable, yearRange, season]);

    return (
        <div className="flex flex-col h-full p-4 space-y-4 min-w-[640px]">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Suburb Search Bar */}
                <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search Suburb (max 5)</label>
                    <input
                        type="text"
                        value={searchInput}
                        onChange={handleSearchChange}
                        onFocus={() => setShowSuggestions(true)}
                        placeholder="Type suburb name..."
                        className="w-full p-2 border rounded-md"
                    />
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                            {suggestions.map((s) => (
                                <div
                                    key={s.name}
                                    className="p-2 hover:bg-gray-100 cursor-pointer"
                                    onMouseDown={() => handleSuburbSelect(s)}
                                >
                                    {s.displayName}
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                        {selectedSuburbs.map((name) => (
                            <span key={name} className="bg-blue-100 px-2 py-1 rounded-md text-sm flex items-center gap-1">
                {name}
                                <button onClick={() => removeSuburb(name)} className="text-red-500">✕</button>
              </span>
                        ))}
                    </div>
                </div>

                {/* Metric Selector */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Metric</label>
                    <select
                        value={variable}
                        onChange={(e) => setVariable(e.target.value as any)}
                        className="w-full p-2 border rounded-md"
                    >
                        <option value="tmax">Max Temp (°C)</option>
                        <option value="tmin">Min Temp (°C)</option>
                        <option value="precip">Precipitation (mm)</option>
                    </select>
                </div>

                {/* Season Selector */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Season</label>
                    <select
                        value={season}
                        onChange={(e) => setSeason(e.target.value as any)}
                        className="w-full p-2 border rounded-md"
                    >
                        <option value="Summer">Summer</option>
                        <option value="Autumn">Autumn</option>
                        <option value="Winter">Winter</option>
                        <option value="Spring">Spring</option>
                    </select>
                </div>

                {/* Year Range Selector */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year Range</label>
                    <select
                        value={yearRange}
                        onChange={(e) => setYearRange(parseInt(e.target.value) as 5 | 10 | 20)}
                        className="w-full p-2 border rounded-md"
                    >
                        <option value={5}>5 Years</option>
                        <option value={10}>10 Years</option>
                        <option value={20}>20 Years</option>
                    </select>
                </div>
            </div>

            {/* Graph */}
            <div className="flex-1 min-h-[400px]">
                {loading ? (
                    <div className="flex justify-center items-center h-full text-gray-500">Loading...</div>
                ) : error ? (
                    <div className="text-center text-red-500">{error}</div>
                ) : data.length === 0 ? (
                    <div className="text-center text-gray-500">No data available</div>
                ) : (
                    <>
                        <div ref={chartRef} className="bg-white p-4 rounded-md">
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="year" />
                                    <YAxis
                                        domain={yAxisRange}
                                        allowDecimals={true}
                                        label={{
                                            value: variable === 'precip' ? 'Precip (mm)' : 'Temp (°C)',
                                            angle: -90,
                                            position: 'insideLeft'
                                        }}
                                    />
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                    <ReferenceLine x={new Date().getFullYear()} stroke="gray" strokeDasharray="4 2" label="Now" />
                                    {selectedSuburbs.map((name, index) => (
                                        <Line
                                            key={name}
                                            type="monotone"
                                            dataKey={name}
                                            stroke={lineColors[index % lineColors.length]}
                                            strokeWidth={2}
                                            dot={{ r: 2 }}
                                            name={`${name} (${season})`}
                                        />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 flex justify-center gap-4">
                            <button
                                onClick={() => {
                                    const suburb = suburbs.find(s => s.name === selectedSuburbs[0])?.displayName || selectedSuburbs[0];
                                    const url = `http://localhost:3001/api/trend-data-download?suburb=${encodeURIComponent(suburb)}&metric=${variable}&season=${season}&yearRange=${yearRange}`;
                                    window.open(url, '_blank');
                                }}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                                Download Data (JSON)
                            </button>

                            <button
                                onClick={async () => {
                                    if (!chartRef.current) return;
                                    try {
                                        const dataUrl = await toPng(chartRef.current);
                                        const link = document.createElement('a');
                                        link.download = 'trend-graph.png';
                                        link.href = dataUrl;
                                        link.click();
                                    } catch (err) {
                                        console.error('Download failed:', err);
                                    }
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Download Graph
                            </button>
                        </div>

                    </>
                )}
            </div>
        </div>
    );
};

export default TrendGraphPanel;
