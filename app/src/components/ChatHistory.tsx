import React from 'react';
import ReactMarkdown from 'react-markdown';

// Define the type for each chat message
interface ChatMessage {
  type: 'user' | 'bot';  // "user" or "bot"
  message: string;       // The message content
}

// Define the props type for the ChatHistory component
interface ChatHistoryProps {
  chatHistory: ChatMessage[];  // An array of chat messages
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ chatHistory }) => {
  return (
    <>
      {chatHistory.map((message, index) => (
        <div
          key={index}
          className={`flex items-start py-2 px-4 rounded-lg ${
            message.type === 'user'
              ? 'bg-gray-100 text-gray-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          {message.type === 'user' && (
            <span className="mr-2 font-bold text-gray-600">You:</span>
          )}

          <div>
            <ReactMarkdown>{message.message}</ReactMarkdown>
          </div>
        </div>
      ))}
    </>
  );
};

export default ChatHistory;
