// src/App.tsx (or WeatherDashboard.tsx) - Main Orchestrator
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import 'leaflet/dist/leaflet.css';
import L, { LatLngExpression, StyleFunction, LeafletMouseEvent } from 'leaflet';
import * as h3 from 'h3-js';
import { FeatureCollection } from 'geojson';
import {
  Settings, Filter, User, Map as MapIcon, Thermometer, Droplets,
  Flame, Sun, Tractor, Building, X, Download, MessageSquare, ArrowLeft, LogOut, Users, Building2, CheckSquare, Square, LogIn, Save // Added/Ensured icons
} from 'lucide-react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'; // Added MapContainer etc imports here
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GoogleGenerativeAI } from '@google/generative-ai';

//ADDED FOR TREND GRAPH
import { ChartLine } from 'lucide-react';

// Import Config and Role Types - *** Corrected: Removed DEFAULT_ROLE import ***
import {
    UserRole, ROLES_CONFIG, getConfigForRole,
    INITIAL_H3_RESOLUTION, INITIAL_ACTIVE_LAYERS
} from './config';

// Import Page/UI Components (kept separate)
import TrendGraphPanel from './TrendGraphPanel'; //ADDED FOR TREND GRAPH
import LoginPage from './LoginPage'; // Handles login UI
import ProfilePage from './ProfilePage'; // Handles profile/role selection UI
// Import ChatPage if needed by ChatPanel
import ChatPage from './ChatPage';


// --- Constants ---
const CLAYTON_COORDS: LatLngExpression = [-37.9150, 145.1290];
const MAP_CENTER = CLAYTON_COORDS;
const INITIAL_ZOOM = 14;

// --- Mock Data Generation (Using gridDisk) ---
const generateMockHexDataForClayton = (resolution: number): { [key: string]: any } => {
    console.log(`Generating hex data for H3 resolution: ${resolution}`);
    const kRingSize = resolution <= 8 ? 5 : (resolution <= 10 ? 3 : 2);
    const centerHex = h3.latLngToCell(CLAYTON_COORDS[0], CLAYTON_COORDS[1], resolution);
    const hexIndexes = h3.gridDisk(centerHex, kRingSize);
    const data: { [key: string]: any } = {};
    hexIndexes.forEach((index) => {
        if (!index) return;
        const [lat, lon] = h3.cellToLatLng(index);
        const boundary = h3.cellToBoundary(index);
        const coordinates = boundary.map(([bLat, bLng]) => [bLng, bLat]);
        const tempVariance = 5 / (resolution > 5 ? resolution - 5 : 1);
        data[index] = {
            h3Index: index,
            coordinates: coordinates,
            lat, lon,
            temperature: 18 + Math.random() * tempVariance,
            soilMoisture: 0.2 + Math.random() * 0.4,
            rainfall_24h: Math.random() * (resolution < 10 ? 5 : 3),
            frostRisk: Math.random() < 0.1 ? 'Moderate' : 'Low',
            gdd: 8 + Math.random() * 2,
            fireRiskIndex: 5 + Math.random() * (resolution < 9 ? 30 : 15),
            urbanHeatIntensity: resolution > 9 ? (1.0 + Math.random() * 2.0) : (0.5 + Math.random() * 1.0),
            airQualityIndex: 20 + Math.random() * 30,
            windSpeed: Math.random() * 15,
            floodRisk: Math.random() < 0.02 ? 'Low' : 'Very Low',
            solarIrradiance: 4 + Math.random() * 1.5,
            historicalTemp: Array.from({ length: 12 }, (_, i) => ({ month: i + 1, avgTemp: 12 + Math.random() * 8 + Math.sin(i / 1.9) * 6 })),
            projectedTempChange: 0,
        };
    });
    console.log(`Generated ${Object.keys(data).length} hexagons.`);
    return data;
};


// --- Helper Functions (Color Scales) ---
const getTemperatureColor = (temp: number): string => {
  if (temp < 10) return '#6366f1'; // Indigo
  if (temp < 15) return '#22c55e'; // Green-500
  if (temp < 20) return '#16a34a'; // Green-600
  if (temp < 25) return '#f59e0b'; // Amber
  return '#ef4444'; // Red
};

