import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { UserRole } from './config';

type Mode = 'city' | 'coords' | 'suburb';

interface WeatherData {
    location: { name: string; region: string; country: string; lat: number; lon: number; localtime: string };
    current: {
      temp_c: number;
      feelslike_c: number;
      humidity: number;
      heatindex_c: number;
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
    forecast: {
      forecastday:{
        astro: {
          sunrise: string;
          sunset: string;
          moonrise: string;
          moonset: string;
          moonphase: string;
          moon_illumination: number;
          is_sun_up: number;
          is_moon_up: number;
        };
      }[];
    };
  }

type Props = {
  isOpen: boolean;
  onClose: () => void;
  currentUserRole: UserRole;
};

const RealTimeWeather: React.FC<Props> = ({ isOpen, onClose, currentUserRole }) => {
  if (!isOpen) return null;

  const apiKey = import.meta.env.VITE_APP_API_KEY;
  const [mode, setMode] = useState<Mode>('city');
  const [city, setCity] = useState('Melbourne');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_APP_GEMINI);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const [suburb, setSuburb] = useState('Clayton');
  const [displayLocation, setDisplayLocation] = useState('');
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
      fetchWeather()
  }, []);

  useEffect(() => {
    if (!weatherData) return;

    const progress = getSunProgress();
    const monprogress = getMoonProgress();

    const styleId = 'sun-progress-animation';
    const monstyleId = 'moon-progress-animation';

    // Remove previous sun style if it exists
    const oldStyle = document.getElementById(styleId);
    if (oldStyle) oldStyle.remove();

    // Remove previous moon style if it exists
    const oldMonStyle = document.getElementById(monstyleId);
    if (oldMonStyle) oldMonStyle.remove();

    // Create new sun keyframe style
    const sunStyle = document.createElement('style');
    sunStyle.id = styleId;
    sunStyle.innerHTML = `
      @keyframes moveSun {
        from { left: 0%; }
        to { left: ${progress}%; }
      }
    `;
    document.head.appendChild(sunStyle);

    // Create new moon keyframe style
    const moonStyle = document.createElement('style');
    moonStyle.id = monstyleId;
    moonStyle.innerHTML = `
      @keyframes moveMoon {
        from { left: 0%; }
        to { left: ${monprogress}%; }
      }
    `;
    document.head.appendChild(moonStyle);
  }, [weatherData]);


  const fetchWeather = async () => {
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
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${query}&days=1&aqi=yes`;

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
      setAnimationKey(prev => prev + 1); 
      if (mode === 'suburb') {
      setDisplayLocation(suburb);
      } else {
      setDisplayLocation(data.location.name);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const getSunProgress = () => {
    if (!weatherData) return 0;
    const { sunrise, sunset } = weatherData?.forecast.forecastday[0].astro;    
    const now = new Date(weatherData.location.localtime);

    const parseTime = (t: string) => {
      const [time, period] = t.split(' ');
      let [h, m] = time.split(':').map(Number);
      if (period === 'PM' && h !== 12) h += 12;
      if (period === 'AM' && h === 12) h = 0;
      return new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
    };

    const start = parseTime(sunrise);
    const end = parseTime(sunset);
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return Math.max(0, Math.min(100, (elapsed / total) * 100));
  };

  const getMoonProgress = () => {
    if (!weatherData) return 0;
    const { moonrise, moonset } = weatherData?.forecast.forecastday[0].astro;    
    const now = new Date(weatherData.location.localtime);

    const parseTime = (t: string) => {
      const [time, period] = t.split(' ');
      let [h, m] = time.split(':').map(Number);
      if (period === 'PM' && h !== 12) h += 12;
      if (period === 'AM' && h === 12) h = 0;
      return new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
    };

    const start = parseTime(moonrise);
    const end = parseTime(moonset);
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return Math.max(0, Math.min(100, (elapsed / total) * 100));
  };

  const getMetricsForRole = () => {
    const commonMetrics = [
      { label: 'Temperature', value: `${weatherData?.current.temp_c}°C` },
      { label: 'Feels Like', value: `${weatherData?.current.feelslike_c}°C` },
      { label: 'Humidity', value: `${weatherData?.current.humidity}%` },
      { label: 'UV Index', value: `${weatherData?.current.uv}` },
      { label: 'Wind Speed', value: `${weatherData?.current.wind_kph} km/h` },
      { label: 'Visibility', value: `${weatherData?.current.vis_km} km` },
    ];

    const farmerMetrics = [
      { label: 'Dew Point', value: `${weatherData?.current.dewpoint_c}°C` },
      { label: 'Precipitation', value: `${weatherData?.current.precip_mm} mm` },
      { label: 'Cloud Cover', value: `${weatherData?.current.cloud}%` },
      { label: 'Pressure', value: `${weatherData?.current.pressure_mb} mb` },
      { label: 'Gust Speed', value: `${weatherData?.current.gust_kph} km/h` },
      { label: 'Heat Index', value: `${weatherData?.current.heatindex_c}°C` },
    ];

    const plannerMetrics = [
      { label: 'Air Quality Index', value: `${weatherData?.current.air_quality?.['us-epa-index'] ?? 'N/A'}` },
      { label: 'PM2.5', value: `${weatherData?.current.air_quality?.['pm2_5'] ?? 'N/A'}` },
      { label: 'PM10', value: `${weatherData?.current.air_quality?.pm10 ?? 'N/A'}` },
      { label: 'Pressure', value: `${weatherData?.current.pressure_mb} mb` },
      { label: 'Cloud Cover', value: `${weatherData?.current.cloud}%` },
      { label: 'Dew Point', value: `${weatherData?.current.dewpoint_c}°C` },
    ];

    if (currentUserRole === 'farmer') {
      return [...commonMetrics, ...farmerMetrics];
    } else if (currentUserRole === 'urban_planner') {
      return [...commonMetrics, ...plannerMetrics];
    } else {
      return [...commonMetrics];
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white w-[90vw] h-[90vh] rounded-lg shadow-xl p-4 relative overflow-auto">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-3xl font-bold mb-4 text-center">Real-time Weather Search</h2>

        {/* Input Mode Toggle */}
        <div className="mb-4 flex items-center justify-center space-x-4">
          <label>
            <input
              type="radio"
              name="mode"
              checked={mode === 'city'}
              onChange={() => setMode('city')}
              className="mr-1"
            />
            City
          </label>
          <label>
            <input
              type="radio"
              name="mode"
              checked={mode === 'coords'}
              onChange={() => setMode('coords')}
              className="mr-1"
            />
            Coordinates (in decimal degrees)
          </label>
          <label>
            <input
              type="radio"
              name="mode"
              checked={mode === 'suburb'}
              onChange={() => setMode('suburb')}
              className="mr-1"
            />
            Suburb
          </label>
        </div>

        {/* Input Fields */}
        <form
          onSubmit={(e) => {
            e.preventDefault(); // Prevent page reload
            fetchWeather();     // Call your search function
          }}
          className="flex space-x-4 mb-4 items-center justify-center"
        >
          {mode === 'city' ? (
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city name"
              className="border p-2 w-full max-w-md mb-4 rounded"
            />
          ) : mode === 'coords' ? (
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
          ) : (
            <input
              type="text"
              value={suburb}
              onChange={(e) => setSuburb(e.target.value)}
              placeholder="Enter suburb name"
              className="border p-2 w-full max-w-md mb-4 rounded"
            />
          )}

          <button type="submit" className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Search
          </button>
        </form>

        {/* Output Section */}
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

        {weatherData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="bg-gradient-to-br from-blue-900 to-blue-500 text-white p-6 rounded-xl shadow-md">
            <div className="flex justify-center items-center mb-3 ">
                <h3 className="text-3xl font-semibold">{displayLocation}, {weatherData.location.country}</h3>
            </div>
            <div className="flex justify-center items-center mb-3 space-x-30">
              <div className="flex items-center space-x-2">
                <img src={`https:${weatherData.current.condition.icon}`} alt={weatherData.current.condition.text} className="w-30 h-30" />
                <div className="text-xl">{weatherData.current.condition.text}</div>
              </div>
              <div className="text-4xl font-bold w-30">{weatherData.current.temp_c}°C</div>
            </div>
            <div className="bg-gradient-to-br from-cyan-100 via-blue-100 to-indigo-100 p-6 mx-auto w-full max-w-md text-center rounded-xl text-black  shadow-md">
            <h4 className="text-3xl font-semibold mb-10 underline">Weather Details</h4>
                <div className="text-lg grid grid-cols-2 gap-y-10 gap-x-6">
                  {getMetricsForRole().map((metric, index) => (
                    <p key={index}>{metric.label}: {metric.value}</p>
                  ))}
                </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-200 via-red-100 to-pink-100 p-10 rounded-2xl shadow-lg text-sm text-gray-800 space-y-10">
            <div className="text-center text-3xl font-medium mb-5">
              🕒 Local Time: {weatherData.location.localtime}
            </div>
            {/* ☀️ Sun Arc */}
            <div>
              <h3 className="text-lg font-semibold text-center mb-2">Sun Path</h3>
              <div className="relative w-full h-32">
                <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-full">
                  <path
                    id="sunArcPath"
                    d="M 0 40 Q 50 -10 100 40"
                    fill="rgba(255, 223, 96, 0.3)"
                    stroke="#f59e0b"
                    strokeWidth="2"
                  />
                </svg>
                <div className="absolute left-0 top-[85%] text-sm">🌅 {weatherData.forecast.forecastday[0].astro.sunrise}</div>
                <div className="absolute right-0 top-[85%] text-sm">🌇 {weatherData.forecast.forecastday[0].astro.sunset}</div>
                <div
                  key={`sun-${animationKey}`}
                  className="absolute top-[20%] text-xl"
                  style={{
                    left: weatherData ? `${getSunProgress()}%` : '0%',
                    transform: 'translateX(-50%)',
                    animation: 'moveSun 3s ease-out'
                  }}
                >
                  ☀️
                </div>
              </div>
            </div>

            {/* 🌙 Moon Arc */}
            {weatherData.forecast.forecastday[0].astro.is_moon_up === 1 && (
              <div>
                <h3 className="text-lg font-semibold text-center mb-2">Moon Path</h3>
                <div className="relative w-full h-32">
                  <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-full">
                    <path
                      id="moonArcPath"
                      d="M 0 40 Q 50 -10 100 40"
                      fill="rgba(190, 224, 255, 0.3)"
                      stroke="#3b82f6"
                      strokeWidth="2"
                    />
                  </svg>
                  <div className="absolute left-0 top-[85%] text-sm">🌙 {weatherData.forecast.forecastday[0].astro.moonrise}</div>
                  <div className="absolute right-0 top-[85%] text-sm">🌘 {weatherData.forecast.forecastday[0].astro.moonset}</div>
                  <div
                    key={`moon-${animationKey}`}
                    className="absolute top-[20%] text-xl"
                    style={{
                      left: weatherData ? `${getMoonProgress()}%` : '0%',
                      transform: 'translateX(-50%)',
                      animation: 'moveMoon 3s ease-out'
                    }}
                  >
                    🌕
                  </div>
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
