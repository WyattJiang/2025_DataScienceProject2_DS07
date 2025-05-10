import React, { useState } from 'react';
import { X } from 'lucide-react';

type Mode = 'city' | 'coords';

interface WeatherData {
    location: { name: string; region: string; country: string; lat: number; lon: number; localtime: string };
    current: {
      temp_c: number;
      feelslike_c: number;
      humidity: number;
      cloud: number;
      uv: number;
      dewpoint_c: number;
      wind_kph: number;
      wind_dir: string;
      gust_kph: number;
      pressure_mb: number;
      precip_mm: number;
      vis_km: number;
      condition: { text: string; icon: string };
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
    };
  }

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const RealTimeWeather: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const apiKey = import.meta.env.VITE_APP_API_KEY;
  const [mode, setMode] = useState<Mode>('city');
  const [city, setCity] = useState('Melbourne');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    if (!apiKey) return setError('API key missing.');

    let query = '';
    if (mode === 'city') query = city.trim();
    else if (mode === 'coords') query = `${lat.trim()},${lon.trim()}`;

    const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${query}&aqi=yes`;

    try {
      setLoading(true);
      setError(null);
      const res = await fetch(url);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error?.message || 'Fetch failed');
      }
      const data = await res.json();
      setWeatherData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white w-[90vw] h-[90vh] rounded-lg shadow-xl p-4 relative overflow-auto">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-xl font-semibold mb-4">Real-time Weather Search</h2>

        {/* Input Mode Toggle */}
        <div className="mb-4 flex items-center space-x-4">
          <label>
            <input
              type="radio"
              name="mode"
              checked={mode === 'city'}
              onChange={() => setMode('city')}
              className="mr-1"
            />
            City/Suburb
          </label>
          <label>
            <input
              type="radio"
              name="mode"
              checked={mode === 'coords'}
              onChange={() => setMode('coords')}
              className="mr-1"
            />
            Coordinates (Lat, Lon)
          </label>
        </div>

        {/* Input Fields */}
        {mode === 'city' ? (
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city or suburb"
            className="border p-2 w-full rounded mb-4"
          />
        ) : (
          <div className="flex space-x-2 mb-4">
            <input
              type="text"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="Latitude"
              className="border p-2 w-1/2 rounded"
            />
            <input
              type="text"
              value={lon}
              onChange={(e) => setLon(e.target.value)}
              placeholder="Longitude"
              className="border p-2 w-1/2 rounded"
            />
          </div>
        )}

        <button
          onClick={fetchWeather}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Search
        </button>

        {/* Output Section */}
        {loading && <p className="text-gray-500">Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {weatherData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="bg-gradient-to-br from-blue-900 to-blue-500 text-white p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center space-x-2">
                <img src={`https:${weatherData.current.condition.icon}`} alt={weatherData.current.condition.text} className="w-30 h-30" />
                <div className="text-xl">{weatherData.current.condition.text}</div>
              </div>
              <div className="text-4xl font-bold w-30">{weatherData.current.temp_c}°C</div>
            </div>
            <div className="bg-gradient-to-br from-cyan-100 via-blue-100 to-indigo-100 p-4 mx-auto w-full max-w-md text-center rounded-xl text-black  shadow-md">
            <h4 className="text-3xl font-semibold mb-10 underline">Weather Details</h4>
                <div className="text-lg grid grid-cols-2 gap-y-10 gap-x-6">
                    <p>Feels like: {weatherData.current.feelslike_c}°C</p>
                    <p>Wind: {weatherData.current.wind_kph} km/h ({weatherData.current.wind_dir})</p>
                    <p>Gust: {weatherData.current.gust_kph} km/h</p>
                    <p>Humidity: {weatherData.current.humidity}%</p>
                    <p>Cloud cover: {weatherData.current.cloud}%</p>
                    <p>UV index: {weatherData.current.uv}</p>
                    <p>Pressure: {weatherData.current.pressure_mb} mb</p>
                    <p>Precipitation: {weatherData.current.precip_mm} mm</p>
                    <p>Visibility: {weatherData.current.vis_km} km</p>
                    <p>Dew Point: {weatherData.current.dewpoint_c}°C</p>
                </div>
            </div>
          </div>

            <div className="bg-gradient-to-br from-orange-200 via-red-100 to-pink-100 p-6 rounded-2xl shadow-lg text-sm text-gray-800 space-y-6">
            {/* Location Info Card */}
            <div className="bg-gradient-to-br from-yellow-200 via-yellow-100 to-amber-100 p-6 rounded-2xl shadow-lg text-sm text-gray-800 space-y-6">
                <div className="bg-gradient-to-br from-yellow-100 via-yellow-50 to-amber-50 p-5 rounded-xl text-center text-black shadow-sm max-w-md mx-auto">
                    <h3 className="text-lg font-semibold mb-1 underline">Location Info</h3>
                    <table className="w-full text-left text-sm">
                    <tbody>
                        <tr><td className="font-medium pr-2">Country:</td><td>{weatherData.location.country}</td></tr>
                        <tr><td className="font-medium pr-2">Region:</td><td>{weatherData.location.region}</td></tr>
                        <tr><td className="font-medium pr-2">Lat/Lon:</td><td>{weatherData.location.lat.toFixed(2)}, {weatherData.location.lon.toFixed(2)}</td></tr>
                        <tr><td className="font-medium pr-2">Local Time:</td><td>{weatherData.location.localtime}</td></tr>
                        <tr><td className="font-medium pr-2">Time Zone ID:</td><td>Australia/Melbourne</td></tr>
                        <tr><td className="font-medium pr-2">Sunrise:</td><td>7:11 am</td></tr>
                        <tr><td className="font-medium pr-2">Sunset:</td><td>5:26 pm</td></tr>
                    </tbody>
                    </table>
                </div>
            </div>

            {/* Air Quality Card */}
            {weatherData.current.air_quality && (
                 <div className="bg-gradient-to-br from-sky-400 via-blue-250 to-indigo-200 p-6 rounded-2xl shadow-lg text-sm text-gray-800 mt-6">
                 <div className="bg-gradient-to-br from-sky-300 via-blue-150 to-indigo-100  p-5 rounded-xl text-center text-black shadow-sm max-w-md mx-auto">
                   <h4 className="text-lg font-semibold mb-1 underline">Air Quality (µg/m³)</h4>
                   <ul className="list-disc text-left pl-6 text-sm space-y-1">
                     <li><strong>CO:</strong> {weatherData.current.air_quality.co}</li>
                     <li><strong>NO₂:</strong> {weatherData.current.air_quality.no2}</li>
                     <li><strong>O₃:</strong> {weatherData.current.air_quality.o3}</li>
                     <li><strong>SO₂:</strong> {weatherData.current.air_quality.so2}</li>
                     <li><strong>PM2.5:</strong> {weatherData.current.air_quality['pm2_5']}</li>
                     <li><strong>PM10:</strong> {weatherData.current.air_quality.pm10}</li>
                     <li><strong>US EPA Index:</strong> {weatherData.current.air_quality['us-epa-index']}</li>
                     <li><strong>DEFRA Index:</strong> {weatherData.current.air_quality['gb-defra-index']}</li>
                   </ul>
                 </div>
               </div>
            )}
            </div>
        </div>
      )}
    </div>
  </div>
  );
};

export default RealTimeWeather;
