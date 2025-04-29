import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';

interface SuburbOption {
    name: string;
    state: string;
    displayName: string;
}

interface TrendPoint {
    year: number;
    value: number;
}

const TrendGraphPanel: React.FC = () => {
    const [searchInput, setSearchInput] = useState('Clayton');
    const [suburb, setSuburb] = useState('Clayton');
    const [suggestions, setSuggestions] = useState<SuburbOption[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [variable, setVariable] = useState<'tmax' | 'tmin' | 'precip'>('tmax');
    const [yearRange, setYearRange] = useState<5 | 10>(10);
    const [season, setSeason] = useState<'Summer' | 'Autumn' | 'Winter' | 'Spring'>('Summer');
    const [data, setData] = useState<TrendPoint[]>([]);
    const [suburbs, setSuburbs] = useState<SuburbOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch suburb options once
    useEffect(() => {
        axios.get('http://localhost:3001/api/suburbs')
            .then(res => {
                setSuburbs(res.data);
                setSuggestions(res.data.slice(0, 5));
            })
            .catch(() => console.error('Failed to fetch suburbs'));
    }, []);

    // Handle search input changes
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

    // Handle suburb selection from suggestions
    const handleSuburbSelect = (selectedSuburb: SuburbOption) => {
        setSuburb(selectedSuburb.name);  // Use backend-safe "name"
        setSearchInput(selectedSuburb.displayName); // Display nicely
        setShowSuggestions(false);
    };

    // Fetch trend data when filters change
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
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

                const formatted = filteredData.map(item => ({
                    year: item.year,
                    value: item[season]?.[variable] || null
                })).filter(item => item.value !== null);

                setData(formatted);
            } catch (err) {
                console.error("Error:", err);
                setError("Failed to load data");
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [suburb, variable, yearRange, season]);

    return (
        <div className="flex flex-col h-full p-4 space-y-4 min-w-[640px]">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Suburb Search Bar */}
                <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search Suburb</label>
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
                                    onMouseDown={() => handleSuburbSelect(s)} // <- onMouseDown to avoid blur conflict
                                >
                                    {s.displayName}
                                </div>
                            ))}
                        </div>
                    )}
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

                {/* Year Range */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year Range</label>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setYearRange(5)}
                            className={`flex-1 py-2 px-3 rounded-md ${yearRange === 5 ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                        >
                            5 Years
                        </button>
                        <button
                            onClick={() => setYearRange(10)}
                            className={`flex-1 py-2 px-3 rounded-md ${yearRange === 10 ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                        >
                            10 Years
                        </button>
                    </div>
                </div>
            </div>

            {/* Graph */}
            <div className="flex-1 min-h-[400px]">
                {loading ? (
                    <div className="flex justify-center items-center h-full text-gray-500">Loading...</div>
                ) : error ? (
                    <div className="text-center text-red-500">{error}</div>
                ) : data.length === 0 ? (
                    <div className="text-center text-gray-500">No data available for {suburb}</div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" />
                            <YAxis
                                label={{
                                    value: variable === 'precip' ? 'Precip (mm)' : 'Temp (°C)',
                                    angle: -90,
                                    position: 'insideLeft'
                                }}
                            />
                            <Tooltip />
                            <Legend />
                            <ReferenceLine x={new Date().getFullYear()} stroke="gray" strokeDasharray="4 2" label="Now" />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={{ r: 2 }}
                                name={`${variable.toUpperCase()} (${season})`}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

export default TrendGraphPanel;