import React, { useState, useEffect, useMemo } from 'react';
import { 
  Menu, Search, Settings, Copy, Save, Trash2, Share2, 
  Layers, ChevronRight, Wand2, Video, Activity, Sparkles, MapPin, Lightbulb
} from 'lucide-react';
import { CATEGORIES, INITIAL_PROMPT_STATE } from './constants';
import { Category, PromptState, Option, Tab, Template } from './types';
import CategorySection from './components/CategorySection';
import CustomInputModal from './components/CustomInputModal';
import TemplateCard from './components/TemplateCard';

const STORAGE_KEY = 'vidgen_templates';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('build');
  const [promptState, setPromptState] = useState<PromptState>(INITIAL_PROMPT_STATE);
  const [openCategory, setOpenCategory] = useState<string | null>('camera');
  const [activeCustomModal, setActiveCustomModal] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load templates on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setTemplates(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse templates");
      }
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSelectOption = (categoryId: string, option: Option) => {
    setPromptState(prev => {
      const category = CATEGORIES.find(c => c.id === categoryId);
      if (!category) return prev;

      if (category.allowMultiple) {
        // Prevent duplicates
        if (prev[categoryId].some(o => o.id === option.id)) return prev;
        return { ...prev, [categoryId]: [...prev[categoryId], option] };
      } else {
        return { ...prev, [categoryId]: [option] };
      }
    });
  };

  const handleRemoveOption = (categoryId: string, optionId: string) => {
    setPromptState(prev => ({
      ...prev,
      [categoryId]: prev[categoryId].filter(o => o.id !== optionId)
    }));
  };

  const handleCustomSave = (text: string) => {
    if (!activeCustomModal) return;
    const newOption: Option = {
      id: `custom_${Date.now()}`,
      label: text,
      value: text,
      isCustom: true
    };
    handleSelectOption(activeCustomModal, newOption);
  };

  const saveTemplate = () => {
    if (!newTemplateName.trim()) return;
    
    const newTemplate: Template = {
      id: Date.now().toString(),
      name: newTemplateName,
      description: '',
      data: promptState,
      createdAt: Date.now(),
      tags: ['Custom']
    };

    const updated = [newTemplate, ...templates];
    setTemplates(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setNewTemplateName('');
    setShowSaveModal(false);
    showToast('Template saved successfully!');
  };

  const deleteTemplate = (id: string) => {
    const updated = templates.filter(t => t.id !== id);
    setTemplates(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const loadTemplate = (template: Template) => {
    setPromptState(template.data);
    setActiveTab('build');
    showToast('Template loaded!');
  };

  const clearPrompt = () => {
    setPromptState(INITIAL_PROMPT_STATE);
    showToast('Prompt cleared');
  };

  const constructedPrompt = useMemo(() => {
    // Order matters for video prompts usually: Style + Subject + Action + Environment + Lighting + Camera + Quality
    const order = ['style', 'subject', 'environment', 'lighting', 'camera', 'quality'];
    let parts: string[] = [];
    
    order.forEach(catId => {
      if (promptState[catId]) {
        parts = [...parts, ...promptState[catId].map(o => o.value)];
      }
    });

    return parts.join(', ');
  }, [promptState]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(constructedPrompt);
    showToast('Copied to clipboard!');
  };

  // --- Render Helpers ---

  const renderBuildTab = () => (
    <div className="pb-24 md:pb-0 space-y-4">
      {CATEGORIES.map(category => (
        <CategorySection
          key={category.id}
          category={category}
          selectedOptions={promptState[category.id] || []}
          isOpen={openCategory === category.id}
          onToggle={() => setOpenCategory(openCategory === category.id ? null : category.id)}
          onSelect={(opt) => handleSelectOption(category.id, opt)}
          onRemove={(optId) => handleRemoveOption(category.id, optId)}
          onOpenCustom={() => setActiveCustomModal(category.id)}
        />
      ))}
    </div>
  );

  const renderPreviewTab = () => (
    <div className="h-full flex flex-col pb-24 md:pb-0">
      <div className="flex-1 bg-black rounded-2xl overflow-hidden border border-dark-border relative flex items-center justify-center mb-6 min-h-[300px]">
        {/* Visual Animation Placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black z-0">
           {/* Grid Pattern */}
           <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(#FB8C00 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
        </div>
        
        {/* Simulated Scene Elements */}
        <div className={`relative z-10 w-32 h-32 bg-orange-500 rounded-lg shadow-[0_0_50px_rgba(251,140,0,0.5)] 
          ${promptState.camera.some(o => o.id === 'zoom_in') ? 'animate-zoom-in' : ''}
          ${promptState.camera.some(o => o.id === 'pan_left') ? 'animate-pan-left' : ''}
        `}>
          <div className="absolute inset-0 flex items-center justify-center text-black font-bold">
            Preview
          </div>
        </div>

        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur px-3 py-1 rounded text-xs text-orange-500 font-mono border border-orange-500/30">
          Simulation Mode
        </div>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-xl p-5 shadow-lg">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-orange-500 font-bold flex items-center gap-2">
            <Sparkles size={16} /> Live Prompt Preview
          </h3>
          <span className="text-xs text-dark-subtext">{constructedPrompt.length} chars</span>
        </div>
        <p className="text-white font-mono text-sm leading-relaxed min-h-[100px]">
          {constructedPrompt || <span className="text-gray-600 italic">Select options to build your prompt...</span>}
        </p>
        <button 
          onClick={copyToClipboard}
          className="mt-4 w-full py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Copy size={16} /> Copy Text
        </button>
      </div>
    </div>
  );

  const renderOutputTab = () => (
    <div className="pb-24 md:pb-0">
      <div className="bg-gradient-to-b from-dark-card to-dark-bg border border-dark-border rounded-2xl p-6 mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Final Output</h2>
        <div className="bg-black/50 border border-white/10 rounded-xl p-6 mb-6">
          <p className="font-mono text-gray-200 leading-relaxed text-lg">
            {constructedPrompt || "Your prompt is empty."}
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button 
            onClick={copyToClipboard}
            className="col-span-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Copy size={18} /> Copy to Clipboard
          </button>
          <button 
            onClick={() => setShowSaveModal(true)}
            className="bg-dark-card border border-dark-border hover:border-orange-500 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            <Save size={18} /> Save Template
          </button>
          <button 
             onClick={clearPrompt}
             className="bg-dark-card border border-dark-border hover:border-red-500 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            <Trash2 size={18} /> Clear All
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Layers size={20} className="text-orange-500" /> Saved Templates
        </h3>
        {templates.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-dark-border rounded-xl">
            <p className="text-dark-subtext">No saved templates yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map(t => (
              <TemplateCard 
                key={t.id} 
                template={t} 
                onLoad={loadTemplate} 
                onDelete={deleteTemplate} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // --- Main Layout ---

  return (
    <div className="min-h-screen bg-dark-bg text-white font-sans selection:bg-orange-500/30">
      
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-dark-bg/90 backdrop-blur-md border-b border-dark-border px-4 py-3 md:px-6 md:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Video className="text-white" size={20} />
          </div>
          <h1 className="text-lg md:text-xl font-bold tracking-tight">VidGen <span className="text-orange-500">Builder</span></h1>
        </div>
        
        <div className="flex items-center gap-3">
           <button className="p-2 text-dark-subtext hover:text-white transition-colors md:hidden">
            <Search size={22} />
           </button>
           <button className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-dark-card border border-dark-border text-xs font-medium text-dark-subtext hover:border-orange-500/50 transition-all">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              v1.0.0
           </button>
           <button className="p-2 text-dark-subtext hover:text-orange-500 transition-colors">
            <Settings size={22} />
           </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        
        {/* Desktop Grid Layout (Visible on md+) */}
        <div className="hidden md:grid md:grid-cols-12 gap-6 lg:gap-8 h-[calc(100vh-140px)]">
          
          {/* Left Panel - Builder (3 cols) */}
          <div className="md:col-span-5 lg:col-span-4 overflow-y-auto no-scrollbar pr-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Wand2 size={18} className="text-orange-500" /> Builder
              </h2>
              <button 
                onClick={clearPrompt} 
                className="text-xs text-red-400 hover:text-red-300 underline"
              >
                Reset
              </button>
            </div>
            {renderBuildTab()}
          </div>

          {/* Center Panel - Preview (4 cols) */}
          <div className="md:col-span-7 lg:col-span-5 flex flex-col">
             <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                <Activity size={18} className="text-orange-500" /> Live Preview
              </h2>
             {renderPreviewTab()}
          </div>

          {/* Right Panel - Output & Templates (3 cols, hidden on smaller desktop, visible on large) */}
          <div className="hidden lg:block lg:col-span-3 overflow-y-auto no-scrollbar pl-2 border-l border-dark-border">
             {renderOutputTab()}
          </div>
        </div>

        {/* Mobile View (Tab Content) */}
        <div className="md:hidden">
          {activeTab === 'build' && renderBuildTab()}
          {activeTab === 'preview' && renderPreviewTab()}
          {activeTab === 'output' && renderOutputTab()}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-card/90 backdrop-blur-lg border-t border-dark-border pb-safe z-40">
        <div className="flex justify-around items-center h-16">
          <button 
            onClick={() => setActiveTab('build')}
            className={`flex flex-col items-center gap-1 w-full h-full justify-center ${activeTab === 'build' ? 'text-orange-500' : 'text-gray-500'}`}
          >
            <Wand2 size={24} />
            <span className="text-[10px] font-medium">Build</span>
          </button>
          <button 
            onClick={() => setActiveTab('preview')}
            className={`flex flex-col items-center gap-1 w-full h-full justify-center ${activeTab === 'preview' ? 'text-orange-500' : 'text-gray-500'}`}
          >
            <Video size={24} />
            <span className="text-[10px] font-medium">Preview</span>
          </button>
          <button 
            onClick={() => setActiveTab('output')}
            className={`flex flex-col items-center gap-1 w-full h-full justify-center ${activeTab === 'output' ? 'text-orange-500' : 'text-gray-500'}`}
          >
            <Share2 size={24} />
            <span className="text-[10px] font-medium">Output</span>
          </button>
        </div>
      </nav>

      {/* Modals */}
      <CustomInputModal 
        isOpen={!!activeCustomModal}
        onClose={() => setActiveCustomModal(null)}
        onSave={handleCustomSave}
        title={activeCustomModal ? CATEGORIES.find(c => c.id === activeCustomModal)?.title || 'Custom Input' : ''}
        placeholder={`Describe your custom ${activeCustomModal ? CATEGORIES.find(c => c.id === activeCustomModal)?.title.toLowerCase().slice(0, -1) : 'option'}...`}
      />

      {/* Save Template Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
           <div className="bg-dark-card border border-orange-500/30 w-full max-w-sm rounded-2xl p-6 shadow-2xl">
              <h3 className="text-xl font-bold mb-4">Save Template</h3>
              <input 
                type="text" 
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="Template Name (e.g., Cinematic Sci-Fi)"
                className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-white mb-6 focus:border-orange-500 outline-none"
                autoFocus
              />
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 py-2 rounded-lg font-semibold text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  onClick={saveTemplate}
                  className="flex-1 py-2 rounded-lg font-bold bg-orange-600 text-white hover:bg-orange-500"
                >
                  Save
                </button>
              </div>
           </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-white text-black px-6 py-3 rounded-full shadow-2xl z-50 animate-bounce-in font-semibold flex items-center gap-2">
           <div className="w-2 h-2 bg-green-500 rounded-full"></div>
           {toastMessage}
        </div>
      )}

    </div>
  );
}

export default App;
