//// filepath: c:\Users\14224\Documents\GitHub\2025_DataScienceProject2_DS07\app\src\ProfilePage.tsx
import React, { useState } from 'react';
import { UserRole, ROLES_CONFIG, getConfigForRole } from './config';
import { User, ArrowLeft, Save, CheckSquare, Square } from 'lucide-react';

interface ProfilePageProps {
  userEmail: string | null;
  currentUserRole: UserRole;
  additionalContext: string;
  onUpdateContext: (context: string) => void;
  onRoleChange: (newRole: UserRole) => void;
  onBackToDashboard: () => void;
  theme: 'default' | 'color-blind' | 'high-contrast';
}

const ProfilePage: React.FC<ProfilePageProps> = ({
  userEmail,
  currentUserRole,
  additionalContext,
  onUpdateContext,
  onRoleChange,
  onBackToDashboard,
  theme,
}) => {
  const [localContext, setLocalContext] = useState<string>(additionalContext);
  const availableRoles: UserRole[] = ['general_public', 'farmer', 'urban_planner'];
  const currentConfig = getConfigForRole(currentUserRole);
  const username = userEmail?.split('@')[0] || 'unknown_user';

  const [isDirty, setIsDirty] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [updateMessage, setUpdateMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');

  const isValidPassword = (password: string) =>
    /^(?=.*[!@#$%^&-?*])(?=.*\d)[A-Za-z\d!@#$%^&*]{8,}$/.test(password);

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <div
      className={`flex flex-col items-center h-full overflow-y-auto p-6 sm:p-8 ${theme}-theme`}
    >

      <div
        className="w-full max-w-lg p-6 sm:p-8 rounded-xl shadow-md border border-gray-200 -mt-7 -mb-6"
        style={{
          backgroundColor: 'var(--card-background-color)',
          color: 'var(--text-color)'  ,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div className="flex items-center">
            <User className="w-6 h-6 mr-3 text-blue-600 rounded" 
            style={{
            backgroundColor: 'var(--primary-color)' ,
            color:'var(--background-color)',
          }} />
            <h1 className="text-xl font-semibold">
              User Profile & Role
            </h1>
          </div>
          <button
            onClick={onBackToDashboard}
            className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
          </button>
        </div>

        {/* Profile Info Section */}
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-3">Your Details</h2>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-semibold w-24 inline-block">Username:</span> 
              {username}
            </p>
            <p>
              <span className="font-semibold w-24 inline-block">Email:</span> 
              {userEmail}
            </p>
          </div>
        </div>

        {/* Change Email/Password Section */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => setShowUpdateForm(!showUpdateForm)}
            className="text-blue-600 underline"
          >
            {showUpdateForm ? 'Hide' : 'Change Email or Password'}
          </button>
          {showUpdateForm && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium required">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium required">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium required:">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              {updateMessage && (
                <p className={`text-sm text-center ${messageType === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                  {updateMessage}
                </p>
              )}
              <button
                onClick={async () => {
                  setUpdateMessage('');
                  if (newPassword) {
                    if (newPassword !== confirmNewPassword) {
                      setMessageType('error');
                      setUpdateMessage('New passwords do not match.');
                      return;
                    }
                    if (!isValidPassword(newPassword)) {
                      setMessageType('error');
                      setUpdateMessage(
                        'Password must be at least 8 characters long and include one number and one special character.'
                      );
                      return;
                    }
                  }
                  if (newEmail && !isValidEmail(newEmail)) {
                    setMessageType('error');
                    setUpdateMessage(
                      "Please include an '@' in the email address. 'a' is missing an '@'"
                    );
                    return;
                  }
                  try {
                    const res = await fetch('http://localhost:3001/api/update-user', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        currentEmail: userEmail,
                        currentPassword,
                        newEmail: newEmail || undefined,
                        newPassword: newPassword || undefined,
                      }),
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || 'Update failed.');
                    setMessageType('success');
                    setUpdateMessage('Update successful. Please re-login if you changed your email.');
                  } catch (err: any) {
                    setMessageType('error');
                    setUpdateMessage(err.message || 'Update failed.');
                  }
                }}
                className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg" 
              style={{
            backgroundColor: 'var(--primary-color)' ,
            color:'var(--background-color)',
          }}  
          >
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* Role Selection Section */}
        <div>
          <h2 className="text-lg font-medium mb-3">Select Your Role</h2>
          <p className="text-sm text-gray-500 mb-4">
            Choosing a role tailors the map resolution, default layers, and available tools 
            to better suit your needs. Your current role is:{' '}
            <strong className="text-indigo-600">{currentConfig.displayName}</strong>.
          </p>
          <div className="space-y-3" >
            {availableRoles.map((role) => (
              <button
                key={role}
                onClick={() => onRoleChange(role)}
                className={`w-full flex items-center justify-between p-3 border rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                  currentUserRole === role
                    ? 'border-blue-500 bg-blue-50 text-blue-700 ring-blue-500'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                }`}
              >
                <span className="font-medium">{ROLES_CONFIG[role].displayName}</span>
                {currentUserRole === role ? (
                  <CheckSquare className="w-5 h-5 text-blue-600" />
                ) : (
                  <Square className="w-5 h-5 text-gray-400" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Context Input Section */}
        <div>
          <h2 className="text-lg font-medium mt-2 mb-2">Custom Assistant Context</h2>
          <p className="text-sm text-gray-500 mb-2">
            Add any extra information you want the assistant to consider. 
            For example: "I want responses to be brief"
          </p>
          <textarea
            className="w-full min-h-[100px] border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={localContext}
            onChange={(e) => {
              setLocalContext(e.target.value);
              setIsDirty(true);
            }}
            placeholder="Add extra context for chat assistant..."
          />
          <button
            onClick={() => {
              onUpdateContext(localContext);
              setIsDirty(false);
            }}
            disabled={!isDirty}
            className={`mt-3 -mb-3 w-full flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${
              isDirty
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-white cursor-not-allowed'
            }`}
          >
            <Save className="w-5 h-5 mr-2" /> Save Context
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;