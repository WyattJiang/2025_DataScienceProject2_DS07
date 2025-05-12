import React from 'react';
import {
  Settings, Filter, MapIcon, Thermometer, Droplets,
  Flame, Sun, Tractor, Building, MessageSquare, Users, Building2, LogOut, CircleHelp
} from 'lucide-react';
import { ChartLine, Cloud } from 'lucide-react';

// Import Config and Role Types
import {
  UserRole, ROLES_CONFIG, getConfigForRole
} from '../config';

type SidebarProps = {
  userEmail: string | null;
  activePage: 'dashboard' | 'profile' | 'chatbot';
  currentUserRole: UserRole;
  activeLayers: { [key: string]: boolean };
  onNavigate: (page: 'dashboard' | 'profile' | 'chatbot') => void;
  onToggleLayer: (layerKey: string) => void;
  onLogout: () => void;
  onOpenHowTo: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({
  userEmail,
  activePage,
  currentUserRole,
  activeLayers,
  onNavigate,
  onToggleLayer,
  onLogout,
  onOpenHowTo,
}) => {
  const username = userEmail?.split('@')[0] || 'unknown_user';
  return (
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
        <div className="pt-2">
          <h3 className="px-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Views</h3>
          <button 
            onClick={() => onNavigate('dashboard')} 
            className={`w-full text-left p-2.5 text-sm rounded-md flex items-center transition-colors duration-150 ${
              activePage === 'dashboard' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <MapIcon className="mr-3 h-5 w-5 flex-shrink-0" /> Map Dashboard
          </button>
          <button 
            onClick={() => onNavigate('chatbot')} 
            className={`w-full text-left p-2.5 text-sm rounded-md flex items-center transition-colors duration-150 ${
              activePage === 'chatbot' ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <MessageSquare className="mr-3 h-5 w-5 flex-shrink-0" /> Chat Assistant
          </button>
        </div>

        {/* Trend Graph */}
        <div className="pt-2">
          <h3 className="px-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Trend Graph</h3>
          <button
            onClick={() => onToggleLayer('trendGraph')}
            className={`w-full text-left p-2.5 text-sm rounded-md flex items-center transition-colors duration-150 ${
              activeLayers.trendGraph ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ChartLine className="mr-3 h-5 w-5 flex-shrink-0" /> Trend Graphs
          </button>
        </div>

        {/* Real Time Weather */}
        <div className="pt-2">
          <h3 className="px-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Real Time WEather</h3>
          <button
            onClick={() => onToggleLayer('realtime')}
            className={`w-full text-left p-2.5 text-sm rounded-md flex items-center transition-colors duration-150 ${
              activeLayers.realtime ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Cloud className="mr-3 h-5 w-5 flex-shrink-0" /> Real Time Weather
          </button>
        </div>

        <div className="pt-2">
          <h3 className="px-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Data Layers</h3>
          {Object.keys(ROLES_CONFIG.general_public.defaultLayers).map(layerKey => {
            // Skip trendGraph and realtime as it has its own section
            if (layerKey === 'trendGraph') return null;
            else if(layerKey === 'realtime') return null;
            
            const Icon = { temperature: Thermometer, soilMoisture: Droplets, fireRiskIndex: Flame, urbanHeatIntensity: Sun }[layerKey] || Filter;
            const title = layerKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            const colors = activeLayers[layerKey]
              ? { temperature: 'bg-blue-100 text-blue-700 font-medium', soilMoisture: 'bg-green-100 text-green-700 font-medium', fireRiskIndex: 'bg-red-100 text-red-700 font-medium', urbanHeatIntensity: 'bg-yellow-100 text-yellow-700 font-medium' }[layerKey] || 'bg-gray-200 text-gray-800 font-medium'
              : 'text-gray-600 hover:bg-gray-100';
            return (
              <button 
                key={layerKey} 
                onClick={() => onToggleLayer(layerKey)} 
                className={`w-full text-left p-2.5 text-sm rounded-md flex items-center transition-colors duration-150 ${colors}`}
              >
                <Icon className="mr-3 h-5 w-5 flex-shrink-0" /> {title}
              </button>
            );
          })}
        </div>
        
        <div className="pt-2">
          <h3 className="px-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Decision Tools</h3>
          <button className={`w-full text-left p-2.5 text-sm rounded-md flex items-center transition-colors duration-150 text-gray-600 hover:bg-gray-100`}>
            <Tractor className="mr-3 h-5 w-5 flex-shrink-0" /> Crop Planner {currentUserRole === 'farmer' && '*'}
          </button>
          <button className={`w-full text-left p-2.5 text-sm rounded-md flex items-center transition-colors duration-150 text-gray-600 hover:bg-gray-100`}>
            <Building className="mr-3 h-5 w-5 flex-shrink-0" /> Heat Mitigation {currentUserRole === 'urban_planner' && '*'}
          </button>
        </div>
        
        <button className="w-full text-left p-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md flex items-center transition-colors duration-150 mt-2">
          <Settings className="mr-3 h-5 w-5 flex-shrink-0" /> Settings
        </button>
        <button 
        onClick={onOpenHowTo}
        className="w-full text-left p-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md flex items-center transition-colors duration-150 -mt-2">
          <CircleHelp className="mr-3 h-5 w-5 flex-shrink-0"/> How to use? 
        </button>
      </nav>
      
      {/* User Profile / Logout Section */}
      <div className="p-3 border-t border-gray-200 mt-auto">
        <div 
          className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${activePage === 'profile' ? 'bg-indigo-100' : 'bg-gray-50 hover:bg-gray-100'}`} 
          onClick={() => onNavigate('profile')} 
          title="Go to User Profile & Role Selection"
        >
          <div className="p-1.5 bg-indigo-100 rounded-full mr-2.5">
            {currentUserRole === 'farmer' ? 
              <Tractor className="h-5 w-5 text-indigo-600"/> : 
              currentUserRole === 'urban_planner' ? 
                <Building2 className="h-5 w-5 text-indigo-600"/> : 
                <Users className="h-5 w-5 text-indigo-600"/>
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium truncate ${activePage === 'profile' ? 'text-indigo-800' : 'text-gray-800'}`} title="demo_user">
              {username}
            </p>
            <p className="text-xs text-gray-500 truncate" title={getConfigForRole(currentUserRole).displayName}>
              {getConfigForRole(currentUserRole).displayName}
            </p>
          </div>
        </div>
        <button 
          onClick={onLogout} 
          className="mt-2 w-full text-left p-2 text-sm text-red-600 hover:bg-red-50 rounded-md flex items-center transition-colors duration-150"
        >
          <LogOut className="mr-2 h-4 w-4 flex-shrink-0" /> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;