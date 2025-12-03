import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

interface CustomInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (text: string) => void;
  title: string;
  placeholder: string;
}

const CustomInputModal: React.FC<CustomInputModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  title, 
  placeholder 
}) => {
  const [text, setText] = useState('');

  useEffect(() => {
    if (isOpen) {
      setText('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (text.trim()) {
      onSave(text.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full sm:w-[500px] bg-dark-card border-t sm:border border-orange-500/30 rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl transform transition-transform duration-300">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-dark-subtext hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          className="w-full h-32 bg-dark-bg border border-dark-border rounded-xl p-4 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none resize-none mb-6"
          autoFocus
        />

        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-lg font-semibold border-2 border-dark-border text-dark-subtext hover:border-white/20 hover:text-white transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={!text.trim()}
            className={`flex-1 py-3 px-4 rounded-lg font-bold text-white shadow-lg flex items-center justify-center gap-2
              ${text.trim() 
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-orange-500/20' 
                : 'bg-dark-border text-gray-500 cursor-not-allowed'}`}
          >
            <Check size={18} />
            Add to Prompt
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomInputModal;
