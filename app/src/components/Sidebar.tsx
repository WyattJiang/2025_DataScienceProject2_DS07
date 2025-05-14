//// filepath: c:\Users\14224\Documents\GitHub\2025_DataScienceProject2_DS07\app\src\components\Sidebar.tsx
import React from 'react';
import { MapIcon, MessageSquare, CircleHelp, ChartLine, Cloud, LogOut, Tractor, Building2, Users, Telescope, CodeXml, Settings} from 'lucide-react';
import { UserRole, getConfigForRole } from '../config';
import '../themes.css';

type SidebarProps = {
  userEmail: string | null;
  activePage: 'dashboard' | 'profile' | 'chatbot';
  currentUserRole: UserRole;
  activeLayers: { [key: string]: boolean };
  onNavigate: (page: 'dashboard' | 'profile' | 'chatbot') => void;
  onToggleLayer: (layerKey: string) => void;
  onLogout: () => void;
  onOpenHowTo: () => void;
  onOpenCitations: () => void;
  onOpenSettings: () => void;
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
  onOpenCitations,
  onOpenSettings,
}) => {
  const username = userEmail?.split('@')[0] || 'unknown_user';

  return (
    <div
      className="w-60 border-r flex flex-col shadow-sm flex-shrink-0"
      style={{
        backgroundColor: 'var(--background-color)',
        color: 'var(--text-color)',
      }}
    >
      {/* Logo */}
      <div className="p-4 flex items-center space-x-2 border-b" style={{ borderColor: 'var(--text-color)' }}>
        <div className="p-2 rounded-lg shadow" style={{ backgroundColor: 'var(--primary-color)', color: 'var(--background-color)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
        </div>
        <h1 className="font-bold text-lg">Climates</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
        {/* Views */}
        <div className="pt-2">
          <h3 className="px-2.5 text-xs font-semibold uppercase tracking-wider mb-1">Views</h3>
          <button
            onClick={() => onNavigate('dashboard')}
            className="w-full text-left p-2.5 text-sm rounded-md flex items-center"
            style={{
              backgroundColor: activePage === 'dashboard' ? 'var(--primary-color)' : 'transparent',
              color: activePage === 'dashboard' ? 'var(--background-color)' : 'var(--text-color)',
            }}
          >
            <MapIcon className="mr-3 h-5 w-5 flex-shrink-0" /> Map Dashboard
          </button>
          <button
            onClick={() => onNavigate('chatbot')}
            className="w-full text-left p-2.5 text-sm rounded-md flex items-center"
            style={{
              backgroundColor: activePage === 'chatbot' ? 'var(--primary-color)' : 'transparent',
              color: activePage === 'chatbot' ? 'var(--background-color)' : 'var(--text-color)',
            }}
          >
            <MessageSquare className="mr-3 h-5 w-5 flex-shrink-0" /> Chat Assistant
          </button>
        </div>

        {/* Trend Graph */}
        <div className="pt-2">
          <h3 className="px-2.5 text-xs font-semibold uppercase tracking-wider mb-1">Trend Graph</h3>
          <button
            onClick={() => onToggleLayer('trendGraph')}
            className="w-full text-left p-2.5 text-sm rounded-md flex items-center"
            style={{
              backgroundColor: activeLayers.trendGraph ? 'var(--primary-color)' : 'transparent',
              color: activeLayers.trendGraph ? 'var(--background-color)' : 'var(--text-color)',
            }}
          >
            <ChartLine className="mr-3 h-5 w-5 flex-shrink-0" /> Trend Graphs
          </button>
        </div>

        {/* Real Time Weather */}
        <div className="pt-2">
          <h3 className="px-2.5 text-xs font-semibold uppercase tracking-wider mb-1">Real Time Weather</h3>
          <button
            onClick={() => onToggleLayer('realtime')}
            className="w-full text-left p-2.5 text-sm rounded-md flex items-center"
            style={{
              backgroundColor: activeLayers.realtime ? 'var(--primary-color)' : 'transparent',
              color: activeLayers.realtime ? 'var(--background-color)' : 'var(--text-color)',
            }}
          >
            <Cloud className="mr-3 h-5 w-5 flex-shrink-0" /> Real Time Weather
          </button>
        </div>

        {/* Forecasting Weather */}
        <div className="pt-2">
          <h3 className="px-2.5 text-xs font-semibold uppercase tracking-wider mb-1">Weather Forecast</h3>
          <button
            onClick={() => onToggleLayer('forecast')}
            className="w-full text-left p-2.5 text-sm rounded-md flex items-center"
            style={{
              backgroundColor: activeLayers.forecast ? 'var(--primary-color)' : 'transparent',
              color: activeLayers.forecast ? 'var(--background-color)' : 'var(--text-color)',
            }}
          >
            <Telescope className="mr-3 h-5 w-5 flex-shrink-0" /> Weather Forecast
          </button>
        </div>

        {/* How to use */}
        <button
          onClick={onOpenHowTo}
          className="w-full text-left p-2.5 text-sm rounded-md flex items-center hover:opacity-80"
        >
          <CircleHelp className="mr-3 h-5 w-5 flex-shrink-0" /> How to use?
        </button>

        <button
          onClick={onOpenSettings}
          className="w-full text-left p-2.5 text-sm rounded-md flex items-center hover:opacity-80"
        >
          <Settings className='mr-3 h-5 w-5 flex-shrink-0' /> Settings
        </button>

        {/* Data Citations */}
        <button
          onClick={onOpenCitations}
          className="w-full text-left p-2.5 text-sm rounded-md flex items-center hover:opacity-80"
        >
          <CodeXml className="mr-3 h-5 w-5 flex-shrink-0" /> Data Sources & Processing
        </button>

        
      </nav>

      {/* Profile & Logout */}
      <div className="p-3 border-t mt-auto" style={{ borderColor: 'var(--text-color)' }}>
        <div
          className="flex items-center p-2 rounded-md cursor-pointer"
          style={{
            backgroundColor: activePage === 'profile' ? 'var(--primary-color)' : 'transparent',
            color: activePage === 'profile' ? 'var(--background-color)' : 'var(--text-color)',
          }}
          onClick={() => onNavigate('profile')}
        >
          <div className="p-1.5 rounded-full mr-2.5" style={{ backgroundColor: 'var(--primary-color)' }}>
            {currentUserRole === 'farmer' ? <Tractor className="h-5 w-5" /> :
              currentUserRole === 'urban_planner' ? <Building2 className="h-5 w-5" /> :
                <Users className="h-5 w-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{username}</p>
            <p className="text-xs truncate">{getConfigForRole(currentUserRole).displayName}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="mt-2 w-full text-left p-2 text-sm rounded-md flex items-center justify-center transition-colors border hover:bg-opacity-10" 
          style={{
            backgroundColor: 'var(--background-color)',
            color: 'var(--primary-color)',
            borderColor: 'var(--primary-color)',
          }}
        >
          <LogOut className="mr-2 h-4 w-4 flex-shrink-0" /> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;