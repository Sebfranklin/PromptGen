import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, Search, Settings, Copy, Save, Trash2, Share2, 
  Layers, ChevronRight, Wand2, Video, Activity, Sparkles, MapPin, Lightbulb,
  User, Footprints, Wind, Music, MessageCircle, Utensils, Moon, 
  Aperture, Film, Timer, ScanFace, Gauge, Play, Pause, Rewind, FastForward
} from 'lucide-react';
import { CATEGORIES, INITIAL_PROMPT_STATE } from './constants';
import { Category, PromptState, Option, Tab, Template } from './types';
import CategorySection from './components/CategorySection';
import CustomInputModal from './components/CustomInputModal';
import TemplateCard from './components/TemplateCard';

const STORAGE_KEY = 'vidgen_templates';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('build');
  
  // Builder State (Visual selections for Simulation)
  const [promptState, setPromptState] = useState<PromptState>(INITIAL_PROMPT_STATE);
  
  // Editor State (The actual text output)
  const [customText, setCustomText] = useState('');
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  
  // UI State
  const [openCategory, setOpenCategory] = useState<string | null>('camera');
  const [activeCustomModal, setActiveCustomModal] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Simulation State
  const [animSpeed, setAnimSpeed] = useState(1);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

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

  const updateCustomText = (text: string) => {
    setCustomText(text);
  };

  const handleSelectOption = (categoryId: string, option: Option) => {
    // 1. Update Visual State (PromptState) for Simulation
    setPromptState(prev => {
      const category = CATEGORIES.find(c => c.id === categoryId);
      if (!category) return prev;

      if (category.allowMultiple) {
        if (prev[categoryId].some(o => o.id === option.id)) return prev;
        return { ...prev, [categoryId]: [...prev[categoryId], option] };
      } else {
        return { ...prev, [categoryId]: [option] };
      }
    });

    // 2. Insert Text at Cursor Position
    const textToInsert = option.value;
    const currentText = customText;
    
    // Use saved cursor position or end of text
    const insertAt = cursorPosition !== null ? cursorPosition : currentText.length;
    
    // Add comma if not at start and previous char isn't space/comma
    let prefix = '';
    if (insertAt > 0) {
      const prevChar = currentText[insertAt - 1];
      if (prevChar && ![' ', ',', '\n'].includes(prevChar)) {
        prefix = ', ';
      }
    }

    const newText = 
      currentText.slice(0, insertAt) + 
      prefix + textToInsert + 
      currentText.slice(insertAt);
    
    setCustomText(newText);
    
    // Update cursor position to end of insertion
    const newCursorPos = insertAt + prefix.length + textToInsert.length;
    setCursorPosition(newCursorPos);
    
    // Focus back on textarea after a short delay to allow render
    setTimeout(() => {
      if (textAreaRef.current) {
        textAreaRef.current.focus();
        textAreaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 10);
  };

  const handleRemoveOption = (categoryId: string, optionId: string) => {
    // 1. Update Visual State
    let optionToRemove: Option | undefined;
    setPromptState(prev => {
      optionToRemove = prev[categoryId].find(o => o.id === optionId);
      return {
        ...prev,
        [categoryId]: prev[categoryId].filter(o => o.id !== optionId)
      };
    });

    // 2. Attempt to remove text (Simple string replacement)
    // Note: This might be risky if user edited text manually, but expected behavior for a toggle.
    if (optionToRemove) {
      // Create regex to remove the value and potential trailing/leading comma
      // This is a basic removal strategy
      const val = optionToRemove.value;
      // Try to remove "value, " or ", value" or just "value"
      let newText = customText.replace(new RegExp(`,\\s*${val}`, 'i'), ''); // Remove leading comma
      if (newText === customText) {
        newText = customText.replace(new RegExp(`${val},\\s*`, 'i'), ''); // Remove trailing comma
      }
      if (newText === customText) {
        newText = customText.replace(val, ''); // Remove just value
      }
      setCustomText(newText);
    }
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
    
    // Snapshot the current custom text as the "data" effectively
    // Since we moved to customText being source of truth, we might need to store text specifically
    // But to keep Template type compatible, we save the promptState. 
    // *Enhancement*: We should probably save the raw text too if we redesigned types, 
    // but for now let's assume the template restores the visual buttons.
    
    const newTemplate: Template = {
      id: Date.now().toString(),
      name: newTemplateName,
      description: customText.slice(0, 50),
      data: promptState, // This saves the button state
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
    // Reconstruct text from template data
    const order = ['style', 'subject', 'environment', 'lighting', 'camera', 'quality'];
    let parts: string[] = [];
    order.forEach(catId => {
      if (template.data[catId]) {
        parts = [...parts, ...template.data[catId].map(o => o.value)];
      }
    });
    setCustomText(parts.join(', '));
    setActiveTab('build');
    showToast('Template loaded!');
  };

  const clearPrompt = () => {
    setPromptState(INITIAL_PROMPT_STATE);
    setCustomText('');
    showToast('Prompt cleared');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(customText);
    showToast('Copied to clipboard!');
  };

  // --- Simulation Helpers ---
  const getSimulationConfig = () => {
    // Calculate durations based on speed
    // Base durations: Zoom/Pan = 15s, Handheld = 4s, Bob/Run = dynamic
    const baseSlow = 15;
    const baseFast = 4;
    
    const durationSlow = `${baseSlow / animSpeed}s`;
    const durationFast = `${baseFast / animSpeed}s`;

    // 1. Camera Animation
    let cameraAnim = '';
    const camIds = promptState.camera.map(o => o.id);
    if (camIds.includes('zoom_in')) cameraAnim = 'animate-zoom-in';
    else if (camIds.includes('zoom_out')) cameraAnim = 'animate-zoom-out';
    else if (camIds.includes('pan_left')) cameraAnim = 'animate-pan-left';
    else if (camIds.includes('pan_right')) cameraAnim = 'animate-pan-right';
    
    const isHandheld = camIds.includes('handheld');
    const containerAnim = isHandheld ? 'animate-handheld' : '';

    // 2. Lighting Overlay
    let lightingClass = 'bg-transparent';
    const lightId = promptState.lighting[0]?.id;
    if (lightId === 'golden_hour') lightingClass = 'bg-gradient-to-tr from-orange-500/30 via-yellow-500/10 to-transparent mix-blend-overlay';
    if (lightId === 'blue_hour') lightingClass = 'bg-gradient-to-tr from-blue-900/50 via-blue-500/20 to-transparent mix-blend-overlay';
    if (lightId === 'neon') lightingClass = 'bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-cyan-600/30 mix-blend-screen';
    if (lightId === 'studio') lightingClass = 'bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_0%,rgba(0,0,0,0.4)_100%)]';
    if (lightId === 'natural') lightingClass = 'bg-white/5';

    // 3. Environment Background
    let envClass = 'bg-gray-900';
    let EnvIcon = null;
    const envId = promptState.environment[0]?.id;
    if (envId === 'forest') envClass = 'bg-gradient-to-b from-green-950 to-emerald-950';
    if (envId === 'city') envClass = 'bg-gradient-to-b from-slate-800 to-gray-950';
    if (envId === 'space') envClass = 'bg-black';
    if (envId === 'beach') envClass = 'bg-gradient-to-b from-sky-900 via-sky-800 to-amber-900/50';
    
    // 4. Subject Icon & Anim
    let SubjectIcon = User;
    let subjectAnim = '';
    const subjId = promptState.subject[0]?.id;
    if (subjId === 'walking') { SubjectIcon = Footprints; subjectAnim = 'animate-bob'; }
    else if (subjId === 'running') { SubjectIcon = Wind; subjectAnim = 'animate-run'; }
    else if (subjId === 'dancing') { SubjectIcon = Music; subjectAnim = 'animate-pulse'; }
    else if (subjId === 'talking') { SubjectIcon = MessageCircle; subjectAnim = 'animate-pulse-slow'; }
    else if (subjId === 'eating') { SubjectIcon = Utensils; }
    else if (subjId === 'sleeping') { SubjectIcon = Moon; subjectAnim = 'opacity-50'; }

    // Subject animation duration override
    // Walk/Run need faster updates
    const subjectDuration = subjId === 'running' ? `${0.4 / animSpeed}s` : `${2 / animSpeed}s`;

    // 5. Style
    const styleId = promptState.style[0]?.id;
    const isCinematic = styleId === 'cinematic';
    const isAnime = styleId === 'anime';

    return { 
      cameraAnim, containerAnim, lightingClass, envClass, 
      SubjectIcon, subjectAnim, isCinematic, isAnime,
      durationSlow, durationFast, subjectDuration
    };
  };

  const sim = getSimulationConfig();

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
      {/* Simulation Window */}
      <div className="flex-none bg-black rounded-2xl overflow-hidden border border-dark-border relative flex items-center justify-center mb-4 min-h-[300px] shadow-2xl group">
        
        {/* Cinematic Black Bars */}
        {sim.isCinematic && (
          <div className="absolute inset-0 z-40 pointer-events-none flex flex-col justify-between">
            <div className="h-[10%] bg-black w-full"></div>
            <div className="h-[10%] bg-black w-full"></div>
          </div>
        )}

        {/* Viewfinder UI */}
        <div className="absolute inset-0 z-30 pointer-events-none p-4 md:p-6 flex flex-col justify-between opacity-80">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <span className="text-red-500 font-bold flex items-center gap-2 animate-pulse text-xs">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div> REC
              </span>
              <span className="font-mono text-[10px] text-white/70">00:00:14:22</span>
            </div>
            
            {/* Speed Control Indicator (Top Right) */}
            <div className="pointer-events-auto bg-black/40 backdrop-blur rounded-lg border border-white/10 p-1.5 flex items-center gap-2">
               <Gauge size={14} className="text-orange-500" />
               <input 
                 type="range" 
                 min="0.1" 
                 max="3" 
                 step="0.1" 
                 value={animSpeed}
                 onChange={(e) => setAnimSpeed(parseFloat(e.target.value))}
                 className="w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-orange-500"
               />
               <span className="text-[10px] font-mono w-6 text-right">{animSpeed.toFixed(1)}x</span>
            </div>
          </div>
          
          {/* Center Crosshair */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 border border-white/20">
             <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/20"></div>
             <div className="absolute top-0 left-1/2 h-full w-[1px] bg-white/20"></div>
          </div>

          <div className="flex justify-between items-end">
            <div className="text-[10px] font-mono text-white/70 flex items-center gap-2">
              <Aperture size={12} /> F2.8
            </div>
            <div className="text-[10px] font-mono text-white/70 flex items-center gap-2">
              <Film size={12} /> {sim.isCinematic ? '24 FPS' : '60 FPS'}
            </div>
          </div>
        </div>

        {/* Simulation Container */}
        <div 
          className={`relative w-full h-full overflow-hidden ${sim.containerAnim}`}
          style={{ animationDuration: sim.durationFast }}
        >
          
          {/* Camera Movement Wrapper */}
          <div 
            className={`absolute inset-0 w-full h-full ${sim.cameraAnim} transition-transform`}
            style={{ animationDuration: sim.durationSlow }}
          >
            
            {/* Environment Background */}
            <div className={`absolute inset-0 w-full h-full ${sim.envClass} transition-colors duration-500`}>
               <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px'}}></div>
               {promptState.environment[0]?.id === 'space' && (
                 <div className="absolute inset-0 opacity-80" style={{backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '50px 50px'}}></div>
               )}
            </div>

            {/* Subject */}
            <div className="absolute inset-0 flex items-center justify-center">
               <div 
                 className={`relative z-10 p-6 rounded-full bg-orange-500/10 border border-orange-500/50 backdrop-blur-sm shadow-[0_0_30px_rgba(251,140,0,0.3)] transition-all ${sim.subjectAnim}`}
                 style={{ animationDuration: sim.subjectDuration }}
               >
                 <sim.SubjectIcon size={48} className={`text-orange-500 ${sim.isAnime ? 'stroke-[3px]' : 'stroke-2'}`} />
               </div>
               <div className="absolute top-1/2 mt-12 w-24 h-4 bg-black/40 blur-md rounded-[100%]"></div>
            </div>

          </div>

          {/* Lighting Overlay */}
          <div className={`absolute inset-0 z-20 pointer-events-none ${sim.lightingClass} transition-all duration-500`}></div>
          
          {/* Scanlines */}
          {promptState.style[0]?.id === 'cyberpunk' && (
            <div className="absolute inset-0 z-20 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]"></div>
          )}
        </div>
      </div>

      {/* Editor Section */}
      <div className="flex-1 bg-dark-card border border-dark-border rounded-xl p-4 shadow-lg flex flex-col min-h-[200px]">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-orange-500 font-bold flex items-center gap-2">
            <Sparkles size={16} /> Live Prompt Editor
          </h3>
          <span className="text-xs text-dark-subtext bg-black/20 px-2 py-1 rounded">
             {customText.length} chars
          </span>
        </div>
        
        <textarea
          ref={textAreaRef}
          value={customText}
          onChange={(e) => {
             updateCustomText(e.target.value);
             setCursorPosition(e.target.selectionStart);
          }}
          onClick={(e) => setCursorPosition(e.currentTarget.selectionStart)}
          onKeyUp={(e) => setCursorPosition(e.currentTarget.selectionStart)}
          placeholder="Start typing your prompt here, or click categories to insert options at your cursor..."
          className="flex-1 w-full bg-dark-bg/50 border border-dark-border rounded-lg p-3 text-white font-mono text-sm leading-relaxed focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none resize-none no-scrollbar"
        />

        <div className="mt-3 flex gap-2">
            <button 
              onClick={copyToClipboard}
              className="flex-1 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Copy size={16} /> Copy
            </button>
            <button 
              onClick={clearPrompt}
              className="px-3 py-2 bg-dark-bg hover:bg-red-900/20 text-dark-subtext hover:text-red-400 border border-dark-border rounded-lg transition-colors text-sm"
              title="Clear Text"
            >
              <Trash2 size={16} />
            </button>
        </div>
      </div>
    </div>
  );

  const renderOutputTab = () => (
    <div className="pb-24 md:pb-0">
      <div className="bg-gradient-to-b from-dark-card to-dark-bg border border-dark-border rounded-2xl p-6 mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Final Output</h2>
        <div className="bg-black/50 border border-white/10 rounded-xl p-6 mb-6">
          <p className="font-mono text-gray-200 leading-relaxed text-lg">
            {customText || "Your prompt is empty."}
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