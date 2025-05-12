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
            Explore the interactive map of Australia. Click on any hexagon to view detailed weather data for that area. 
            Use the slider to navigate through different years, and project the weather up to three days ahead for each hex.
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
              Use the <em>"Chat Assistant"</em> button to open a side panel where an AI chatbot can provide personalized 
              suggestions and insights based on your prompts.

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
            Use the sidebar's <em>"Trend Graphs"</em> button to visualize and compare temperature or rainfall trends for up to two suburbs. 
            View past, present, and future data to analyze weather patterns.
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
            Use the <em>"Real-Time Weather"</em> button to search live weather data by suburb name or geographic coordinates. 
            Stay updated with the most recent weather conditions.
          </div>
        )}
      </li>

      {/* Sidebar Tools */}
      <li>
        <div className="flex justify-between items-center cursor-pointer bg-purple-100 rounded-lg shadow-md p-4" onClick={() => setOpenSidebar(!openSidebar)}>
          <strong className='text-2xl ml-2'>🧭 Sidebar Tools:</strong> 
          <span className='text-2xl mr-4'>{openSidebar ? "▲" : "▼"}</span>
        </div>
        {openSidebar && (
          <div className="text-xl text-gray-600 bg-purple-100 p-4 rounded-bl-lg rounded-br-lg shadow-sm -mt-3">
            Toggle various data layers such as average temperature, precipitation, or wind speed. 
            Use these tools to explore different weather metrics in real-time.
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
            Switch between different user roles (e.g., General Public, Farmer, Urban Planner) to receive role-specific 
            suggestions in the chat assistant. Tailor the conversation context based on your selected role.
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
            Access the <em>"Settings"</em> in the sidebar to enable accessibility features like colorblind mode, 
            text enlargement, and high contrast for better readability.
          </div>
        )}
      </li>
    </ul>
  );
};

export default HowToDropdown;
