import React, { useState } from 'react';
import { UserRole, getConfigForRole, INITIAL_H3_RESOLUTION, INITIAL_ACTIVE_LAYERS } from './config';
import LoginPage from './LoginPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MainContent from './components/MainContent';
import DataCitationsModal from './components/DataCitationsModal';
import HowToModal from './components/HowToUseModal';
 


// --- Constants ---
const MAP_HTML_PATH = 'https://myawsbucketclimates.s3.ap-southeast-2.amazonaws.com/prec.html'; 

// --- Main App Component ---
const WeatherDashboard: React.FC = () => {
  // Authentication & Page State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [activeAppPage, setActiveAppPage] = useState<'login' | 'dashboard' | 'profile' | 'chatbot'>('login');

  // Role & Map Configuration State
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('general_public');
  const [h3Resolution, setH3Resolution] = useState<number>(INITIAL_H3_RESOLUTION);
  const [activeLayers, setActiveLayers] = useState<{ [key: string]: boolean }>(INITIAL_ACTIVE_LAYERS);

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showHowTo, setShowHowTo] = useState(false);
  const [showCitationsModal, setShowCitationsModal] = useState(false);
  const [additionalContext, setAdditionalContext] = useState<string>("");

  // --- Handlers ---
  const handleLoginSuccess = (email: string) => {
    console.log("Login successful");
    setUserEmail(email);
    setIsLoggedIn(true);
    const initialConfig = getConfigForRole('general_public');
    setCurrentUserRole('general_public');
    setH3Resolution(initialConfig.h3Resolution);
    setActiveLayers(initialConfig.defaultLayers);
    setActiveAppPage('dashboard');
  };

  const handleLogout = () => {
    console.log("Logging out");
    setIsLoggedIn(false);
    setCurrentUserRole('general_public');
    setActiveAppPage('login');
  };

  const handleRoleChange = (newRole: UserRole) => {
    if (newRole === currentUserRole) return;
    console.log(`Role changed to: ${newRole}`);
    const newConfig = getConfigForRole(newRole);
    setCurrentUserRole(newRole);
    setH3Resolution(newConfig.h3Resolution);
    setActiveLayers(newConfig.defaultLayers);
  };

  const handleNavigate = (page: 'dashboard' | 'profile' | 'chatbot') => {
    if (activeAppPage === 'chatbot' && page === 'chatbot') {
      setActiveAppPage('dashboard'); // Close chatbot
    } else {
      setActiveAppPage(page);
    }
  };
  

  const toggleLayer = (layerKey: string) => {
    console.log("layerkey:",layerKey)
    setActiveLayers(prev => ({
      ...prev,
      [layerKey]: !prev[layerKey]
    }));
  };

  const handleOpenCitations = () => setShowCitationsModal(true);
  const handleCloseCitations = () => setShowCitationsModal(false);


  // --- Render Logic ---
  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={(email) => handleLoginSuccess(email)} appName="Climates" />;
  }

  // --- Logged In View ---
  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 font-sans antialiased">
      {/* --- Sidebar --- */}
      <Sidebar 
        userEmail={userEmail}
        activePage={activeAppPage === 'login' ? 'dashboard' : activeAppPage}
        currentUserRole={currentUserRole}
        activeLayers={activeLayers}
        onNavigate={handleNavigate}
        onToggleLayer={toggleLayer}
        onLogout={handleLogout}
        onOpenHowTo={() => setShowHowTo(true)}
        onOpenCitations={handleOpenCitations}
      />

      {/* --- Main Content Area --- */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* --- Header --- */}
        <Header 
          activePage={activeAppPage === 'login' ? 'dashboard' : activeAppPage}
          h3Resolution={h3Resolution}
          currentUserRole={currentUserRole}
          onNavigate={handleNavigate}
        />

        {/* --- Content: Map, Profile, Panels --- */}
        <MainContent 
          userEmail = {userEmail}
          additionalContext={additionalContext}
          onUpdateContext={setAdditionalContext}
          activePage={activeAppPage === 'login' ? 'dashboard' : activeAppPage}
          currentUserRole={currentUserRole}
          onRoleChange={handleRoleChange}
          onNavigate={handleNavigate}
          activeLayers={activeLayers}
          onToggleLayer={toggleLayer}
          mapHtmlPath={MAP_HTML_PATH}
        />
        <HowToModal isOpen={showHowTo} onClose={() => setShowHowTo(false)} />
        <DataCitationsModal isOpen={showCitationsModal} onClose={handleCloseCitations} />
      </div>
    </div>
  );
};

export default WeatherDashboard;