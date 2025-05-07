// src/ProfilePage.tsx
import React from 'react';
import { UserRole, ROLES_CONFIG, getConfigForRole } from './config';
import { User, ArrowLeft, Save, CheckSquare, Square } from 'lucide-react'; // Added icons

interface ProfilePageProps {
  userEmail: string | null;
  currentUserRole: UserRole;
  onRoleChange: (newRole: UserRole) => void;
  onBackToDashboard: () => void;
  // Add username prop later if needed: currentUsername: string;
}

const ProfilePage: React.FC<ProfilePageProps> = ({
  userEmail,
  currentUserRole,
  onRoleChange,
  onBackToDashboard,
  
}) => {
  
  const availableRoles: UserRole[] = ['general_public', 'farmer', 'urban_planner'];
  const currentConfig = getConfigForRole(currentUserRole);
  const username = userEmail?.split('@')[0] || 'unknown_user';
  // In a real app, you'd have state for unsaved changes
  // For now, selection directly calls onRoleChange

  return (
    <div className="flex flex-col items-center h-full bg-gray-100 p-6 sm:p-8">
      <div className="w-full max-w-lg bg-white p-6 sm:p-8 rounded-xl shadow-md border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
           <div className='flex items-center'>
             <User className="w-6 h-6 mr-3 text-blue-600" />
             <h1 className="text-xl font-semibold text-gray-800">User Profile & Role</h1>
           </div>
            <button
                onClick={onBackToDashboard}
                className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
            >
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
            </button>
        </div>

        {/* Profile Info Section (Placeholder) */}
        <div className="mb-6">
           <h2 className="text-lg font-medium text-gray-700 mb-3">Your Details</h2>
           <div className="space-y-2 text-sm">
              <p><span className='font-semibold text-gray-600 w-24 inline-block'>Username:</span> {username}</p>
              <p><span className='font-semibold text-gray-600 w-24 inline-block'>Email:</span> {userEmail}</p>
              {/* Add more fields later */}
           </div>
        </div>


        {/* Role Selection Section */}
        <div>
          <h2 className="text-lg font-medium text-gray-700 mb-3">Select Your Role</h2>
          <p className="text-sm text-gray-500 mb-4">
            Choosing a role tailors the map resolution, default layers, and available tools to better suit your needs.
            Your current role is: <strong className='text-indigo-600'>{currentConfig.displayName}</strong>.
          </p>
          <div className="space-y-3">
            {availableRoles.map((role) => (
              <button
                key={role}
                onClick={() => onRoleChange(role)} // Directly update role on click
                className={`w-full flex items-center justify-between p-3 border rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                  currentUserRole === role
                    ? 'border-blue-500 bg-blue-50 text-blue-700 ring-blue-500'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                }`}
              >
                <span className="font-medium">{ROLES_CONFIG[role].displayName}</span>
                {currentUserRole === role
                  ? <CheckSquare className="w-5 h-5 text-blue-600" />
                  : <Square className="w-5 h-5 text-gray-400" />
                }
              </button>
            ))}
          </div>
          {/* <button className="mt-6 w-full flex items-center justify-center px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ...">
             <Save className="w-5 h-5 mr-2" /> Save Changes
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;