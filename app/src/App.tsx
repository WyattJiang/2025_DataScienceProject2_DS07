import React, { useState, useEffect } from 'react';
// modify by AMOS for integrating front end and back end mongodb API connection line(1)//

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { LatLngExpression } from 'leaflet';
import { 
  Calendar, 
  BarChart2, 
  MessageSquare, 
  Bell, 
  Settings, 
  Filter, 
  MoreHorizontal,
  ChevronDown,
  User,
} from 'lucide-react';

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const WeatherDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState({ start: '10-03-2025', end: '17-03-2025' });

  // ==== ADDED CODE: fetch movie data from backend and connect to frontend  by AMOS====
  const [movies, setMovies] = useState<any[]>([]); // holds movie data from backend

  useEffect(() => {
    fetch('http://localhost:3001/movies')
        .then(res => res.json())
        .then(data => {
          console.log("Fetched Movies:", data);
          setMovies(data);
        })
        .catch(err => console.error("Error fetching movies:", err));
  }, []);
// ==== END OF ADDED CODE ====


  const weatherPoints = [
    { id: 1, position: [51.505, -0.09], name: 'London', temp: '14°C', condition: 'Cloudy' },
    { id: 2, position: [40.7128, -74.006], name: 'New York', temp: '18°C', condition: 'Sunny' },
    { id: 3, position: [35.6762, 139.6503], name: 'Tokyo', temp: '22°C', condition: 'Rainy' },
    { id: 4, position: [-33.8688, 151.2093], name: 'Sydney', temp: '27°C', condition: 'Clear' }
  ];


  return (
    <div className="flex h-screen bg-white text-gray-800">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-4 flex items-center space-x-2">
          <div className="bg-blue-500 text-white p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          </div>
          <h1 className="font-bold text-xl">WEATHER</h1>
        </div>
        
        {/* Menu Items */}
        <nav className="flex-1 p-4">
          <ul className="space-y-4">
            <li>
              <button 
                className="w-full text-left p-2 bg-blue-50 text-blue-600 rounded-md flex items-center" 
                onClick={() => console.log('Dashboard clicked')}
              >
                <div className="mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
                Dashboard
              </button>
            </li>
            <li>
              <button 
                className="w-full text-left p-2 text-gray-500 hover:bg-gray-100 rounded-md flex items-center" 
                onClick={() => console.log('Analytics clicked')}
              >
                <BarChart2 className="mr-3 h-5 w-5" />
                Analytics
              </button>
            </li>
            <li>
              <button 
                className="w-full text-left p-2 text-gray-500 hover:bg-gray-100 rounded-md flex items-center" 
                onClick={() => console.log('Dashboard 2 clicked')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Dashboard
              </button>
            </li>
            <li>
              <button 
                className="w-full text-left p-2 text-gray-500 hover:bg-gray-100 rounded-md flex items-center" 
                onClick={() => console.log('Reports clicked')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Reports
              </button>
            </li>
            <li>
              <button 
                className="w-full text-left p-2 text-gray-500 hover:bg-gray-100 rounded-md flex items-center" 
                onClick={() => console.log('Calendar clicked')}
              >
                <Calendar className="mr-3 h-5 w-5" />
                Calendar
              </button>
            </li>
            <li>
              <button 
                className="w-full text-left p-2 text-gray-500 hover:bg-gray-100 rounded-md flex items-center justify-between" 
                onClick={() => console.log('Messages clicked')}
              >
                <div className="flex items-center">
                  <MessageSquare className="mr-3 h-5 w-5" />
                  Messages
                </div>
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">49</span>
              </button>
            </li>
            <li>
              <button 
                className="w-full text-left p-2 text-gray-500 hover:bg-gray-100 rounded-md flex items-center" 
                onClick={() => console.log('Notification clicked')}
              >
                <Bell className="mr-3 h-5 w-5" />
                Notification
              </button>
            </li>
            <li>
              <button 
                className="w-full text-left p-2 text-gray-500 hover:bg-gray-100 rounded-md flex items-center" 
                onClick={() => console.log('Settings clicked')}
              >
                <Settings className="mr-3 h-5 w-5" />
                Settings
              </button>
            </li>
          </ul>
        </nav>
        
        {/* User Profile */}
        <div className="p-4 border-t border-gray-200 flex items-center">
          <User className="mr-3 h-5 w-5" />
          <div className="ml-3">
            <p className="text-sm font-medium">John Elisa</p>
            <p className="text-xs text-gray-500">Free Account</p>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex justify-between items-center p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold">Dashboard</h1>
          <div className="flex items-center space-x-2">
            <button 
              className="flex items-center border rounded-md p-2" 
              onClick={() => console.log('Start date clicked')}
            >
              <span>{dateRange.start}</span>
              <ChevronDown className="w-4 h-4 ml-1" />
            </button>
            <button 
              className="flex items-center border rounded-md p-2" 
              onClick={() => console.log('End date clicked')}
            >
              <span>{dateRange.end}</span>
              <ChevronDown className="w-4 h-4 ml-1" />
            </button>
          </div>
        </header>
        
        {/* Rest of the component remains unchanged */}
        <div className="flex-1 p-4 overflow-auto">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">DASHBOARD</h2>
              <div className="flex items-center">
                <button className="flex items-center text-gray-600 mr-2 p-2">
                  <Filter className="w-5 h-5 mr-1" />
                  FILTERS
                </button>
                <button className="text-gray-400 p-2">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className='grid grid-cols-3 gap-4 h-100'>
              <div className="h-full rounded-md overflow-hidden border border-gray-200 col-span-2">
                <MapContainer
                  center={[20, 0] as LatLngExpression}
                  zoom={2}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attributionControl={true}
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {weatherPoints.map(point => (
                    <Marker
                      key={point.id}
                      position={point.position as [number, number]}
                    >
                      <Popup>
                        <div className="p-1">
                          <h3 className="font-bold">{point.name}</h3>
                          <p>Temperature: {point.temp}</p>
                          <p>Condition: {point.condition}</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
              <div className="grid grid-cols-1 gap-2 mb-4 mt-2 p-2">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" className="h-4 w-4 text-blue-600" defaultChecked />
                  <span>Location</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" className="h-4 w-4 text-blue-600" defaultChecked />
                  <span>Suburb</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" className="h-4 w-4 text-blue-600" defaultChecked />
                  <span>Date</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" className="h-4 w-4 text-blue-600" defaultChecked />
                  <span>Temperature</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">PREDICTION</h3>
                <button className="text-gray-400">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
              <div className="relative h-64">
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
                  <span>100</span>
                  <span>80</span>
                  <span>60</span>
                  <span>40</span>
                  <span>20</span>
                  <span>0</span>
                </div>
                <div className="ml-8 h-full relative">
                  <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-full z-10">
                    <div className="bg-gray-900 text-white px-2 py-1 rounded text-center text-xs">
                      <div>TEMP °C</div>
                      <div className="text-lg font-bold">22</div>
                    </div>
                  </div>
                  <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                    <path d="M0,100 C50,140 100,60 150,50 S200,120 250,150 S300,80 350,40 S400,60 450,20" 
                          stroke="#8B5CF6" 
                          strokeWidth="3" 
                          fill="none" />
                    <path d="M0,80 C50,120 100,30 150,60 S220,130 250,90" 
                          stroke="#60A5FA" 
                          strokeWidth="3" 
                          fill="none" />
                  </svg>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>10am</span>
                    <span>11am</span>
                    <span>12am</span>
                    <span>01am</span>
                    <span>02am</span>
                    <span>03am</span>
                    <span>04am</span>
                    <span>05am</span>
                    <span>06am</span>
                    <span>07am</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">FORECAST</h3>
                <button className="text-gray-400">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
              <div className="flex space-x-2 overflow-x-auto py-2">
                {[
                  { time: '12 AM', temp: '19°', rain: '30%', current: false },
                  { time: 'Now', temp: '19°', rain: '', current: true },
                  { time: '2 AM', temp: '18°', rain: '', current: false },
                  { time: '3 AM', temp: '19°', rain: '', current: false },
                  { time: '4 AM', temp: '19°', rain: '', current: false },
                  { time: '5 AM', temp: '19°', rain: '', current: false },
                ].map((item, index) => (
                  <div 
                    key={index} 
                    className={`flex-shrink-0 w-20 h-28 rounded-full flex flex-col items-center justify-between p-2 ${
                      item.current ? 'bg-indigo-700 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span className="text-sm">{item.time}</span>
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                          <path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round" />
                        </svg>
                        {item.rain && (
                          <span className="absolute -bottom-2 -right-2 text-xs font-medium">{item.rain}</span>
                        )}
                      </div>
                    </div>
                    <span className="text-lg font-medium">{item.temp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherDashboard;