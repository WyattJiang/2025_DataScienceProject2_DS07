import React from 'react';
import { Filter, ArrowLeft } from 'lucide-react';
import { UserRole, getConfigForRole } from '../config';

type HeaderProps = {
  activePage: 'dashboard' | 'profile' | 'chatbot';
  h3Resolution: number;
  currentUserRole: UserRole;
  onNavigate: (page: 'dashboard' | 'profile' | 'chatbot') => void;
};

const Header: React.FC<HeaderProps> = ({
  activePage,
  h3Resolution,
  currentUserRole,
  onNavigate
}) => {
  return (
    <header 
      className="flex justify-between items-center p-3 border-b border-gray-200 bg-white shadow-sm z-10 flex-shrink-0 h-16" 
      style={{ '--header-height': '4rem' } as React.CSSProperties}
    >
      <h1 className="text-lg font-semibold text-gray-800">
        {activePage === 'dashboard' && 'Map Dashboard'}
        {activePage === 'chatbot' && 'Chat Assistant'}
        {activePage === 'profile' && 'User Profile & Role'}
      </h1>
      
      {(activePage === 'dashboard' || activePage === 'chatbot') && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500" title={`Current H3 Resolution for ${getConfigForRole(currentUserRole).displayName}`}>
            Res: {h3Resolution}
          </span>
          <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md" title="Filter (Placeholder)">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      )}
      
      {activePage === 'profile' && (
        <button 
          onClick={() => onNavigate('dashboard')}
          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md flex items-center text-sm" 
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-4 h-4 mr-1"/> Back
        </button>
      )}
    </header>
  );
};

export default Header;