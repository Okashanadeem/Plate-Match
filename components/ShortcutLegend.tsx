"use client";

import React from "react";
import { Keyboard, X, MousePointer2, Type, CheckCircle2, AlertCircle, HelpCircle, XCircle, ArrowRight, ArrowLeft, Copy } from "lucide-react";
import { useDatasetStore } from "@/store/useDatasetStore";

export const ShortcutLegend: React.FC = () => {
  const { showShortcuts, setShowShortcuts } = useDatasetStore();

  if (!showShortcuts) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm transition-all animate-in fade-in duration-200">
      {/* Backdrop Click to Close */}
      <div className="absolute inset-0" onClick={() => setShowShortcuts(false)} />

      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-neutral-800 bg-neutral-900/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20">
              <Keyboard className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Keyboard Shortcuts</h2>
              <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider mt-0.5">Productivity Guide</p>
            </div>
          </div>
          <button 
            onClick={() => setShowShortcuts(false)}
            className="p-3 hover:bg-neutral-800 text-neutral-500 hover:text-white rounded-2xl transition-all active:scale-90"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Annotation Group */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-neutral-400 mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Annotation Actions</span>
              </div>
              <div className="space-y-3">
                <ShortcutRow icon={<CheckCircle2 className="text-green-500" />} label="Approve Image" keys={["W", "Enter"]} />
                <ShortcutRow icon={<HelpCircle className="text-amber-500" />} label="Mark as Unclear" keys={["U"]} />
                <ShortcutRow icon={<Copy className="text-blue-400" />} label="Copy OCR Result" keys={["S"]} />
                <ShortcutRow icon={<XCircle className="text-red-500" />} label="Reject Image" keys={["R"]} />
                <ShortcutRow icon={<Type className="text-blue-500" />} label="Quick Rename" keys={["E", "F2"]} />
              </div>
            </div>

            {/* Navigation Group */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-neutral-400 mb-2">
                <ArrowRight className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Navigation</span>
              </div>
              <div className="space-y-3">
                <ShortcutRow icon={<ArrowRight className="text-neutral-300" />} label="Next Image" keys={["D", "→"]} />
                <ShortcutRow icon={<ArrowLeft className="text-neutral-300" />} label="Previous Image" keys={["A", "←"]} />
                <ShortcutRow icon={<Keyboard className="text-neutral-300" />} label="Open This Help" keys={["F1"]} />
                <ShortcutRow icon={<MousePointer2 className="text-neutral-300" />} label="Close Modal" keys={["Esc"]} />
              </div>
            </div>

            {/* Mouse Interaction Group */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-neutral-400 mb-2">
                <MousePointer2 className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Mouse Interaction</span>
              </div>
              <div className="space-y-3">
                <ShortcutRow icon={<MousePointer2 className="text-neutral-300" />} label="Zoom In/Out" keys={["Wheel"]} />
                <ShortcutRow icon={<MousePointer2 className="text-neutral-300" />} label="Reset to Default Zoom" keys={["Double Click"]} />
              </div>
            </div>
          </div>

          {/* Pro Tip Section */}
          <div className="mt-10 p-6 bg-blue-600/5 rounded-2xl border border-blue-500/10 flex gap-4 items-start">
            <div className="p-2 bg-blue-600/10 rounded-lg text-blue-500">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white mb-1">Efficiency Tip</p>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Use your left hand for status keys (A, U, R) and your right hand for navigation (Arrow keys). 
                The system auto-saves every 2 seconds after any changes.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-neutral-800 bg-neutral-900/30 flex justify-between items-center">
          <p className="text-[10px] text-neutral-500 font-medium">PLATE MATCH VERSION 1.0.0</p>
          <button 
            onClick={() => setShowShortcuts(false)}
            className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded-xl transition-all"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};

const ShortcutRow: React.FC<{ icon: React.ReactNode; label: string; keys: string[] }> = ({ icon, label, keys }) => (
  <div className="flex items-center justify-between p-3 bg-neutral-800/20 border border-neutral-700/10 rounded-xl hover:bg-neutral-800/40 transition-colors">
    <div className="flex items-center gap-3">
      <div className="w-5 h-5 flex items-center justify-center">{icon}</div>
      <span className="text-xs font-medium text-neutral-300">{label}</span>
    </div>
    <div className="flex gap-1.5">
      {keys.map(key => (
        <kbd key={key} className="min-w-[24px] h-6 flex items-center justify-center px-1.5 bg-neutral-800 border-b-2 border-neutral-700 rounded text-[10px] font-bold text-white font-mono shadow-sm">
          {key}
        </kbd>
      ))}
    </div>
  </div>
);
