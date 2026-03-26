"use client";

import React, { useState, useEffect } from "react";
import { FileText, Edit3, Hash, Info, History, Check, X, AlertTriangle, EyeOff, Cpu, CheckCircle, XCircle, Copy } from "lucide-react";
import { useDatasetStore, ImageRecord } from "@/store/useDatasetStore";
import { useAnnotationActions } from "@/hooks/useAnnotationActions";
import { ShortcutLegend } from "./ShortcutLegend";

export const FileInfoPanel: React.FC = () => {
  const { images, currentIndex, isEditing, setEditing, pattern, getExtractedPlate } = useDatasetStore();
  const currentImage = images[currentIndex];
  const { onApprove, onUnclear, onReject, onRename } = useAnnotationActions();
  
  const [workingFilename, setWorkingFilename] = useState("");
  const [copied, setCopied] = useState(false);

  // Sync working filename when current image changes
  useEffect(() => {
    if (currentImage) {
      // If pattern is active, we show the extracted plate text instead of full filename
      const displayValue = pattern.isActive 
        ? getExtractedPlate(currentImage.currentFilename)
        : currentImage.currentFilename;
        
      setWorkingFilename(displayValue);
      setEditing(false);
    } else {
      setWorkingFilename("");
    }
  }, [currentImage, setEditing, pattern, getExtractedPlate]);

  const handleRenameSubmit = () => {
    if (!workingFilename.trim()) return;
    // onRename will pass this to updateImageStatus which handles reconstruction
    onRename(workingFilename);
    setEditing(false);
  };

  const handleCopyOCR = () => {
    if (currentImage?.ocrResult) {
      navigator.clipboard.writeText(currentImage.ocrResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <aside className="w-80 border-l border-neutral-800 bg-neutral-900 overflow-y-auto p-6 hidden xl:block flex flex-col">
      <div className="flex items-center gap-2 mb-8">
        <Info className="w-5 h-5 text-blue-500" />
        <h2 className="font-bold text-white uppercase tracking-wider text-sm">File Metadata</h2>
      </div>

      <div className="flex-1 flex flex-col space-y-6">
        {/* File Details Group */}
        <div className="space-y-4">
          <MetadataItem 
            label="Image Index" 
            value={images.length > 0 ? `${currentIndex + 1} of ${images.length}` : "0 of 0"} 
            icon={<Hash className="w-4 h-4" />} 
          />
          <MetadataItem 
            label="Original Filename" 
            value={currentImage?.originalFilename || "--"} 
            icon={<FileText className="w-4 h-4" />} 
          />
          
          {/* Working Filename Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
                <Edit3 className="w-3 h-3" />
                Working Filename
              </label>
              <button 
                disabled={!currentImage}
                onClick={() => setEditing(!isEditing)}
                className="px-1.5 py-0.5 bg-neutral-800 text-[10px] text-neutral-400 rounded border border-neutral-700 font-mono uppercase hover:bg-neutral-700 transition-colors disabled:opacity-30"
              >
                {isEditing ? "Cancel" : "Edit [E]"}
              </button>
            </div>
            
            {isEditing ? (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <input 
                  autoFocus
                  type="text"
                  value={workingFilename}
                  onChange={(e) => setWorkingFilename(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRenameSubmit();
                    if (e.key === 'Escape') setEditing(false);
                  }}
                  className="w-full bg-neutral-950 border border-blue-500/50 rounded-lg p-3 text-sm text-white font-mono outline-none ring-2 ring-blue-500/10"
                />
                <button 
                  onClick={handleRenameSubmit}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 rounded-lg transition-all active:scale-95"
                >
                  Apply Correction & Approve
                </button>
              </div>
            ) : (
              <div 
                onClick={() => currentImage && setEditing(true)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-sm text-neutral-100 font-mono break-all leading-relaxed min-h-[48px] flex items-center cursor-pointer hover:border-blue-500/30 hover:bg-neutral-900 transition-all group"
              >
                {workingFilename || "Pending dataset selection..."}
                {currentImage && (
                  <Edit3 className="w-3 h-3 ml-auto text-neutral-700 group-hover:text-blue-500 transition-colors" />
                )}
              </div>
            )}
          </div>
        </div>

        <div className="h-px bg-neutral-800" />
        
        {/* Status Badge */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Current Status</label>
          <div className="flex">
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusStyles(currentImage?.status)}`}>
              {currentImage?.status || "None"}
            </span>
          </div>
        </div>

        <div className="h-px bg-neutral-800" />
        
        {/* OCR Insight Card */}
        {currentImage && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-3 h-3 text-blue-500" />
                AI OCR Verification
              </label>
              {currentImage.ocrConfidence !== undefined && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  currentImage.ocrConfidence > 85 ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'
                }`}>
                  {Math.round(currentImage.ocrConfidence)}% Conf.
                </span>
              )}
            </div>

            <div className={`p-4 rounded-2xl border bg-neutral-950/50 space-y-3 ${
              currentImage.ocrMatchStatus === 'Match' ? 'border-green-500/20' : 
              currentImage.ocrMatchStatus === 'Mismatch' ? 'border-red-500/20' : 'border-neutral-800'
            }`}>
              {currentImage.ocrResult ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-neutral-500 font-medium uppercase">System Detected:</span>
                    {currentImage.ocrMatchStatus === 'Match' ? (
                      <div className="flex items-center gap-1 text-green-500 text-[10px] font-bold">
                        <CheckCircle className="w-3 h-3" /> MATCH
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-500 text-[10px] font-bold">
                        <XCircle className="w-3 h-3" /> MISMATCH
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between group">
                    <p className="text-lg font-mono font-bold text-white tracking-wider">
                      {currentImage.ocrResult}
                    </p>
                    <button 
                      onClick={handleCopyOCR}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold transition-all border ${
                        copied 
                          ? 'bg-green-500/20 border-green-500/50 text-green-500' 
                          : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500'
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3" />
                          COPIED
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          COPY [S]
                        </>
                      )}
                    </button>
                  </div>
                  
                  {(currentImage.ocrMatchStatus === 'Mismatch' || currentImage.ocrMatchStatus === 'Uncertain') && (
                    <button 
                      onClick={() => {
                        setWorkingFilename(currentImage.ocrResult!);
                        setEditing(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-[10px] font-bold rounded-lg border border-blue-500/20 transition-all"
                    >
                      <Edit3 className="w-3 h-3" />
                      Use OCR Result
                    </button>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-2 gap-2 opacity-50">
                  <Cpu className="w-5 h-5 text-neutral-600 animate-pulse" />
                  <p className="text-[10px] text-neutral-600 font-medium">Analyzing Plate Text...</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="h-px bg-neutral-800" />

        {/* Control Group */}
        <div className="space-y-4">
          <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Annotation Actions</label>
          <div className="grid grid-cols-2 gap-2">
            <ActionButton 
              label="Approve" 
              shortcut="W"
              icon={<Check className="w-3.5 h-3.5" />}
              onClick={onApprove}
              disabled={!currentImage || isEditing}
              color="border-green-500/30 text-green-500 hover:bg-green-500/10 hover:border-green-500/50" 
            />
            <ActionButton 
              label="Unclear" 
              shortcut="U"
              icon={<EyeOff className="w-3.5 h-3.5" />}
              onClick={onUnclear}
              disabled={!currentImage || isEditing}
              color="border-amber-500/30 text-amber-500 hover:bg-amber-500/10 hover:border-amber-500/50" 
            />
            <ActionButton 
              label="Reject" 
              shortcut="R"
              icon={<X className="w-3.5 h-3.5" />}
              onClick={onReject}
              disabled={!currentImage || isEditing}
              color="border-red-500/30 text-red-500 hover:bg-red-500/10 hover:border-red-500/50" 
            />
            <ActionButton 
              label="Rename" 
              shortcut="E"
              icon={<AlertTriangle className="w-3.5 h-3.5" />}
              onClick={() => setEditing(true)}
              disabled={!currentImage || isEditing}
              color="border-blue-500/30 text-blue-500 hover:bg-blue-500/10 hover:border-blue-500/50" 
            />
          </div>
        </div>

        <div className="h-px bg-neutral-800" />

        {/* History Log */}
        <div className="space-y-4 pb-6">
          <div className="flex items-center gap-2 text-neutral-400">
            <History className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Correction History</span>
          </div>
          {currentImage?.correctionHistory.length ? (
             <div className="space-y-3 animate-in fade-in slide-in-from-left-1 duration-300">
               {currentImage.correctionHistory.map((entry, i) => (
                 <div key={i} className="text-[10px] text-neutral-400 border-l-2 border-neutral-800 pl-3 py-1 space-y-1">
                   <p className="line-through opacity-40 font-mono">{entry.oldFilename}</p>
                   <div className="flex items-center gap-2">
                      <div className="w-1.5 h-px bg-blue-500" />
                      <p className="text-blue-400 font-bold font-mono">→ {entry.newFilename}</p>
                   </div>
                   <p className="text-[9px] text-neutral-600 mt-1">{new Date(entry.timestamp).toLocaleTimeString()}</p>
                 </div>
               ))}
             </div>
          ) : (
            <p className="text-[11px] text-neutral-600 italic">No corrections recorded for this file.</p>
          )}
        </div>

        {/* Keyboard Shortcuts Legend */}
        <ShortcutLegend />
      </div>
    </aside>
  );
};

const MetadataItem: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="space-y-1.5">
    <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
      {icon}
      {label}
    </span>
    <p className="text-sm font-medium text-white truncate px-1">{value}</p>
  </div>
);

const ActionButton: React.FC<{ label: string; shortcut: string; icon: React.ReactNode; color: string; onClick: () => void; disabled: boolean }> = ({ label, shortcut, icon, color, onClick, disabled }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`h-11 bg-neutral-800/20 border rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed ${color}`}
  >
    <div className="flex items-center gap-1.5">
      {icon}
      <span className="text-[9px] font-bold uppercase tracking-widest">{label}</span>
    </div>
    <span className="text-[8px] font-mono opacity-60">[{shortcut}]</span>
  </button>
);

const getStatusStyles = (status?: string) => {
  switch (status) {
    case 'Valid': return 'bg-green-500/10 border-green-500/50 text-green-500';
    case 'Corrected': return 'bg-blue-500/10 border-blue-500/50 text-blue-500';
    case 'Unclear': return 'bg-amber-500/10 border-amber-500/50 text-amber-500';
    case 'Rejected': return 'bg-red-500/10 border-red-500/50 text-red-500';
    case 'Pending': return 'bg-neutral-500/10 border-neutral-500/50 text-neutral-400';
    default: return 'bg-neutral-800 border-neutral-700 text-neutral-500';
  }
};
