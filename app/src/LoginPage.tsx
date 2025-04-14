// src/LoginPage.tsx
import React, { useState } from 'react';
import { LogIn } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void; // Callback when login is successful
  appName?: string; // Optional app name for display
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, appName = "Climates" }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    setError(null); // Clear previous errors

    // --- Placeholder Validation ---
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    // --- Placeholder Authentication Success ---
    // In a real app, you'd call an auth service here.
    // For now, any non-empty fields pass.
    console.log(`Attempting login for user: ${username}`);
    onLoginSuccess();
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-blue-100 via-gray-50 to-indigo-100 p-8">
      <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <div className="text-center mb-8">
           <div className="inline-flex items-center justify-center bg-blue-600 text-white p-3 rounded-full shadow-md mb-4">
             {/* Placeholder Logo/Icon */}
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
             </svg>
           </div>
          <h1 className="text-2xl font-bold text-gray-800">Login to {appName}</h1>
          <p className="text-gray-500 mt-1">Enter your credentials below.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., demo_user"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              autoComplete="username"
            />
          </div>

          <div>
            <label htmlFor="password"className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 font-medium"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Login
          </button>
        </form>
         <p className="text-center text-xs text-gray-400 mt-6">
            Use any non-empty username/password for demo.
         </p>
      </div>
    </div>
  );
};

export default LoginPage;