import React from 'react';
import { X } from 'lucide-react';
import TrendGraphPanel from '../TrendGraphPanel';

type TrendGraphModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const TrendGraphModal: React.FC<TrendGraphModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[1000] flex items-center justify-center">
      <div className="bg-white w-[90vw] h-[90vh] rounded-lg shadow-xl p-4 relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          title="Close"
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-semibold mb-4">Trend Graph</h2>
        <TrendGraphPanel />
      </div>
    </div>
  );
};

export default TrendGraphModal;