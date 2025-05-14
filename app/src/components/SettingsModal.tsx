import React from 'react';
import { X, CheckSquare, Square } from 'lucide-react';

type ThemeType = 'default' | 'color-blind' | 'high-contrast';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  theme: 'default' | 'color-blind' | 'high-contrast';
  onThemeChange: (newTheme: 'default' | 'color-blind' | 'high-contrast') => void;
};

const SettingsModal: React.FC<Props> = ({ isOpen, onClose, theme, onThemeChange }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white w-[90vw] h-[80vh] max-w-2xl rounded-lg shadow-xl p-6 relative overflow-auto"
      style={{
        backgroundColor: 'var(--background-color)',
        color: 'var(--text-color)',
      }}
      >
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-center underline mb-6">Settings</h2>

        {/* Theme Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Theme Selection</h3>
          <p className="text-sm text-gray-600 mb-3">
            Choose a display theme for better visibility or accessibility needs.
          </p>
          <div className="space-y-3">
            {(['default', 'color-blind', 'high-contrast'] as ThemeType[]).map((t) => (
              <button
                key={t}
                onClick={() => onThemeChange(t)}
                className={`w-full flex items-center justify-between p-3 border rounded-lg transition-all duration-150 ${
                  theme === t
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="font-medium capitalize">{t.replace('-', ' ')}</span>
                {theme === t ? (
                  <CheckSquare className="w-5 h-5 text-blue-600" />
                ) : (
                  <Square className="w-5 h-5 text-gray-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
