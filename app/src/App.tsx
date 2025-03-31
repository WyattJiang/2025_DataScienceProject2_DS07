import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { LatLngExpression, StyleFunction, LeafletMouseEvent } from 'leaflet';
import * as h3 from 'h3-js';
import {
  Settings,
  Filter,
  // MoreHorizontal,
  // ChevronDown,
  User,
  Map as MapIcon,
  Thermometer,
  Droplets,
  // Wind,
  Flame,
  Sun,
  Tractor,
  Building,
  X,
  Download,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- Configuration & Constants ---
const CLAYTON_COORDS: LatLngExpression = [-37.9150, 145.1290];
const MAP_CENTER = CLAYTON_COORDS;
const INITIAL_ZOOM = 14;
const H3_RESOLUTION = 10;

// --- Mock Data Generation (Focused on Clayton) ---
const generateMockHexDataForClayton = () => {
  const centerHex = h3.latLngToCell(CLAYTON_COORDS[0], CLAYTON_COORDS[1], H3_RESOLUTION);
  const hexIndexes = h3.gridDisk(centerHex, 2); // Increased radius for more hexagons
  const data: { [key: string]: any } = {};
  
  hexIndexes.forEach((index) => {
    const [lat, lon] = h3.cellToLatLng(index);
    
    // FIXED: Properly format coordinates for GeoJSON
    // h3.cellToBoundary returns [lat, lng] but GeoJSON needs [lng, lat]
    const boundary = h3.cellToBoundary(index);
    const coordinates = boundary.map(([lat, lng]) => [lng, lat]);
    
    data[index] = {
      h3Index: index,
      coordinates: coordinates, // Store the correctly formatted coordinates
      lat, lon,
      temperature: 18 + Math.random() * 5,
      soilMoisture: 0.2 + Math.random() * 0.4,
      rainfall_24h: Math.random() * 3,
      frostRisk: 'Low',
      gdd: 8 + Math.random() * 2,
      fireRiskIndex: 5 + Math.random() * 15,
      urbanHeatIntensity: 1.5 + Math.random() * 2.5,
      airQualityIndex: 20 + Math.random() * 30,
      windSpeed: Math.random() * 15,
      floodRisk: Math.random() < 0.02 ? 'Low' : 'Very Low',
      solarIrradiance: 4 + Math.random() * 1.5,
      historicalTemp: Array.from({ length: 12 }, (_, i) => ({ 
        month: i + 1, 
        avgTemp: 12 + Math.random() * 8 + Math.sin(i / 1.9) * 6 
      })),
      projectedTempChange2050: 2.0 + Math.random() * 0.5,
    };
  });
  
  console.log(`Generated ${Object.keys(data).length} hexagons around Clayton.`);
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

// --- React Component ---
const WeatherDashboard: React.FC = () => {
  const [hexData, setHexData] = useState<{ [key: string]: any }>({});
  const [activeLayers, setActiveLayers] = useState<{ [key: string]: boolean }>({
    temperature: true, 
    soilMoisture: false, 
    fireRiskIndex: false, 
    urbanHeatIntensity: false,
  });
  const [selectedHex, setSelectedHex] = useState<any | null>(null);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [, _] = useState({ start: '2025-03-30', end: '2025-04-06' });

  // --- Data Fetching (Mock for Clayton) ---
  useEffect(() => {
    setHexData(generateMockHexDataForClayton());
  }, []);

  // --- Map Styling Callback ---
  const geoJsonStyle: StyleFunction = useCallback((feature) => {
    const h3Index = feature?.properties?.h3Index;
    const data = h3Index ? hexData[h3Index] : null;

    let fillColor = '#A0A0A0'; // Neutral gray default
    let fillOpacity = 0.0; // Default to INVISIBLE if no data
    let strokeColor = '#808080'; // Default border color
    let strokeWeight = 0.5; // Default border weight

    if (data) {
      fillOpacity = 0.35; // Make VISIBLE if data exists
      fillColor = '#B0B0B0'; // Slightly lighter gray when data exists but no layer active
      strokeWeight = 0.75;

      // Apply layer-specific colors and opacity
      if (activeLayers.temperature && data.temperature !== undefined) {
        fillColor = getTemperatureColor(data.temperature);
        fillOpacity = 0.65;
      } else if (activeLayers.soilMoisture && data.soilMoisture !== undefined) {
        fillColor = getSoilMoistureColor(data.soilMoisture);
        fillOpacity = 0.65;
      } else if (activeLayers.fireRiskIndex && data.fireRiskIndex !== undefined) {
        fillColor = getFireRiskColor(data.fireRiskIndex);
        fillOpacity = 0.65;
      } else if (activeLayers.urbanHeatIntensity && data.urbanHeatIntensity !== undefined) {
        fillColor = getUrbanHeatColor(data.urbanHeatIntensity);
        fillOpacity = 0.65;
      }
    }

    // Highlight selected hexagon
    if (selectedHex && h3Index === selectedHex.h3Index) {
      fillOpacity = Math.min(fillOpacity + 0.3, 0.9); // Increase opacity further
      strokeColor = '#0000FF'; // Blue border
      strokeWeight = 2.5; // Thicker border
    }

    return {
      fillColor: fillColor,
      fillOpacity: fillOpacity,
      color: strokeColor, // Use 'color' for stroke color in Leaflet
      weight: strokeWeight, // Use 'weight' for stroke width
      opacity: 1, // Stroke opacity (usually 1)
    };
  }, [hexData, activeLayers, selectedHex]);

  // --- GeoJSON Memoization ---
  const hexGeoJson = useMemo(() => {
    // Check if we have hex data to render
    if (Object.keys(hexData).length === 0) return null;
    
    // Create GeoJSON features from hexagons
    const features = Object.values(hexData).map((hex) => ({
      type: 'Feature' as const,
      properties: {
        ...hex,
      },
      geometry: {
        type: 'Polygon' as const,
        // FIXED: GeoJSON expects coordinates as an array of linear rings
        // Make sure we're closing the polygon by duplicating the first point at the end
        coordinates: [
          [...hex.coordinates, hex.coordinates[0]]
        ],
      },
    }));

    return {
      type: 'FeatureCollection' as const,
      features: features,
    };
  }, [hexData]);

  // --- Map Interaction ---
  const handleHexClick = (event: LeafletMouseEvent, feature: any) => {
    const h3Index = feature.properties.h3Index;
    L.DomEvent.stopPropagation(event); // Prevent map click from interfering
    setSelectedHex(hexData[h3Index] || null);
    setActiveTool(null); // Reset tool on new hex selection
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
    layer.on({
      click: (e) => handleHexClick(e, feature),
    });

    // Basic Popup Content
    const props = feature.properties;
    let popupContent = `<b>Hex: ${props.h3Index ? props.h3Index.substring(8) : 'N/A'}</b>`;
    
    if (activeLayers.temperature && props.temperature !== undefined) {
      popupContent += `<br/>Temp: ${props.temperature.toFixed(1)}°C`;
    }
    if (activeLayers.soilMoisture && props.soilMoisture !== undefined) {
      popupContent += `<br/>Soil Moist.: ${props.soilMoisture.toFixed(2)}`;
    }
    if (activeLayers.fireRiskIndex && props.fireRiskIndex !== undefined) {
      popupContent += `<br/>Fire Idx: ${props.fireRiskIndex.toFixed(0)}`;
    }
    if (activeLayers.urbanHeatIntensity && props.urbanHeatIntensity !== undefined) {
      popupContent += `<br/>Heat Int.: ${props.urbanHeatIntensity.toFixed(1)}°C`;
    }

    layer.bindPopup(popupContent);
  };

  // --- Layer Toggle ---
  const toggleLayer = (layerKey: string) => {
    const newActiveLayers = Object.keys(activeLayers).reduce((acc, key) => {
      // Toggle the clicked layer; set others to false
      acc[key] = key === layerKey ? !activeLayers[key] : false;
      return acc;
    }, {} as { [key: string]: boolean });

    setActiveLayers(newActiveLayers);
  };

  // --- Close Detail Panel ---
  const closeDetails = () => {
    setSelectedHex(null);
    setActiveTool(null);
  };

  // --- Render ---
  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 font-sans">
      {/* --- Sidebar --- */}
      <div className="w-60 border-r border-gray-200 bg-white flex flex-col shadow-sm flex-shrink-0">
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
          <button className="w-full text-left p-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md flex items-center transition-colors duration-150">
            <MapIcon className="mr-3 h-5 w-5 flex-shrink-0" /> Map Dashboard
          </button>

          {/* Layer Controls */}
          <div className="pt-2">
            <h3 className="px-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Data Layers</h3>
            {Object.keys(activeLayers).map(layerKey => {
              const Icon = {
                temperature: Thermometer,
                soilMoisture: Droplets,
                fireRiskIndex: Flame,
                urbanHeatIntensity: Sun,
              }[layerKey] || Filter;
              
              const title = layerKey
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase());

              const colors = activeLayers[layerKey]
                ? {
                    temperature: 'bg-blue-100 text-blue-700 font-medium',
                    soilMoisture: 'bg-green-100 text-green-700 font-medium',
                    fireRiskIndex: 'bg-red-100 text-red-700 font-medium',
                    urbanHeatIntensity: 'bg-yellow-100 text-yellow-700 font-medium',
                  }[layerKey] || 'bg-gray-200 text-gray-800 font-medium'
                : 'text-gray-600 hover:bg-gray-100';

              return (
                <button
                  key={layerKey}
                  onClick={() => toggleLayer(layerKey)}
                  className={`w-full text-left p-2.5 text-sm rounded-md flex items-center transition-colors duration-150 ${colors}`}
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" /> {title}
                </button>
              );
            })}
          </div>

          {/* Tools */}
          <div className="pt-2">
            <h3 className="px-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Decision Tools</h3>
            <button 
              onClick={() => { if (selectedHex) setActiveTool('cropPlanner');}} 
              disabled={!selectedHex} 
              className={`w-full text-left p-2.5 text-sm rounded-md flex items-center transition-colors duration-150 ${!selectedHex ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Tractor className="mr-3 h-5 w-5 flex-shrink-0" /> Crop Planner
            </button>
            <button 
              onClick={() => { if (selectedHex) setActiveTool('heatMitigation');}} 
              disabled={!selectedHex} 
              className={`w-full text-left p-2.5 text-sm rounded-md flex items-center transition-colors duration-150 ${!selectedHex ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Building className="mr-3 h-5 w-5 flex-shrink-0" /> Heat Mitigation
            </button>
          </div>

          {/* Settings */}
          <button className="w-full text-left p-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md flex items-center transition-colors duration-150 mt-4">
            <Settings className="mr-3 h-5 w-5 flex-shrink-0" /> Settings
          </button>
        </nav>

        {/* User Profile */}
        <div className="p-3 border-t border-gray-200 mt-auto">
          <div className="flex items-center p-2 bg-gray-50 rounded-md">
            <div className="p-1.5 bg-indigo-100 rounded-full">
              <User className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="ml-2.5">
              <p className="text-sm font-medium text-gray-800">Jayden 💅💅💅</p>
              <p className="text-xs text-gray-500">Clayton Demo</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- Main Content --- */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="flex justify-between items-center p-3 border-b border-gray-200 bg-white shadow-sm z-10 flex-shrink-0">
          <h1 className="text-lg font-semibold text-gray-800">Clayton - Weather Hex Grid</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">H3 Res: {H3_RESOLUTION}</span>
            <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Map Area */}
        <div className="flex-1 relative bg-gray-100">
          <MapContainer
            center={MAP_CENTER}
            zoom={INITIAL_ZOOM}
            style={{ height: '100%', width: '100%'}}
            scrollWheelZoom={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* FIXED: Added additional check to ensure hexGeoJson exists and has features */}
            {hexGeoJson && hexGeoJson.features.length > 0 && (
              <GeoJSON
                key={`geojson-${JSON.stringify(activeLayers)}-${selectedHex?.h3Index || 'none'}`}
                data={hexGeoJson}
                style={geoJsonStyle}
                onEachFeature={onEachFeature}
              />
            )}
          </MapContainer>

          {/* --- Selected Hexagon Detail Panel --- */}
          {selectedHex && (
            <div className="absolute top-2 right-2 bottom-2 w-80 max-h-[calc(100vh-5rem)] bg-white shadow-lg rounded-lg border border-gray-200 flex flex-col p-4 z-[1000]">
              <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200 flex-shrink-0">
                <h3 className="text-base font-semibold text-gray-800 truncate" title={selectedHex.h3Index}>
                  Hex: {selectedHex.h3Index.substring(8)}
                </h3>
                <button onClick={closeDetails} className="text-gray-400 hover:text-gray-600 ml-2 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 text-sm pr-1">
                {/* --- Active Tool View --- */}
                {activeTool === 'cropPlanner' && (
                  <div className="p-3 bg-blue-50 rounded border border-blue-200 text-sm">
                    <h4 className="font-medium mb-1 text-blue-600">Crop Planner (Demo)</h4>
                    Placeholder: Assess suitability based on GDD ({selectedHex.gdd?.toFixed(1)}), Frost Risk ({selectedHex.frostRisk}), etc.
                  </div>
                )}
                {activeTool === 'heatMitigation' && (
                  <div className="p-3 bg-orange-50 rounded border border-orange-200 text-sm">
                    <h4 className="font-medium mb-1 text-orange-600">Heat Mitigation (Demo)</h4>
                    Placeholder: Analyze based on Heat Intensity ({selectedHex.urbanHeatIntensity?.toFixed(1)}°C). Suggest planting trees, cool roofs...
                  </div>
                )}

                {/* --- Default Hex Info (Show if no tool active) --- */}
                {!activeTool && (
                  <>
                    <p><span className='font-medium text-gray-600 w-28 inline-block'>Coordinates:</span> {selectedHex.lat?.toFixed(5)}, {selectedHex.lon?.toFixed(5)}</p>
                    <p><span className='font-medium text-gray-600 w-28 inline-block'>Temperature:</span> {selectedHex.temperature?.toFixed(1)} °C</p>
                    <p><span className='font-medium text-gray-600 w-28 inline-block'>Urban Heat:</span> {selectedHex.urbanHeatIntensity?.toFixed(1)} °C diff</p>
                    <p><span className='font-medium text-gray-600 w-28 inline-block'>Air Quality:</span> {selectedHex.airQualityIndex?.toFixed(0)} AQI</p>
                    <p><span className='font-medium text-gray-600 w-28 inline-block'>Soil Moisture:</span> {selectedHex.soilMoisture?.toFixed(2)}</p>
                    <p><span className='font-medium text-gray-600 w-28 inline-block'>Fire Risk Index:</span> {selectedHex.fireRiskIndex?.toFixed(0)}</p>
                    <p><span className='font-medium text-gray-600 w-28 inline-block'>Wind Speed:</span> {selectedHex.windSpeed?.toFixed(1)} km/h</p>

                    {/* Historical/Prediction Chart Example */}
                    <div className='mt-4 pt-4 border-t border-gray-200'>
                      <h4 className="font-medium mb-2 text-gray-700 text-xs uppercase">Historical Avg. Temp (°C)</h4>
                      <ResponsiveContainer width="100%" height={120}>
                        <LineChart data={selectedHex.historicalTemp} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb"/>
                          <XAxis dataKey="month" fontSize={9} tick={{ fill: '#6b7280' }}/>
                          <YAxis fontSize={9} tick={{ fill: '#6b7280' }}/>
                          <Tooltip contentStyle={{fontSize: '10px', padding: '2px 5px'}} itemStyle={{fontSize: '10px', padding: '0px'}}/>
                          <Line type="monotone" dataKey="avgTemp" stroke="#3b82f6" strokeWidth={1.5} dot={{ r: 2}} name="Avg Temp" />
                        </LineChart>
                      </ResponsiveContainer>
                      <p className='text-xs text-gray-500 mt-1'>
                        Projected 2050 ΔT: <span className='font-medium text-red-600'>+{selectedHex.projectedTempChange2050?.toFixed(1)}°C</span>
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Export Button */}
              <div className='mt-auto pt-3 border-t border-gray-200 flex-shrink-0'>
                <button className='w-full flex items-center justify-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'>
                  <Download className='w-4 h-4 mr-2'/>
                  Export Hex Data
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
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