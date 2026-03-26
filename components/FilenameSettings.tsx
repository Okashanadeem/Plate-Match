"use client";

import React, { useState } from "react";
import { Settings, X, Info, Type, Hash, Code, Save, Check, AlertCircle, ChevronRight } from "lucide-react";
import { useDatasetStore } from "@/store/useDatasetStore";

interface FilenameSettingsProps {
  onClose: () => void;
}

export const FilenameSettings: React.FC<FilenameSettingsProps> = ({ onClose }) => {
  const { pattern, setPattern, images, currentIndex, getExtractedPlate, reconstructFilename } = useDatasetStore();
  const currentImage = images[currentIndex];
  
  const [localPattern, setLocalPattern] = useState(pattern);
  const [showSaved, setShowSaved] = useState(false);

  const handleSave = () => {
    setPattern(localPattern);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  const sampleName = currentImage?.originalFilename || "plate_AHG_699_20260213_200710_261.jpg";
  const extracted = getExtractedPlate(sampleName);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 p-4">
      {/* Modal Container - Centered Perfectly */}
      <div className="relative w-full max-w-lg bg-[#111114] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Simple Clean Header */}
        <div className="px-8 py-5 border-b border-white/5 bg-neutral-900/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-blue-500" />
            <h2 className="font-bold text-white text-base">Filename Settings</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-neutral-400 hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8 overflow-y-auto max-h-[75vh] custom-scrollbar">
          
          {/* Active File Label with Highlighter */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-1">Source File (Selection Preview)</label>
            <div className="p-4 bg-black/40 rounded-xl border border-white/5 font-mono text-xs overflow-hidden">
              <div className="flex flex-wrap gap-0">
                {(() => {
                  const name = sampleName.split('.')[0];
                  const ext = sampleName.includes('.') ? '.' + sampleName.split('.').pop() : '';
                  
                  if (!localPattern.isActive) return <span className="text-neutral-300">{sampleName}</span>;
                  
                  const start = name.substring(0, localPattern.startOffset);
                  const middle = name.substring(localPattern.startOffset, name.length - localPattern.endOffset);
                  const end = name.substring(name.length - localPattern.endOffset);
                  
                  return (
                    <>
                      <span className="text-red-500/50 bg-red-500/10 px-0.5 rounded" title="Removed by Start Offset">{start}</span>
                      <span className="text-green-400 bg-green-400/10 px-0.5 rounded font-bold" title="Selected Plate Area">{middle}</span>
                      <span className="text-red-500/50 bg-red-500/10 px-0.5 rounded" title="Removed by End Offset">{end}</span>
                      <span className="text-neutral-500">{ext}</span>
                    </>
                  );
                })()}
              </div>
            </div>
            <p className="text-[9px] text-neutral-600 px-1">Red areas are ignored. Green area is the Working Filename.</p>
          </div>

          {/* Clean Toggle Switch */}
          <div 
            onClick={() => setLocalPattern(p => ({ ...p, isActive: !p.isActive }))}
            className={`flex items-center justify-between p-5 rounded-xl border cursor-pointer transition-all ${
              localPattern.isActive ? 'bg-blue-600/5 border-blue-500/20' : 'bg-neutral-900/50 border-white/5'
            }`}
          >
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">Enable Pattern Extraction</h3>
              <p className="text-[10px] text-neutral-500 uppercase">Hide prefixes/suffixes while editing</p>
            </div>
            <div className={`relative w-12 h-6 rounded-full transition-colors ${localPattern.isActive ? 'bg-blue-600' : 'bg-neutral-700'}`}>
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${localPattern.isActive ? 'translate-x-6' : ''}`} />
            </div>
          </div>

          {/* Settings Group */}
          <div className={`space-y-6 transition-all ${localPattern.isActive ? 'opacity-100' : 'opacity-30'}`}>
            
            {/* Offsets Group (NEW) */}
            <div className="bg-white/5 rounded-2xl p-5 space-y-4">
              <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                <ChevronRight className="w-3 h-3" /> Area Selection (Offsets)
              </label>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase">Remove From Start</label>
                    <span className="text-[10px] font-mono text-neutral-500">{localPattern.startOffset} chars</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setLocalPattern(p => ({ ...p, startOffset: Math.max(0, p.startOffset - 1) }))}
                      className="w-10 h-10 rounded-lg bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-white"
                    >-</button>
                    <input 
                      type="number"
                      value={localPattern.startOffset}
                      onChange={(e) => setLocalPattern(p => ({ ...p, startOffset: parseInt(e.target.value) || 0 }))}
                      className="flex-1 bg-[#1c1c22] border border-white/5 rounded-lg h-10 text-center text-sm text-white font-mono outline-none focus:border-blue-500"
                    />
                    <button 
                      onClick={() => setLocalPattern(p => ({ ...p, startOffset: p.startOffset + 1 }))}
                      className="w-10 h-10 rounded-lg bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-white"
                    >+</button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase">Remove From End</label>
                    <span className="text-[10px] font-mono text-neutral-500">{localPattern.endOffset} chars</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setLocalPattern(p => ({ ...p, endOffset: Math.max(0, p.endOffset - 1) }))}
                      className="w-10 h-10 rounded-lg bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-white"
                    >-</button>
                    <input 
                      type="number"
                      value={localPattern.endOffset}
                      onChange={(e) => setLocalPattern(p => ({ ...p, endOffset: parseInt(e.target.value) || 0 }))}
                      className="flex-1 bg-[#1c1c22] border border-white/5 rounded-lg h-10 text-center text-sm text-white font-mono outline-none focus:border-blue-500"
                    />
                    <button 
                      onClick={() => setLocalPattern(p => ({ ...p, endOffset: p.endOffset + 1 }))}
                      className="w-10 h-10 rounded-lg bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-white"
                    >+</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                  <Type className="w-3 h-3" /> Prefix
                </label>
                <input 
                  type="text"
                  value={localPattern.prefix}
                  disabled={!localPattern.isActive}
                  onChange={(e) => setLocalPattern(p => ({ ...p, prefix: e.target.value, useRegex: false }))}
                  placeholder="e.g. plate_"
                  className="w-full bg-[#1c1c22] border border-white/5 rounded-xl p-3 text-sm text-white font-mono focus:border-blue-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                  <Hash className="w-3 h-3" /> Suffix
                </label>
                <input 
                  type="text"
                  value={localPattern.suffix}
                  disabled={!localPattern.isActive}
                  onChange={(e) => setLocalPattern(p => ({ ...p, suffix: e.target.value, useRegex: false }))}
                  placeholder="e.g. _2026"
                  className="w-full bg-[#1c1c22] border border-white/5 rounded-xl p-3 text-sm text-white font-mono focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Simple Regex Toggle */}
            <div className="flex items-center justify-between px-1">
               <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-neutral-500" />
                  <span className="text-xs text-neutral-400 font-medium">Use Regex Mode</span>
               </div>
               <button 
                onClick={() => setLocalPattern(p => ({ ...p, useRegex: !p.useRegex }))}
                className={`text-[10px] font-bold px-3 py-1 rounded-lg border transition-all ${
                  localPattern.useRegex ? 'bg-blue-600 border-blue-500 text-white' : 'bg-neutral-800 border-white/5 text-neutral-500'
                }`}
               >
                 {localPattern.useRegex ? 'ACTIVE' : 'ENABLE'}
               </button>
            </div>

            {localPattern.useRegex && (
              <input 
                type="text"
                value={localPattern.regex}
                onChange={(e) => setLocalPattern(p => ({ ...p, regex: e.target.value }))}
                className="w-full bg-black/40 border border-blue-500/30 rounded-xl p-3 text-xs text-blue-400 font-mono"
                placeholder="Regex pattern..."
              />
            )}

            {/* Simple Simulation View */}
            <div className="bg-neutral-900/50 rounded-2xl border border-white/5 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-neutral-500 uppercase flex items-center gap-2">
                  <Info className="w-3.5 h-3.5" /> Preview
                </span>
                <button 
                  onClick={() => setLocalPattern(p => ({ ...p, exportOnlyPlate: !p.exportOnlyPlate }))}
                  className="text-[10px] font-bold text-blue-500 hover:underline"
                >
                  {localPattern.exportOnlyPlate ? 'Export Mode: Plate Only' : 'Export Mode: Full Name'}
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Sidebar Edit Area:</span>
                  <span className="font-mono text-blue-400 font-bold">{extracted || "—"}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Final Export File:</span>
                  <span className="font-mono text-green-500 font-bold truncate max-w-[200px]">
                    {(() => {
                      const lastDotIndex = sampleName.lastIndexOf('.');
                      const ext = lastDotIndex !== -1 ? sampleName.substring(lastDotIndex) : '';
                      
                      if (!localPattern.isActive) return (extracted || "PLATE") + ext;
                      
                      return localPattern.exportOnlyPlate 
                        ? (extracted || "PLATE") + ext
                        : reconstructFilename(sampleName, extracted || "PLATE")
                    })()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Clean Footer */}
        <div className="px-8 py-5 border-t border-white/5 bg-neutral-900/30 flex items-center justify-between">
          <button onClick={onClose} className="text-xs font-bold text-neutral-500 hover:text-white transition-colors">
            Discard
          </button>
          <button 
            onClick={handleSave}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs transition-all ${
              showSaved ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'
            }`}
          >
            {showSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {showSaved ? 'Applied' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};
