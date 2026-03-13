"use client";

import React, { useRef } from "react";
import { Save, Upload, RotateCcw, FileJson } from "lucide-react";
import { useDatasetStore } from "@/store/useDatasetStore";
import { useDatasetLoader } from "@/hooks/useDatasetLoader";

export const SessionControls: React.FC = () => {
  const { datasetName, images, currentIndex, restoreMetadata, setCurrentIndex } = useDatasetStore();
  const { reset } = useDatasetLoader();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportSession = () => {
    if (!datasetName || images.length === 0) return;

    const metadata = images.map(img => ({
      originalFilename: img.originalFilename,
      currentFilename: img.currentFilename,
      status: img.status,
      reviewedAt: img.reviewedAt,
      correctionHistory: img.correctionHistory,
    }));

    const sessionData = {
      datasetName,
      currentIndex,
      metadata,
      exportedAt: new Date().toISOString(),
      version: "1.0",
    };

    const blob = new Blob([JSON.stringify(sessionData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `platematch_session_${datasetName.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSession = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const sessionData = JSON.parse(event.target?.result as string);
        if (sessionData.datasetName === datasetName) {
          restoreMetadata(sessionData.metadata);
          if (sessionData.currentIndex !== undefined) {
            setCurrentIndex(sessionData.currentIndex);
          }
          alert("Session data loaded successfully.");
        } else {
          alert(`Warning: The session file is for dataset "${sessionData.datasetName}", but you have "${datasetName}" open.`);
        }
      } catch (err) {
        console.error("Failed to parse session file:", err);
        alert("Invalid session file format.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (!datasetName) return null;

  return (
    <div className="pt-6 border-t border-neutral-800 space-y-4">
      <div className="flex items-center gap-2 text-neutral-400">
        <FileJson className="w-4 h-4" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Session Management</span>
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        <button 
          onClick={handleExportSession}
          className="flex items-center gap-3 w-full p-3 bg-neutral-800/30 hover:bg-neutral-800/60 border border-neutral-700/50 rounded-xl transition-all group"
        >
          <div className="p-2 bg-neutral-900 rounded-lg group-hover:text-blue-400 transition-colors">
            <Save className="w-4 h-4" />
          </div>
          <div className="text-left">
            <p className="text-[11px] font-bold text-white uppercase tracking-tight">Save Session File</p>
            <p className="text-[9px] text-neutral-500">Download progress as JSON</p>
          </div>
        </button>

        <button 
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-3 w-full p-3 bg-neutral-800/30 hover:bg-neutral-800/60 border border-neutral-700/50 rounded-xl transition-all group"
        >
          <div className="p-2 bg-neutral-900 rounded-lg group-hover:text-amber-400 transition-colors">
            <Upload className="w-4 h-4" />
          </div>
          <div className="text-left">
            <p className="text-[11px] font-bold text-white uppercase tracking-tight">Load Session File</p>
            <p className="text-[9px] text-neutral-500">Resume from local JSON</p>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImportSession} 
            accept=".json" 
            className="hidden" 
          />
        </button>

        <button 
          onClick={reset}
          className="flex items-center gap-3 w-full p-3 bg-red-950/10 hover:bg-red-950/20 border border-red-900/20 rounded-xl transition-all group"
        >
          <div className="p-2 bg-red-950/30 rounded-lg text-red-500 group-hover:text-red-400 transition-colors">
            <RotateCcw className="w-4 h-4" />
          </div>
          <div className="text-left">
            <p className="text-[11px] font-bold text-red-500 uppercase tracking-tight">Reset Dataset</p>
            <p className="text-[9px] text-red-900/60">Clear all annotations</p>
          </div>
        </button>
      </div>
    </div>
  );
};
