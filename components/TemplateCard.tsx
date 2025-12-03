import React from 'react';
import { Trash2, Copy, Edit2 } from 'lucide-react';
import { Template, Option } from '../types';

interface TemplateCardProps {
  template: Template;
  onLoad: (template: Template) => void;
  onDelete: (id: string) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onLoad, onDelete }) => {
  const date = new Date(template.createdAt).toLocaleDateString();
  const previewText = Object.values(template.data)
    .flat()
    .map((o: Option) => o.value)
    .join(', ')
    .slice(0, 100) + '...';

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-5 hover:border-orange-500/50 transition-all group w-full flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h4 className="text-lg font-bold text-white truncate pr-2">{template.name}</h4>
          <span className="text-xs text-dark-subtext bg-white/5 px-2 py-1 rounded">{date}</span>
        </div>
        
        {template.tags && template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {template.tags.map(tag => (
              <span key={tag} className="text-[10px] uppercase tracking-wider font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
        
        <p className="text-sm text-dark-subtext line-clamp-3 mb-4 font-mono bg-dark-bg p-3 rounded-lg border border-white/5">
          {previewText}
        </p>
      </div>

      <div className="flex gap-2 mt-auto">
        <button 
          onClick={() => onLoad(template)}
          className="flex-1 bg-orange-600/20 hover:bg-orange-600 text-orange-500 hover:text-white py-2 px-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2"
        >
          Use
        </button>
        <button 
          onClick={() => onDelete(template.id)}
          className="p-2 bg-dark-bg text-dark-subtext hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors border border-dark-border"
          aria-label="Delete template"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default TemplateCard;