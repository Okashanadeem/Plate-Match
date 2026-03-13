"use client";

import React from "react";
import { Download, LayoutDashboard, Settings, HelpCircle, FolderOpen, Loader2, Zap } from "lucide-react";
import { useDatasetLoader } from "@/hooks/useDatasetLoader";
import { useDatasetStore } from "@/store/useDatasetStore";
import { useExportDataset } from "@/hooks/useExportDataset";

export const TopNav: React.FC = () => {
  const { loadDirectory } = useDatasetLoader();
  const { datasetName, getStats, showShortcuts, setShowShortcuts, images, updateImageStatus } = useDatasetStore();
  const { exportDataset, isExporting, exportProgress } = useExportDataset();
  const stats = getStats();

  const aiMatchesCount = images.filter(img => img.ocrMatchStatus === 'Match' && img.status === 'Pending').length;

  const handleApproveAiMatches = () => {
    const matches = images.filter(img => img.ocrMatchStatus === 'Match' && img.status === 'Pending');
    if (matches.length === 0) return;
    
    if (confirm(`Are you sure you want to automatically approve ${matches.length} images where the AI detected a perfect match with the filename?`)) {
      matches.forEach(img => {
        updateImageStatus(img.id, 'Valid');
      });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-md z-50 px-6 flex items-center justify-between">
      {/* Left Section: Logo & App Name */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <LayoutDashboard className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight leading-none">PlateMatch</h1>
          <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider mt-0.5">Annotation Workflow</p>
        </div>
      </div>

      {/* Center Section: Progress Summary */}
      <div className="hidden md:flex items-center gap-6 px-4 py-1.5 bg-neutral-800/50 rounded-full border border-neutral-700/50">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-neutral-300">Active Dataset:</span>
          <span className="text-sm font-bold text-white truncate max-w-[200px]">{datasetName || "No Folder Selected"}</span>
        </div>
        <div className="w-px h-4 bg-neutral-700" />
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-neutral-300">Reviewed:</span>
          <span className="text-sm font-bold text-blue-400 tabular-nums">{stats.reviewed} / {stats.total}</span>
        </div>
      </div>

      {/* Right Section: Actions */}
      <div className="flex items-center gap-2">
        {aiMatchesCount > 0 && (
          <button 
            onClick={handleApproveAiMatches}
            className="flex items-center gap-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 px-4 py-2 rounded-lg font-bold border border-blue-500/20 transition-all animate-in zoom-in duration-300"
          >
            <Zap className="w-4 h-4 fill-blue-400/20" />
            <span>Approve {aiMatchesCount} AI Matches</span>
          </button>
        )}
        <div className="w-px h-6 bg-neutral-800 mx-2" />
        <button 
          onClick={loadDirectory}
          disabled={isExporting}
          className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50"
        >
          <FolderOpen className="w-4 h-4" />
          <span>Open Folder</span>
        </button>
        <div className="w-px h-6 bg-neutral-800 mx-2" />
        <button 
          onClick={() => setShowShortcuts(!showShortcuts)}
          className={`p-2 rounded-lg transition-colors ${showShortcuts ? 'text-blue-400 bg-blue-500/10' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
        >
          <HelpCircle className="w-5 h-5" />
        </button>
        <button className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors">
          <Settings className="w-5 h-5" />
        </button>
        <div className="w-px h-6 bg-neutral-800 mx-2" />
        <button 
          onClick={exportDataset}
          disabled={isExporting || stats.total === 0}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Exporting ({exportProgress}%)</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Export Dataset</span>
            </>
          )}
        </button>
      </div>
    </nav>
  );
};
