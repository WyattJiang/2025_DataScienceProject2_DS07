import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import {
  LineChart, BarChart,Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { toPng } from 'html-to-image';

type Mode = 'city' | 'coords' | 'suburb';

interface ForecastHour {
    time: string;
    temp_c: number;
    temp_f: number;
    wind_mph: number;
    wind_kph: number;
    wind_dir: string;
    precip_mm: number;
    precip_in: number;
    pressure_mb: number;
    humidity: number;
    heatindex_c: number;
    heatindex_f: number;
    dewpoint_c:number;
    dewpoint_f: number;
    uv: number;
    condition: { text: string; icon: string };
}

interface ForecastDay {
    date: string;
    day: {
    maxtemp_c: number;
    mintemp_c: number;
    avgtemp_c: number;
    totalprecip_mm: number;
    totalprecip_in: number;
    avghumidity: number;
    vis_km: number;
    vis_miles: number;
    air_quality?: {
        co: number;
        no2: number;
        o3: number;
        so2: number;
        'pm2_5': number;
        pm10: number;
        'us-epa-index': number;
        'gb-defra-index': number;
    };
    condition: { text: string; icon: string };
    };
    hour: ForecastHour[];
}

interface WeatherForecastData {
    location: {
        name: string;
        region: string;
        country: string;
        lat: number;
        lon: number;
        localtime: string;
    };
    forecast: {
        forecastday: ForecastDay[];
    };
}

type Props = {
    isOpen: boolean;
    onClose: () => void;
};

const Forecasting: React.FC<Props> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    const apiKey = import.meta.env.VITE_APP_API_KEY;
    const [mode, setMode] = useState<Mode>('city');
    const [city, setCity] = useState('Melbourne');
    const [days, setDays] = useState<number>(3);
    const [lat, setLat] = useState('');
    const [lon, setLon] = useState('');
    const [data, setData] = useState<WeatherForecastData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [popupDay, setPopupDay] = useState<ForecastDay | null>(null);
    const [selectedMetric, setSelectedMetric] = useState<string>('temp');
    const [unitSystem, setUnitSystem] = useState<string>('metric');
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_APP_GEMINI);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const [suburb, setSuburb] = useState('Clayton');
    const [displayLocation, setDisplayLocation] = useState('');
    const [chartType, setChartType] = useState<'line' | 'bar'>('bar');
    const chartRef = useRef(null);


    useEffect(() => {
        fetchForecast()
    }, []);
    const fetchForecast = async () => {
        if (!apiKey) return setError('API key missing.');
        let query = '';
        if (mode === 'city') {
        query = city.trim();
        } else if (mode === 'coords') {
        query = `${lat.trim()},${lon.trim()}`;
        } else if (mode === 'suburb') {
        const fullPrompt = `ONLY give me the decimal latitude and longitude of this location (likely in Australia, Be accurate with the lat and lon): ${suburb}. Format: -37.81, 144.96`;
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const locationText = response.text().trim();
        query = locationText; 
        }
        const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${query}&days=${days}&aqi=yes&alerts=no`;

        try {
        setLoading(true);
        setError(null);
        const res = await fetch(url);
        if (!res.ok) throw new Error('Invalid location');
        const json = await res.json();
        setData(json);
        if (mode === 'suburb') {
        setDisplayLocation(suburb);
        } else {
        setDisplayLocation(json.location.name);
        }
        } catch (err: any) {
        setError(err.message || 'Failed to fetch forecast');
        } finally {
        setLoading(false);
        }
    };
    const getMetricValue = (hour: ForecastHour, metric: string, unitSystem: string): number => {
        const key = {
            temp: unitSystem === 'metric' ? hour.temp_c : hour.temp_f,
            wind: unitSystem === 'metric' ? hour.wind_kph : hour.wind_mph,
            precip: unitSystem === 'metric' ? hour.precip_mm : hour.precip_in,
            humidity: hour.humidity,
            pressure: hour.pressure_mb,
            heatindex: unitSystem === 'metric' ? hour.heatindex_c : hour.heatindex_f,
            dewpoint: unitSystem === 'metric' ? hour.dewpoint_c : hour.dewpoint_f,
            uv: hour.uv,
        };
        return key[metric as keyof typeof key] ?? 0;
    }

    const getUnitLabel = (metric: string, unit: string): string => {
        const labels: any = {
        temp: unit === 'metric' ? '°C' : '°F',
        wind: unit === 'metric' ? 'km/h' : 'mph',
        precip: unit === 'metric' ? 'mm' : 'in',
        pressure: 'mb',
        humidity: '%',
        heatindex: unit === 'metric' ? '°C' : '°F',
        dewpoint: unit === 'metric' ? '°C' : '°F',
        uv: 'UV',
        };
        return labels[metric] || '';
    };

    const getMetricLabel = (metric: string): string => {
        const labels: any = {
        temp: 'Temperature',
        wind: 'Wind Speed',
        precip: 'Precipitation',
        pressure: 'Pressure',
        humidity: 'Humidity',
        heatindex: 'Heat Index',
        dewpoint: 'Dew Point',
        uv: 'UV Index'
        };
        return labels[metric] || metric;
    };

    const handleDownloadJson = () => {
        if (!popupDay) return;
        const simplified = popupDay.hour.map((hour) => ({
            time: hour.time,
            value: getMetricValue(hour, selectedMetric, unitSystem),
            unit: getUnitLabel(selectedMetric, unitSystem),
            metric: getMetricLabel(selectedMetric),
        }));

        const blob = new Blob([JSON.stringify(simplified, null, 2)], {
            type: 'application/json',
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${popupDay.date}_${selectedMetric}_${unitSystem}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white w-[90vw] h-[90vh] rounded-lg shadow-xl p-6 relative overflow-auto">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
        </button>

        <h2 className="text-3xl font-bold mb-4 text-center">Weather Forecast</h2>

        <div className="flex items-center justify-center space-x-6 mb-4">
            <label>
            <input
                type="radio"
                checked={mode === 'city'}
                onChange={() => setMode('city')}
                className="mr-1"
            />
            City
            </label>
            <label>
            <input
                type="radio"
                checked={mode === 'coords'}
                onChange={() => setMode('coords')}
                className="mr-1"
            />
            Coordinates (in decimal degrees)
            </label>

            <label>
            <input
                type="radio"
                checked={mode === 'suburb'}
                onChange={() => setMode('suburb')}
                className='-ml-2 mr-1'
            />
            Suburb
            </label>
        </div>
        <div className="flex justify-center mb-6">
        <form
            onSubmit={(e) => {
            e.preventDefault();
            fetchForecast();
            }}
            className="flex flex-wrap gap-4 items-center justify-center"
        >
            {mode === 'city' ? (
            <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter city name"
                className="border p-2 rounded w-64"
            />
            ) : mode === 'coords' ? (
            <div className="flex space-x-2">
                <input
                type="text"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="Latitude"
                className="border p-2 rounded w-32"
                />
                <input
                type="text"
                value={lon}
                onChange={(e) => setLon(e.target.value)}
                placeholder="Longitude"
                className="border p-2 rounded w-32"
                />
            </div>
            ) : (
            <input
                type="text"
                value={suburb}
                onChange={(e) => setSuburb(e.target.value)}
                placeholder="Enter suburb name"
                className="border p-2 rounded w-64"
            />
            )}

            <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Days:</label>
            <input
                type="number"
                value={days}
                min={1}
                max={5}
                onChange={(e) => setDays(Number(e.target.value))}
                className="border p-2 rounded w-20"
            />
            </div>

            <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded border border-blue-700 hover:bg-blue-700 transition"
            >
            Get Forecast
            </button>
        </form>
        </div>

        
        {loading && (
            <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )}

        {error &&( 
            <div className="flex justify-center items-center h-64">
            <p className="mt-4 text-red-600">Invalid Input</p>
            </div>
        )}

        {data && (
            <div className="mt-8 space-y-6">
            <div className="text-center">
                <h3 className="text-3xl font-semibold">{displayLocation}, {data.location.country}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {data.forecast.forecastday.map((day) => (
                <div
                    key={day.date}
                    onClick={() => setPopupDay(day)}
                    className="cursor-pointer bg-gradient-to-br from-blue-100 via-cyan-100 to-indigo-100 p-6 rounded-xl shadow-md transition hover:shadow-lg hover:scale-[1.05] hover:border" 
                >
                    <h4 className="text-lg font-bold mb-2 justify-center text-center">{day.date}</h4>
                    <img
                    src={`https:${day.day.condition.icon}`}
                    alt={day.day.condition.text}
                    className="mx-auto"
                    />
                    <p className="text-center text-gray-700 mb-1">{day.day.condition.text}</p>
                    <p className="text-sm text-center">🌡️ Max: {day.day.maxtemp_c}°C</p>
                    <p className="text-sm text-center">❄️ Min: {day.day.mintemp_c}°C</p>
                    <p className="text-sm text-center">🌤️ Avg: {day.day.avgtemp_c}°C</p>
                </div>
                ))}
            </div>
            </div>
        )}

        {/* Popup Modal for Hourly Forecast */}
        {popupDay && (
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[99999]">
                <div className="bg-white w-[90vw] max-w-5xl p-6 rounded-lg shadow-xl relative">
                <button
                    onClick={() => setPopupDay(null)}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                >
                    <X className="w-6 h-6" />
                </button>
                <h3 className="text-4xl font-bold text-center mb-4">
                    {popupDay.date} - Hourly Forecast
                </h3>

                {/* Metric and Unit Selectors */}
                <div className="flex justify-center items-center gap-4 mb-6">
                    <select
                    value={selectedMetric}
                    onChange={(e) => setSelectedMetric(e.target.value)}
                    className="border p-2 rounded text-sm"
                    >
                    <option value="temp">Temperature</option>
                    <option value="wind">Wind</option>
                    <option value="precip">Precipitation</option>
                    <option value="humidity">Humidity</option>
                    <option value="pressure">Pressure</option>
                    <option value="heatindex">Heat Index</option>
                    <option value="dewpoint">Dew Point</option>
                    <option value="uv">UV Index</option>
                    </select>

                    <select
                    value={unitSystem}
                    onChange={(e) => setUnitSystem(e.target.value)}
                    className="border p-2 rounded text-sm"
                    >
                    <option value="metric">Metric System</option>
                    <option value="imperial">Imperial System</option>
                    </select>

                    {/* Trend type selector */}
                    <select
                        value={chartType}
                        onChange={(e) => setChartType(e.target.value as 'line' | 'bar')}
                        className="border p-2 rounded text-sm"
                    >
                        <option value="line">Line Chart</option>
                        <option value="bar">Bar Chart</option>
                    </select>
                </div>

                {/* Line Chart */}
                <div ref={chartRef} className="bg-white rounded shadow">
                <h3 className="text-lg font-semibold mb-4 text-center">
                    {getMetricLabel(selectedMetric)} Over Time ({unitSystem === 'metric' ? 'Metric' : 'Imperial'})
                </h3>
                
                <ResponsiveContainer  width="100%" height={500}>
                    {chartType === 'line' ? (
                    <LineChart data={popupDay.hour} margin={{ top: 10, right: 15,bottom: 25, left: 35}}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" tickFormatter={(t) => t.slice(11, 16)} label={{ value: 'Time (HH:MM)', position: 'outsideBottom', dy: 20 }} />
                    <YAxis unit={getUnitLabel(selectedMetric, unitSystem)} label={{ value: `${getMetricLabel(selectedMetric)} (${getUnitLabel(selectedMetric, unitSystem)})` , angle: -90, position: 'outsideLeft', dx: -50 }} />
                    <Tooltip
                        labelFormatter={(time) => `Time: ${time}`}
                        formatter={(value: number) => `${value} ${getUnitLabel(selectedMetric, unitSystem)}`}
                    />
                    <Line
                        type="monotone"
                        dataKey={(entry) => getMetricValue(entry, selectedMetric, unitSystem)}
                        name={getMetricLabel(selectedMetric)}
                        stroke="#1D4ED8"
                        strokeWidth={2}
                        dot={false}
                    />
                    </LineChart>
                ) : (
                    <BarChart data={popupDay.hour} margin={{ top: 10, right: 15,bottom: 25, left: 35 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" tickFormatter={(t) => t.slice(11, 16)} label={{ value: 'Time (HH:MM)', position: 'outsideBottom', dy: 20 }}/>
                    <YAxis unit={getUnitLabel(selectedMetric, unitSystem)} label={{ value: `${getMetricLabel(selectedMetric)} (${getUnitLabel(selectedMetric, unitSystem)})` , angle: -90, position: 'outsideLeft', dx: -50 }}/>
                    <Tooltip
                        labelFormatter={(time) => `Time: ${time}`}
                        formatter={(value: number) => `${value} ${getUnitLabel(selectedMetric, unitSystem)}`}
                    />
                    <Bar
                        dataKey={(entry) => getMetricValue(entry, selectedMetric, unitSystem)}
                        name={getMetricLabel(selectedMetric)}
                        fill="#3B82F6"
                    />
                    </BarChart>
                )}
                </ResponsiveContainer>
                </div>
                <div className="mt-4 flex gap-4 justify-center">
                    <button
                        onClick={handleDownloadJson}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                    >
                        Download JSON
                    </button>
                    <button
                        onClick={async () => {
                        if (chartRef.current === null) return;
                        try {
                            const dataUrl = await toPng(chartRef.current);
                            const link = document.createElement('a');
                            link.download = `${popupDay?.date}_chart.png`;
                            link.href = dataUrl;
                            link.click();
                        } catch (err) {
                            console.error('Failed to generate image:', err);
                        }
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                        Download Chart as PNG
                    </button>
                </div>
                
                </div>
            </div>
        )}        
        </div>
    </div>
    );
};

export default Forecasting;
