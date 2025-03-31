import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import './styles.css';
import ChatHistory from "./components/ChatHistory";


// Define the type for each chat message
interface ChatMessage {
    type: 'user' | 'bot';  // "user" or "bot"
    message: string;       // The message content
}

  
const ChatPage: React.FC = () => {
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize Google Gemini API
  const genAI = new GoogleGenerativeAI("AIzaSyDn_pPZRN1RihRU1Dk63rygqPXDTvqVVJI");
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  // Function to handle user input
  const handleUserInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };
  // Function to send user message to Gemini
  const sendMessage = async () => {
    if (userInput.trim() === '') return;

    setIsLoading(true);
    try {
      // Call Gemini API to get a response
      const result = await model.generateContent(userInput);
      const response = await result.response;
      console.log(response);
      setChatHistory((prevChatHistory) => [
        ...prevChatHistory,
        { type: "user", message: userInput },
        { type: "bot", message: response.text() }, 
      ]);
    } catch {
      console.error('Error sending message');
    } finally {
      setUserInput('');
      setIsLoading(false);
    }
  };

  // Function to clear the chat history
  const clearChat = () => {
    setChatHistory([]);
  };
  // Function to handle pressing Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-4">Chatbot</h1>
      <button
        className="ml-20 px-4 py-2 rounded-lg bg-gray-400 text-white hover:bg-gray-500 focus:outline-none"
        onClick={clearChat}
      >
        Clear Chat
      </button>
      <div className="chat-container rounded-lg shadow-md p-4">
        <ChatHistory chatHistory={chatHistory} />
      </div>
      <div className="flex mt-4">
        <input
          type="text"
          className="flex-grow px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type your message..."
          value={userInput}
          onChange={handleUserInput}
          onKeyDown={handleKeyDown}

        />
        <button
          className="px-4 py-2 ml-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 focus:outline-none"
          onClick={sendMessage}
          disabled={isLoading}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
