// TrendGraphPanel.tsx
import React, { useEffect, useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import axios from 'axios';

interface TrendGraphPanelProps {
    suburb: string;
    variable: 'tmax' | 'tmin' | 'precip';
    yearRange: number; // 5 or 10 years
}

interface YearlySeasonalData {
    year: number;
    Summer?: Record<string, number>;
    Autumn?: Record<string, number>;
    Winter?: Record<string, number>;
    Spring?: Record<string, number>;
}

const TrendGraphPanel: React.FC<TrendGraphPanelProps> = ({ suburb, variable, yearRange }) => {
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        axios.get(`http://localhost:3001/seasonal-data?suburb=${suburb}`)
            .then(res => {
                const seasonal = res.data as YearlySeasonalData[];
                const sorted = seasonal.sort((a, b) => a.year - b.year);
                const recent = sorted.slice(-yearRange);

                const processed = recent.map(entry => ({
                    year: entry.year,
                    Summer: entry.Summer?.[variable] ?? null,
                    Autumn: entry.Autumn?.[variable] ?? null,
                    Winter: entry.Winter?.[variable] ?? null,
                    Spring: entry.Spring?.[variable] ?? null,
                }));

                setData(processed);
            })
            .catch(err => console.error('Failed to fetch seasonal trend data', err));
    }, [suburb, variable, yearRange]);

    return (
        <div className="p-4 bg-white border rounded shadow-md w-full h-[350px]">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">{`Seasonal ${variable.toUpperCase()} Trend in ${suburb}`}</h2>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <ReferenceLine x={new Date().getFullYear()} stroke="red" label="Now" />
                    <Line type="monotone" dataKey="Summer" stroke="#ef4444" strokeWidth={2} dot={{ r: 2 }} />
                    <Line type="monotone" dataKey="Autumn" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} />
                    <Line type="monotone" dataKey="Winter" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2 }} />
                    <Line type="monotone" dataKey="Spring" stroke="#22c55e" strokeWidth={2} dot={{ r: 2 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TrendGraphPanel;
