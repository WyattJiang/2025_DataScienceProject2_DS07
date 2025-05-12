import React from 'react';
import { UserRole } from '../config';
import ProfilePage from '../ProfilePage';
import ChatPanel from './ChatPanel';
import TrendGraphModal from './TrendGraphModal';
import RealTimeWeather from '../RealTimeWeather';

type MainContentProps = {
  userEmail: string | null;
  additionalContext: string;
  activePage: 'dashboard' | 'profile' | 'chatbot';
  currentUserRole: UserRole;
  onUpdateContext: (newContext: string) => void;
  onRoleChange: (role: UserRole) => void;
  onNavigate: (page: 'dashboard' | 'profile' | 'chatbot') => void;
  activeLayers: { [key: string]: boolean };
  onToggleLayer: (layerKey: string) => void;
  mapHtmlPath: string;
};

const MainContent: React.FC<MainContentProps> = ({
  userEmail,
  additionalContext,
  onUpdateContext,
  activePage,
  currentUserRole,
  onRoleChange,
  onNavigate,
  activeLayers,
  onToggleLayer,
  mapHtmlPath,
}) => {
  const closeChatbot = () => {
    if (activePage === 'chatbot') {
      onNavigate('dashboard');
    }
  };

  return (
    <div className="flex-1 relative bg-gray-100 overflow-hidden">
      {/* --- Profile Page View --- */}
      {activePage === 'profile' && (
        <ProfilePage 
          userEmail={userEmail}
          currentUserRole={currentUserRole} 
          additionalContext={additionalContext}
          onRoleChange={onRoleChange} 
          onUpdateContext={onUpdateContext}
          onBackToDashboard={() => onNavigate('dashboard')} 
        />
      )}

      {/* --- Map View Container (iframe) --- */}
      {(activePage === 'dashboard' || activePage === 'chatbot') && (
        <div className="w-full h-full relative">
          <iframe 
            src={mapHtmlPath}
            className="w-full h-full border-0"
            title="Map Visualization"
            style={{ background: '#f9fafb' }}
            allowFullScreen
          />
        </div>
      )}

      {/* --- Chat Panel --- */}
      {activePage === 'chatbot' && (
        <ChatPanel onClose={closeChatbot} userRole={currentUserRole} additionalContext={additionalContext}/>
      )}

      {/* --- Trend Graph Modal --- */}
      <TrendGraphModal 
        isOpen={activeLayers.trendGraph} 
        onClose={() => onToggleLayer('trendGraph')} 
      />

      {/* --- Real Time Weather --- */}
      <RealTimeWeather
        isOpen={activeLayers.realtime} 
        onClose={() => onToggleLayer('realtime')} 
      />
    </div>
  );
};

export default MainContent;