// src/LoginPage.tsx
import React, { useState } from 'react';
import { LogIn } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (email: string) => void; // Callback when login is successful
  appName?: string; // Optional app name for display
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, appName = "Climates" }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
  
    if (!email.trim() || !password.trim()) {
      setError('Username and password are required.');
      return;
    }

    const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isValidPassword = (password: string) =>/^(?=.*[!@#$%^&*])(?=.*\d)[A-Za-z\d!@#$%^&*]{8,}$/.test(password);
    
  
    if (isSignUpMode) {
      if (!email.trim()) {
        setError('Email is required.');
        return;
      }    
  
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (!isValidEmail(email)) {
        setError('Please enter a valid email address.');
        return;
      }
      
      if (!isValidPassword(password)) {
        setError('Password must be at least 8 characters long and include at least one number and one special character.');
        return;
      }

      try {
        const res = await fetch('http://localhost:3001/api/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
  
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Signup failed.');
  
        setError('Signup successful');
        onLoginSuccess(email);
      } catch (err: any) {
        setError(err.message || 'Signup failed.');
      }
    } else {
      if (!isValidEmail(email)) {
        setError('Please enter a valid email address.');
        return;
      }
      try {
        const res = await fetch('http://localhost:3001/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
    
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed.');
    
        // Optional: store username or token here
        console.log('Logged in as', email);
        onLoginSuccess(email); 
      } catch (err: any) {
        setError(err.message || 'Login failed.');
      }
    }
  };
  

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-gray-50 to-indigo-100 p-4">
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

        <form onSubmit={handleSubmit} className="space-y-4"> 
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=""
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          {isSignUpMode && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder=""
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
              <p className="text-center text-xs text-gray-500 mt-1">
                Password must be at least 8 characters, with one number and one special character.
              </p>
            </div>
          )}

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <button
            type="submit"
            className="w-full flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <LogIn className="w-5 h-5 mr-2" />
            {isSignUpMode ? 'Sign Up' : 'Login'}
          </button>
        </form>
        <p
          className="text-center text-sm text-blue-600 mt-4 cursor-pointer hover:underline"
          onClick={() => setIsSignUpMode(!isSignUpMode)}
        >
          {isSignUpMode ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
        </p>
      </div>
    </div>
  );
};

export default LoginPage;