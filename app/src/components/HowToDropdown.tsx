import React, { useState } from 'react';
const HowToDropdown = () => {
  const [openMap, setOpenMap] = useState(false);
  const [openGraph, setOpenGraph] = useState(false);
  const [openWeather, setOpenWeather] = useState(false);
  const [openSidebar, setOpenSidebar] = useState(false);
  const [openRole, setOpenRole] = useState(false);
  const [openChat, setOpenChat] = useState(false);
  const [openSettings, setopenSettings] = useState(false);

  return (
    <ul className="space-y-4 text-sm text-gray-700">
      {/* Interactive Map */}
      <li>
        <div className="flex justify-between items-center cursor-pointer bg-pink-100 rounded-tl-lg rounded-tr-lg shadow-md p-4" onClick={() => setOpenMap(!openMap)}>
          <strong className='text-2xl ml-2'>🌐 Interactive Map:</strong> 
          <span className="text-2xl mr-4">{openMap ? "▲" : "▼"}</span>
        </div>
        {openMap && (
          <div className="text-xl text-gray-600 bg-pink-100 p-4 rounded-bl-lg rounded-br-lg shadow-sm -mt-3">
            Explore the interactive map of Australia. Hover over the hexagonal regions to view detailed weather data.
            Use the year slider to explore historical data, and select a season to visualize seasonal changes across different regions.
          </div>
        )}
      </li>

      {/* Chat Assitant */}
      <li>
        <div className="flex justify-between items-center cursor-pointer bg-blue-100 rounded-lg shadow-md p-4" onClick={() => setOpenChat(!openChat)}>
          <strong className='text-2xl ml-2'>🤖 Chat Assitant:</strong> 
          <span className="text-2xl mr-4">{openChat ? "▲" : "▼"}</span>
        </div>
        {openChat && (
          <div className="text-xl text-gray-600 bg-blue-100 p-4 rounded-bl-lg rounded-br-lg shadow-sm -mt-3">
              Click the <em>"Chat Assistant"</em> button to open a side panel. The AI chatbot provides personalized suggestions, explanations, and insights based on your prompts, tailored to your selected user role.
          </div>
        )}
      </li>

      {/* Trend Graph */}
      <li>
        <div className="flex justify-between items-center cursor-pointer bg-green-100 rounded-lg shadow-md p-4" onClick={() => setOpenGraph(!openGraph)}>
          <strong className='text-2xl ml-2'>📈 Trend Graph:</strong> 
          <span className="text-2xl mr-4">{openGraph ? "▲" : "▼"}</span>
        </div>
        {openGraph && (
          <div className="text-xl text-gray-600 bg-green-100 p-4 rounded-bl-lg rounded-br-lg shadow-sm -mt-3">
            Use the <em>"Trend Graphs"</em> button in the sidebar to visualize and compare temperature or rainfall trends for up to five suburbs over the past 20 years.
            Analyze patterns to gain insights into local climate changes.
          </div>
        )}
      </li>

      {/* Real-Time Weather */}
      <li>
        <div className="flex justify-between items-center cursor-pointer bg-yellow-100 rounded-lg shadow-md p-4" onClick={() => setOpenWeather(!openWeather)}>
          <strong className='text-2xl ml-2'>🌦 Real-Time Weather:</strong> 
          <span className="text-2xl mr-4">{openWeather ? "▲" : "▼"}</span>
        </div>
        {openWeather && (
          <div className="text-xl text-gray-600 bg-yellow-100 p-4 rounded-bl-lg rounded-br-lg shadow-sm -mt-3">
            Click the <em>"Real-Time Weather"</em> button to search for live weather data by city name, geographic coordinates (in decimal degrees), or suburb name.
            Based on your user role, you'll see personalized metrics and animated visuals of the sun and moon paths for the selected location.
          </div>
        )}
      </li>

      {/* Weather forecast */}
      <li>
        <div className="flex justify-between items-center cursor-pointer bg-purple-100 rounded-lg shadow-md p-4" onClick={() => setOpenSidebar(!openSidebar)}>
          <strong className='text-2xl ml-2'>🔭 Weather Forecast:</strong> 
          <span className='text-2xl mr-4'>{openSidebar ? "▲" : "▼"}</span>
        </div>
        {openSidebar && (
          <div className="text-xl text-gray-600 bg-purple-100 p-4 rounded-bl-lg rounded-br-lg shadow-sm -mt-3">
            Use the <em>"Weather Forecast"</em> feature to retrieve forecasts for up to 5 days.
            Search by city name, coordinates, or suburb. After submitting your query, view forecast summaries for each day including min, max, and average temperatures.
            Click a forecasted day to explore detailed metrics using interactive bar or line charts. Toggle between metric and imperial units.
          </div>
        )}
      </li>

      {/* Profile & Role */}
      <li>
        <div className="flex justify-between items-center cursor-pointer bg-teal-100 rounded-lg shadow-md p-4" onClick={() => setOpenRole(!openRole)}>
          <strong className='text-2xl ml-2'>👤 Profile & Role:</strong> 
          <span className='text-2xl mr-4'>{openRole ? "▲" : "▼"}</span>
        </div>
        {openRole && (
          <div className="text-xl text-gray-600 bg-teal-100 p-4 rounded-bl-lg rounded-br-lg shadow-sm -mt-3">
            Switch between roles such as General Public, Farmer, or Urban Planner to receive role-specific metrics and chat suggestions.
            Customize your experience further by updating your role context, changing your email, or updating your password from the profile page.
          </div>
        )}
      </li>

      {/* Settings */}
      <li>
        <div className="flex justify-between items-center cursor-pointer bg-orange-100 rounded-lg shadow-md p-4" onClick={() => setopenSettings(!openSettings)}>
          <strong className='text-2xl ml-2'>⚙️ Settings:</strong> 
          <span className="text-2xl mr-4">{openGraph ? "▲" : "▼"}</span>
        </div>
        {openSettings && (
          <div className="text-xl text-gray-600 bg-orange-100 p-4 rounded-bl-lg rounded-br-lg shadow-sm -mt-3">
            Access the <em>"Settings"</em> section in the sidebar to toggle accessibility features like colorblind mode, text enlargement, and high-contrast themes for improved readability.
          </div>
        )}
      </li>
    </ul>
  );
};

export default HowToDropdown;