const getSoilMoistureColor = (moisture: number): string => {
  if (moisture < 0.2) return '#ca8a04'; // Yellow-700 (Dry)
  if (moisture < 0.4) return '#a16207'; // Yellow-800
  if (moisture < 0.6) return '#059669'; // Emerald-600
  if (moisture < 0.8) return '#047857'; // Emerald-700
  return '#065f46'; // Emerald-800 (Wet)
};

const getFireRiskColor = (index: number): string => {
  if (index < 12) return '#22c55e'; // Green (Low)
  if (index < 25) return '#facc15'; // Yellow (Moderate)
  if (index < 50) return '#f97316'; // Orange (High)
  if (index < 100) return '#dc2626'; // Red (Extreme)
  return '#8b0000'; // Dark Red (Code Red)
};

const getUrbanHeatColor = (intensity: number): string => {
  if (intensity < 1) return '#bfdbfe'; // Blue-200
  if (intensity < 2) return '#fef08a'; // Yellow-200
  if (intensity < 3) return '#fed7aa'; // Orange-200
  if (intensity < 4) return '#fecaca'; // Red-200
  return '#fca5a5'; // Red-300 (Higher Intensity)
};
// (Paste your color functions here)


// --- Main App Component ---
const WeatherDashboard: React.FC = () => {
  // Authentication & Page State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [activeAppPage, setActiveAppPage] = useState<'login' | 'dashboard' | 'profile' | 'chatbot'>('login');

  // Role & Map Configuration State
  // *** Corrected: Use literal 'general_public' as default role ***
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('general_public');
  const [h3Resolution, setH3Resolution] = useState<number>(INITIAL_H3_RESOLUTION);
  const [activeLayers, setActiveLayers] = useState<{ [key: string]: boolean }>(INITIAL_ACTIVE_LAYERS);

  // Map Data & Interaction State
  const [hexData, setHexData] = useState<{ [key: string]: any }>({});
  const [selectedHex, setSelectedHex] = useState<any | null>(null);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Prediction Model
  const genAI = new GoogleGenerativeAI("AIzaSyDn_pPZRN1RihRU1Dk63rygqPXDTvqVVJI");
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-based
    const day = today.getDate().toString().padStart(2, '0'); // Day is 1-based
    return `${year}-${month}-${day}`; // Format to YYYY-MM-DD
  });
  const [isLoadingHexDetail, setIsLoadingHexDetail] = useState<boolean>(false);
  const [selectedTime, setSelectedTime] = useState<string>("12:00");  // Default to noon


  // --- Data Loading Effect ---
  useEffect(() => {
    if (isLoggedIn) {
      setIsLoading(true);
      setTimeout(() => {
        setHexData(generateMockHexDataForClayton(h3Resolution));
        setIsLoading(false);
      }, 150);
    } else {
      setHexData({});
    }
  }, [h3Resolution, isLoggedIn]);

  // --- Handlers ---
  const handleLoginSuccess = () => {
    console.log("Login successful");
    setIsLoggedIn(true);
    // *** Corrected: Use literal 'general_public' ***
    const initialConfig = getConfigForRole('general_public');
    setCurrentUserRole('general_public');
    setH3Resolution(initialConfig.h3Resolution);
    setActiveLayers(initialConfig.defaultLayers);
    setActiveAppPage('dashboard');
    setSelectedHex(null);
    setActiveTool(null);
  };

  const handleLogout = () => {
    console.log("Logging out");
    setIsLoggedIn(false);
    // *** Corrected: Use literal 'general_public' ***
    setCurrentUserRole('general_public'); // Reset role state
    setActiveAppPage('login');
    setHexData({});
    setSelectedHex(null);
    setActiveTool(null);
  };

  const handleRoleChange = (newRole: UserRole) => {
    if (newRole === currentUserRole) return;
    console.log(`Role changed to: ${newRole}`);
    const newConfig = getConfigForRole(newRole);
    setCurrentUserRole(newRole);
    setH3Resolution(newConfig.h3Resolution);
    setActiveLayers(newConfig.defaultLayers);
    setSelectedHex(null);
    setActiveTool(null);
  };

  const handleNavigate = (page: 'dashboard' | 'profile' | 'chatbot') => {
     if (page === 'profile' && activeAppPage !== 'profile') {
        setSelectedHex(null);
        setActiveTool(null);
     }
     if (page === 'chatbot' && activeAppPage !== 'chatbot') {
         setSelectedHex(null);
         setActiveTool(null);
     }
     if (activeAppPage === 'chatbot' && page !== 'chatbot' && page !== 'profile') {
         // No action needed if moving from chatbot to dashboard
     }
     if (page === 'chatbot' && activeAppPage === 'chatbot') {
         setActiveAppPage('dashboard'); // Close chatbot
     } else {
         setActiveAppPage(page);
     }
  }

  const toggleLayer = (layerKey: string) => {
    setActiveLayers(prev => {
        const newActiveLayers = { ...prev };
        const currentlyActive = newActiveLayers[layerKey];
        console.log('Toggling:', layerKey, 'Was:', currentlyActive); // ✅ ADDED FOR TREND GRAPH
        Object.keys(newActiveLayers).forEach(key => { newActiveLayers[key] = false; });
        newActiveLayers[layerKey] = !currentlyActive;
        return newActiveLayers;
    });
  };

  const handleHexClick = (event: LeafletMouseEvent, feature: any) => {
    const h3Index = feature.properties.h3Index;
    L.DomEvent.stopPropagation(event);
    setSelectedHex(hexData[h3Index] || null);
    setActiveTool(null);
    if (activeAppPage === 'chatbot') {
       setActiveAppPage('dashboard');
    }
  };

  // Add this function to handle button click
  const handleProjectionInClick = async () => {
    if (!selectedHex) return;

    const { lat, lon } = selectedHex;

    try {
      setIsLoadingHexDetail(true);  // Start mini loading in Hex Detail Panel

      const prompt =
      "Give me an educated guess of the average maximum (NO EXPLANATION) temperature for this \ndate: "+selectedDate+
      "\ntime:"+selectedTime+"\nlatitude:"+lat+"\nlongitude: "+lon+
      "\nDo account for global warming if date chosen is in the future";
      const result = await model.generateContent(prompt);
      const response = await result.response;
      console.log(prompt)
      console.log("This is the new projected temp: "+response.text());
      // Extract the numeric temperature change from the response
      let tempChange = 0;
      let tempchgstr = "";

      // Loop through each character in the responseText and extract numeric characters
      for (let char of response.text()) {
        if (/\-|\d|\./.test(char)) {  // Check if character is a number
          tempchgstr += char;
        }
      }
      // Convert the extracted string to an integer
      tempChange = parseFloat(tempchgstr);
      // console.log(tempChange)
      if (!isNaN(tempChange)) {
        const updatedHexData = {
          ...selectedHex,
          projectedTempChange: tempChange,
        };

        // Update hex data state
        setSelectedHex(updatedHexData);
      } else {
        const updatedHexData = {
          ...selectedHex,
          projectedTempChange: 22 + Math.random() * 1 + Math.random() * 0.5,  // Set the projected temperature change
        };

        // Update hex data state
        setSelectedHex(updatedHexData);  // Update selectedHex with a random temp change
      }
    } catch (error) {
      console.error("Error predicting temperature change:", error);
    } finally {
      setIsLoadingHexDetail(false);  // End mini loading in Hex Detail Panel
    }
  };



  const closeDetails = () => setSelectedHex(null);
  const closeChatbot = () => {
      if (activeAppPage === 'chatbot') {
          setActiveAppPage('dashboard');
      }
  };

  // --- Map Styling and Interaction Callbacks ---
  const geoJsonStyle: StyleFunction = useCallback((feature) => {
    const h3Index = feature?.properties?.h3Index;
    const data = h3Index ? hexData[h3Index] : null;
    let fillColor = '#A0A0A0', fillOpacity = 0.0, strokeColor = '#808080', strokeWeight = 0.5;

    if (data && !isLoading) {
      fillOpacity = 0.35; fillColor = '#B0B0B0'; strokeWeight = 0.75;
      let layerApplied = false;
      if (activeLayers.temperature && data.temperature !== undefined) { fillColor = getTemperatureColor(data.temperature); layerApplied = true; }
      else if (activeLayers.soilMoisture && data.soilMoisture !== undefined) { fillColor = getSoilMoistureColor(data.soilMoisture); layerApplied = true; }
      else if (activeLayers.fireRiskIndex && data.fireRiskIndex !== undefined) { fillColor = getFireRiskColor(data.fireRiskIndex); layerApplied = true; }
      else if (activeLayers.urbanHeatIntensity && data.urbanHeatIntensity !== undefined) { fillColor = getUrbanHeatColor(data.urbanHeatIntensity); layerApplied = true; }
      fillOpacity = layerApplied ? 0.65 : 0.35;

      if ((activeAppPage === 'dashboard' || activeAppPage === 'chatbot') && selectedHex && h3Index === selectedHex.h3Index) {
        fillOpacity = Math.min(fillOpacity + 0.3, 0.9); strokeColor = '#0000FF'; strokeWeight = 2.5;
      }
    } else if (isLoading) {
        fillColor = '#E0E0E0'; fillOpacity = 0.1; strokeWeight = 0.2;
    }
    return { fillColor, fillOpacity, color: strokeColor, weight: strokeWeight, opacity: 1 };
  }, [hexData, activeLayers, selectedHex, activeAppPage, isLoading]);

  const onEachFeature = useCallback((feature: any, layer: L.Layer) => {
    layer.on({ click: (e) => handleHexClick(e, feature) });
    const props = feature.properties;
    let popupContent = `<b>Hex: ${props.h3Index ? props.h3Index.substring(props.h3Index.length - 4) : 'N/A'} (Res ${h3Resolution})</b>`;
    if (activeLayers.temperature && props.temperature !== undefined) popupContent += `<br/>Temp: ${props.temperature.toFixed(1)}°C`;
    if (activeLayers.soilMoisture && props.soilMoisture !== undefined) popupContent += `<br/>Soil Moist.: ${props.soilMoisture.toFixed(2)}`;
    if (activeLayers.fireRiskIndex && props.fireRiskIndex !== undefined) popupContent += `<br/>Fire Idx: ${props.fireRiskIndex.toFixed(0)}`;
    if (activeLayers.urbanHeatIntensity && props.urbanHeatIntensity !== undefined) popupContent += `<br/>Heat Int.: ${props.urbanHeatIntensity.toFixed(1)}°C diff`;
    layer.bindPopup(popupContent);
  }, [h3Resolution, activeLayers, hexData]); // handleHexClick is stable

  // --- Memoized GeoJSON Data ---
  const hexGeoJson: FeatureCollection | null = useMemo(() => {
    if (isLoading || Object.keys(hexData).length === 0) return null;
    const features = Object.values(hexData).map((hex) => ({
      type: 'Feature' as const,
      properties: { ...hex },
      geometry: { type: 'Polygon' as const, coordinates: [[...hex.coordinates, hex.coordinates[0]]] },
    }));
    return { type: 'FeatureCollection' as const, features: features };
  }, [hexData, isLoading]);

  // --- Render Logic ---
  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} appName="Climates" />;
  }

  // --- Logged In View ---
  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 font-sans antialiased">

      {/* --- Sidebar (Inlined) --- */}
      <div className="w-60 border-r border-gray-200 bg-white flex flex-col shadow-sm flex-shrink-0">
          {/* ... (Sidebar JSX remains the same as previous correct version) ... */}
           {/* Logo */}
            <div className="p-4 flex items-center space-x-2 border-b border-gray-200">
               <div className="bg-blue-600 text-white p-2 rounded-lg shadow">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
               </div>
               <h1 className="font-bold text-lg text-gray-700">Climates</h1>
            </div>
            {/* Menu Items */}
            <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
              <div className="pt-2">
                <h3 className="px-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Views</h3>
                <button onClick={() => handleNavigate('dashboard')} className={`w-full text-left p-2.5 text-sm rounded-md flex items-center transition-colors duration-150 ${ activeAppPage === 'dashboard' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600' }`}>
                    <MapIcon className="mr-3 h-5 w-5 flex-shrink-0" /> Map Dashboard
                </button>
                <button onClick={() => handleNavigate('chatbot')} className={`w-full text-left p-2.5 text-sm rounded-md flex items-center transition-colors duration-150 ${ activeAppPage === 'chatbot' ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-600 hover:bg-gray-100' }`}>
                    <MessageSquare className="mr-3 h-5 w-5 flex-shrink-0" /> Chat Assistant
                </button>
              </div>

                {/* ADDED FOR TREND GRAPH */}
                <div className="pt-2">
                    <h3 className="px-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Trend Graph</h3>
                    <button
                        onClick={() => toggleLayer('trendGraph')}
                        className={`w-full text-left p-2.5 text-sm rounded-md flex items-center transition-colors duration-150 ${
                            activeLayers.trendGraph ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        <ChartLine className="mr-3 h-5 w-5 flex-shrink-0" /> Trend Graphs
                    </button>
                </div>


                <div className="pt-2">
                 <h3 className="px-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Data Layers</h3>
                 {Object.keys(ROLES_CONFIG.general_public.defaultLayers).map(layerKey => {
                     const Icon = { temperature: Thermometer, soilMoisture: Droplets, fireRiskIndex: Flame, urbanHeatIntensity: Sun }[layerKey] || Filter;
                     const title = layerKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                     const colors = activeLayers[layerKey]
                         ? { temperature: 'bg-blue-100 text-blue-700 font-medium', soilMoisture: 'bg-green-100 text-green-700 font-medium', fireRiskIndex: 'bg-red-100 text-red-700 font-medium', urbanHeatIntensity: 'bg-yellow-100 text-yellow-700 font-medium' }[layerKey] || 'bg-gray-200 text-gray-800 font-medium'
                         : 'text-gray-600 hover:bg-gray-100';
                     return ( <button key={layerKey} onClick={() => toggleLayer(layerKey)} className={`w-full text-left p-2.5 text-sm rounded-md flex items-center transition-colors duration-150 ${colors}`}> <Icon className="mr-3 h-5 w-5 flex-shrink-0" /> {title} </button> );
                 })}


              </div>
              <div className="pt-2">
                <h3 className="px-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Decision Tools</h3>
                <button onClick={() => { if (selectedHex) setActiveTool('cropPlanner');}} disabled={!selectedHex || isLoading} className={`w-full text-left p-2.5 text-sm rounded-md flex items-center transition-colors duration-150 ${!selectedHex || isLoading ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}>
                    <Tractor className="mr-3 h-5 w-5 flex-shrink-0" /> Crop Planner {currentUserRole === 'farmer' && '*'}
                </button>
                <button onClick={() => { if (selectedHex) setActiveTool('heatMitigation');}} disabled={!selectedHex || isLoading} className={`w-full text-left p-2.5 text-sm rounded-md flex items-center transition-colors duration-150 ${!selectedHex || isLoading ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}>
                    <Building className="mr-3 h-5 w-5 flex-shrink-0" /> Heat Mitigation {currentUserRole === 'urban_planner' && '*'}
                </button>
              </div>
              <button className="w-full text-left p-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md flex items-center transition-colors duration-150 mt-4">
                <Settings className="mr-3 h-5 w-5 flex-shrink-0" /> Settings
              </button>
            </nav>
            {/* User Profile / Logout Section */}
            <div className="p-3 border-t border-gray-200 mt-auto">
              <div className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${activeAppPage === 'profile' ? 'bg-indigo-100' : 'bg-gray-50 hover:bg-gray-100'}`} onClick={() => handleNavigate('profile')} title="Go to User Profile & Role Selection">
                <div className="p-1.5 bg-indigo-100 rounded-full mr-2.5">
                    {currentUserRole === 'farmer' ? <Tractor className="h-5 w-5 text-indigo-600"/> : currentUserRole === 'urban_planner' ? <Building2 className="h-5 w-5 text-indigo-600"/> : <Users className="h-5 w-5 text-indigo-600"/>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${activeAppPage === 'profile' ? 'text-indigo-800' : 'text-gray-800'}`} title="demo_user"> demo_user </p>
                  <p className="text-xs text-gray-500 truncate" title={getConfigForRole(currentUserRole).displayName}> {getConfigForRole(currentUserRole).displayName} </p>
                </div>
              </div>
              <button onClick={handleLogout} className="mt-2 w-full text-left p-2 text-sm text-red-600 hover:bg-red-50 rounded-md flex items-center transition-colors duration-150">
                <LogOut className="mr-2 h-4 w-4 flex-shrink-0" /> Logout
              </button>
            </div>
      </div> {/* End Sidebar */}


      {/* --- Main Content Area --- */}
      <div className="flex-1 flex flex-col overflow-hidden relative">

        {/* --- Header (Inlined) --- */}
        <header className="flex justify-between items-center p-3 border-b border-gray-200 bg-white shadow-sm z-10 flex-shrink-0 h-16" style={{ '--header-height': '4rem' } as React.CSSProperties}>
            {/* ... (Header JSX remains the same as previous correct version) ... */}
            <h1 className="text-lg font-semibold text-gray-800">
                {activeAppPage === 'dashboard' && 'Map Dashboard'}
                {activeAppPage === 'chatbot' && 'Chat Assistant'}
                {activeAppPage === 'profile' && 'User Profile & Role'}
            </h1>
            {(activeAppPage === 'dashboard' || activeAppPage === 'chatbot') && (
                <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500" title={`Current H3 Resolution for ${getConfigForRole(currentUserRole).displayName}`}> Res: {h3Resolution} </span>
                <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md" title="Filter (Placeholder)"> <Filter className="w-5 h-5" /> </button>
                </div>
            )}
            {activeAppPage === 'profile' && (
                <button onClick={() => handleNavigate('dashboard')} className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md flex items-center text-sm" title="Back to Dashboard"> <ArrowLeft className="w-4 h-4 mr-1"/> Back </button>
            )}
        </header>

        {/* --- Content: Map, Profile, Panels --- */}
        <div className="flex-1 relative bg-gray-100 overflow-hidden">
          {/* --- Profile Page View --- */}
          {activeAppPage === 'profile' && (
            <ProfilePage currentUserRole={currentUserRole} onRoleChange={handleRoleChange} onBackToDashboard={() => handleNavigate('dashboard')} />
          )}

          {/* --- Map View Container (Consolidated) --- */}
          {(activeAppPage === 'dashboard' || activeAppPage === 'chatbot') && (
            <MapContainer
              key={`map-${currentUserRole}-${h3Resolution}`}
              center={MAP_CENTER}
              zoom={INITIAL_ZOOM}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
              className={isLoading ? 'opacity-50 transition-opacity duration-300' : 'opacity-100 transition-opacity duration-300'}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
              {!isLoading && hexGeoJson && hexGeoJson.features.length > 0 && (
                <GeoJSON
                  key={`geojson-${h3Resolution}-${JSON.stringify(activeLayers)}-${selectedHex?.h3Index || 'none'}`}
                  data={hexGeoJson}
                  style={geoJsonStyle}
                  onEachFeature={onEachFeature}
                />
              )}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-400 bg-opacity-30 z-[1001]">
                  <div className="text-white bg-black bg-opacity-60 px-4 py-2 rounded">Loading Map Data (Res {h3Resolution})...</div>
                </div>
              )}
            </MapContainer>
          )}

          {/* --- Panels (Render on top of Map view) --- */}

          {/* Chat Panel (Inlined) */}
          {activeAppPage === 'chatbot' && (
              <div className="absolute top-[calc(var(--header-height)+0.5rem)] lg:top-2 right-2 bottom-2 w-full max-w-sm lg:w-80 max-h-[calc(100%-var(--header-height)-1rem)] lg:max-h-[calc(100vh-5rem)] bg-white shadow-lg rounded-lg border border-gray-200 flex flex-col z-[1000]">
                 {/* ... (Chat Panel JSX remains the same as previous correct version) ... */}
                 <div className="flex justify-between items-center p-3 border-b border-gray-200 flex-shrink-0">
                     <h3 className="text-base font-semibold text-gray-800">Chat Assistant</h3>
                     <button onClick={closeChatbot} className="text-gray-400 hover:text-gray-600 p-1" title="Close Chat"> <X className="w-5 h-5" /> </button>
                 </div>
                 <div className="flex-1 overflow-y-auto p-3"> <ChatPage /> </div>
              </div>
          )}

          {/* Hex Detail Panel (Inlined) */}
          {(activeAppPage === 'dashboard' || activeAppPage === 'chatbot') && selectedHex && !isLoading && (
              <div className="absolute top-[calc(var(--header-height)+0.5rem)] lg:top-2 right-2 bottom-2 w-full max-w-sm lg:w-80 max-h-[calc(100%-var(--header-height)-1rem)] lg:max-h-[calc(100vh-5rem)] bg-white shadow-lg rounded-lg border border-gray-200 flex flex-col z-[1000]">
                 {/* ... (Hex Detail Panel JSX remains the same as previous correct version) ... */}
                  <div className="flex justify-between items-center p-3 border-b border-gray-200 flex-shrink-0">
                      <h3 className="text-base font-semibold text-gray-800 truncate" title={selectedHex.h3Index}> Hex: {selectedHex.h3Index.substring(selectedHex.h3Index.length - 4)} (Res {h3Resolution}) </h3>
                      <button onClick={closeDetails} className="text-gray-400 hover:text-gray-600 ml-2 p-1" title="Close Details"> <X className="w-5 h-5" /> </button>
                  </div>



                  <div className="flex-1 overflow-y-auto space-y-3 text-sm p-3 pr-1 custom-scrollbar">
                      {activeTool === 'cropPlanner' && ( <div className="p-3 bg-blue-50 rounded border border-blue-200 text-sm"><h4 className="font-medium mb-1 text-blue-600">Crop Planner (Demo)</h4> Suitable for {currentUserRole === 'farmer' ? 'your needs' : 'farmers'}. GDD: {selectedHex.gdd?.toFixed(1)}, Soil: {selectedHex.soilMoisture?.toFixed(2)}...</div> )}
                      {activeTool === 'heatMitigation' && ( <div className="p-3 bg-orange-50 rounded border border-orange-200 text-sm"><h4 className="font-medium mb-1 text-orange-600">Heat Mitigation (Demo)</h4> Relevant for {currentUserRole === 'urban_planner' ? 'your analysis' : 'planners'}. Heat Intensity: {selectedHex.urbanHeatIntensity?.toFixed(1)}°C...</div> )}
                      {!activeTool && ( <>
                          <p><span className='font-medium text-gray-600 w-28 inline-block'>Coordinates:</span> {selectedHex.lat?.toFixed(5)}, {selectedHex.lon?.toFixed(5)}</p>
                          {selectedHex.temperature !== undefined && (<p><span className='font-medium text-gray-600 w-28 inline-block'>Temperature:</span> {selectedHex.temperature?.toFixed(1)} °C</p>)}
                          {selectedHex.urbanHeatIntensity !== undefined && (currentUserRole === 'urban_planner' || currentUserRole === 'general_public') && (<p><span className='font-medium text-gray-600 w-28 inline-block'>Urban Heat:</span> {selectedHex.urbanHeatIntensity?.toFixed(1)} °C diff</p>)}
                          {selectedHex.soilMoisture !== undefined && (currentUserRole === 'farmer' || currentUserRole === 'general_public') && (<p><span className='font-medium text-gray-600 w-28 inline-block'>Soil Moisture:</span> {selectedHex.soilMoisture?.toFixed(2)}</p>)}
                          {selectedHex.fireRiskIndex !== undefined && (currentUserRole === 'farmer' || currentUserRole === 'general_public') && (<p><span className='font-medium text-gray-600 w-28 inline-block'>Fire Risk Index:</span> {selectedHex.fireRiskIndex?.toFixed(0)}</p>)}
                          {selectedHex.airQualityIndex !== undefined && (<p><span className='font-medium text-gray-600 w-28 inline-block'>Air Quality:</span> {selectedHex.airQualityIndex?.toFixed(0)} AQI</p>)}
                          {selectedHex.windSpeed !== undefined && (<p><span className='font-medium text-gray-600 w-28 inline-block'>Wind Speed:</span> {selectedHex.windSpeed?.toFixed(1)} km/h</p>)}
                          {selectedHex.historicalTemp && ( <div className='mt-4 pt-4 border-t border-gray-200'> <h4 className="font-medium mb-2 text-gray-700 text-xs uppercase">Historical Avg. Temp (°C)</h4>
                          <ResponsiveContainer width="100%" height={120}>
                            <LineChart data={selectedHex.historicalTemp} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb"/>
                              <XAxis dataKey="month" fontSize={9} tick={{ fill: '#6b7280' }}/>
                              <YAxis fontSize={9} tick={{ fill: '#6b7280' }}/>
                              <Tooltip contentStyle={{fontSize: '10px', padding: '2px 5px'}} itemStyle={{fontSize: '10px', padding: '0px'}}/>
                              <Line type="monotone" dataKey="avgTemp" stroke="#3b82f6" strokeWidth={1.5} dot={{ r: 2}} name="Avg Temp" />
                            </LineChart>
                            </ResponsiveContainer>
                            {/* Projection Date Picker*/}
                            <div className="mt-4">
                              <label htmlFor="datePicker" className="text-sm font-medium text-gray-600">
                                Select a Date for Prediction:
                              </label>
                              <input
                                type="date"
                                id="datePicker"
                                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                              />
                            </div>
                            <div className="mt-4">
                              <label htmlFor="timePicker" className="text-sm font-medium text-gray-600">
                                Select a Time for Prediction:
                              </label>
                              <input
                                type="time"
                                id="timePicker"
                                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
                                value={selectedTime}  // Bind to the selectedTime state
                                onChange={(e) => setSelectedTime(e.target.value)}  // Update the state when the user selects a time
                              />
                            </div>
                            {isLoadingHexDetail ? (
                              <div className="flex justify-center items-center">
                                <div className="w-6 h-6 border-4 border-t-4 border-gray-300 border-solid rounded-full animate-spin border-t-blue-500"></div> {/* Loading spinner */}
                              </div>
                            ) : (
                              <>
                                {/* Projection Button */}
                                <div className="mt-4">
                                  <button
                                    onClick={handleProjectionInClick}
                                    className="w-full flex items-center justify-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                  >
                                    <span>Predict The Temp</span>
                                  </button>
                                </div>
                                {selectedHex.projectedTempChange && selectedHex.projectedTempChange !== 0 && (
                                  <div className="mt-4">
                                    <p className="text-sm text-gray-600">
                                      Projected Temp in {selectedDate}: <strong>{selectedHex.projectedTempChange.toFixed(1)}°C</strong>
                                    </p>
                                  </div>
                                )}

                              </>
                            )}
                            </div> )}
                      </> )}
                  </div>
                  <div className='mt-auto p-3 pt-3 border-t border-gray-200 flex-shrink-0'>
                      <button className='w-full flex items-center justify-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'>
                        <span>
                          <Download className='w-4 h-4 mr-2' />
                          Export Hex Data
                        </span>
                      </button>
                  </div>
              </div>
          )}

            {/* Trend Graph Modal (ADDED FOR TREND GRAPH) */}
            {/* Trend Graph Panel (Right Side) */}
            {/* In App.tsx where you render TrendGraphPanel */}
            {activeLayers.trendGraph && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-[1000] flex items-center justify-center">
                    <div className="bg-white w-[90vw] h-[90vh] rounded-lg shadow-xl p-4 relative overflow-hidden">
                        <button
                            onClick={() => toggleLayer('trendGraph')}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                            title="Close"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <h2 className="text-xl font-semibold mb-4">Trend Graph (Test Fullscreen)</h2>
                        <TrendGraphPanel />
                    </div>
                </div>
            )}


        </div> {/* End Content Area */}
      </div> {/* End Main Content Flex Container */}
    </div> // End Root Flex Container
  );
};

export default WeatherDashboard;

// --- Leaflet Icon Fix ---
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});