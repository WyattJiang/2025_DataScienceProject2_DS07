import React from 'react';
import { X } from 'lucide-react';
import ChatPage from '../ChatPage';

type ChatPanelProps = {
  onClose: () => void;
};

const ChatPanel: React.FC<ChatPanelProps> = ({ onClose }) => {
  return (
    <div className="absolute top-[calc(var(--header-height)+0.5rem)] lg:top-2 right-2 bottom-2 w-full max-w-sm lg:w-80 max-h-[calc(100%-var(--header-height)-1rem)] lg:max-h-[calc(100vh-5rem)] bg-white shadow-lg rounded-lg border border-gray-200 flex flex-col z-[1000]">
      <div className="flex justify-between items-center p-3 border-b border-gray-200 flex-shrink-0">
        <h3 className="text-base font-semibold text-gray-800">Chat Assistant</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1" title="Close Chat">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <ChatPage />
      </div>
    </div>
  );
};

export default ChatPanel;