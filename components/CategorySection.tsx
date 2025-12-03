import React from 'react';
import { ChevronDown, ChevronUp, Plus, X } from 'lucide-react';
import { Category, Option } from '../types';

interface CategorySectionProps {
  category: Category;
  selectedOptions: Option[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (option: Option) => void;
  onRemove: (optionId: string) => void;
  onOpenCustom: () => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  selectedOptions,
  isOpen,
  onToggle,
  onSelect,
  onRemove,
  onOpenCustom
}) => {
  // Lucide icons map would go here in a real large app, passing icon name as string
  
  return (
    <div className="mb-4 bg-dark-card border border-dark-border rounded-2xl overflow-hidden transition-all duration-300">
      {/* Header */}
      <button 
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <h3 className="text-lg md:text-xl font-bold text-white">{category.title}</h3>
          {selectedOptions.length > 0 && (
            <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {selectedOptions.length}
            </span>
          )}
        </div>
        {isOpen ? <ChevronUp className="text-orange-500" /> : <ChevronDown className="text-dark-subtext" />}
      </button>

      {/* Selected Chips (Always visible if items selected, or inside accordion? Design says accordion header shows count, but chips are useful) */}
      {/* Design Prompt: "Selected Items (3) [Zoom In x]..." at top. But keeping chips inside category for context is also good UX. Let's put them inside when open. */}

      {isOpen && (
        <div className="px-4 pb-5 md:px-5 md:pb-6">
          <p className="text-sm text-dark-subtext mb-4">{category.description}</p>
          
          {/* Active Chips Area */}
          {selectedOptions.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedOptions.map(opt => (
                <div 
                  key={opt.id}
                  className="flex items-center gap-1.5 bg-orange-500/20 border border-orange-500 text-orange-100 px-3 py-1.5 rounded-full text-sm animate-fade-in"
                >
                  <span className="truncate max-w-[150px]">{opt.label}</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onRemove(opt.id); }}
                    className="hover:bg-orange-500 rounded-full p-0.5 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Options Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {category.options.map(option => {
              const isSelected = selectedOptions.some(o => o.id === option.id);
              return (
                <button
                  key={option.id}
                  onClick={() => isSelected ? onRemove(option.id) : onSelect(option)}
                  className={`
                    relative px-4 py-3 rounded-xl text-sm font-medium text-left transition-all duration-200 border
                    ${isSelected 
                      ? 'bg-gradient-to-br from-orange-500 to-orange-600 border-orange-500 text-white shadow-lg shadow-orange-500/20' 
                      : 'bg-dark-bg border-dark-border text-dark-subtext hover:border-orange-500/50 hover:text-white hover:bg-dark-bg/80'}
                  `}
                >
                  {option.label}
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full"></div>
                  )}
                </button>
              );
            })}
            
            {/* Custom Button */}
            <button
              onClick={onOpenCustom}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-orange-500 border-2 border-dashed border-orange-500/30 hover:border-orange-500 hover:bg-orange-500/10 transition-all"
            >
              <Plus size={16} />
              Custom
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySection;
