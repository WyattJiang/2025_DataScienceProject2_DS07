import React from 'react';
import { X } from 'lucide-react';
import HowToDropdown from './HowToDropdown';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const HowToModal: React.FC<Props> = ({ isOpen, onClose }) => {


  if (!isOpen) return null;

  

  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-red-50 w-[100vw] h-[80vh] max-w-4xl rounded-lg shadow-xl p-6 relative overflow-auto max-h-2xl">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
          <X className="w-6 h-6 mr-3 mt-3" />
        </button>
        <h2 className="text-4xl text-center underline font-semibold mb-4">Climates Features</h2>

        <HowToDropdown/>
      </div>
    </div>
  );
};

export default HowToModal;
