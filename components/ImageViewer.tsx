"use client";

import React, { useState, useRef, useEffect } from "react";
import { Image as ImageIcon, Loader2, FolderOpen, AlertCircle, Minimize2, MousePointer2, Anchor, RotateCcw } from "lucide-react";
import { useDatasetStore } from "@/store/useDatasetStore";
import { useDatasetLoader } from "@/hooks/useDatasetLoader";
import { useImageLoader } from "@/hooks/useImageLoader";

import { NavigationControls } from "./NavigationControls";

export const ImageViewer: React.FC = () => {
  const { isLoading, loadingProgress, images, currentIndex, defaultZoom, setDefaultZoom } = useDatasetStore();
  const { loadDirectory } = useDatasetLoader();
  
  const [scale, setScale] = useState(defaultZoom);
  const [transformOrigin, setTransformOrigin] = useState("center");
  const containerRef = useRef<HTMLDivElement>(null);

  const currentImage = images[currentIndex];
  const { imageUrl, error: loadError, loading: isImageLoading } = useImageLoader(currentImage?.id, currentImage?.fileHandle || null);

  // Reset zoom to default when image changes
  useEffect(() => {
    setScale(defaultZoom);
    setTransformOrigin("center");
  }, [currentIndex, defaultZoom]);

  const handleWheel = (e: React.WheelEvent) => {
    if (!imageUrl) return;
    
    // Zoom sensitivity
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newScale = Math.min(Math.max(0.5, scale + delta), 10); // Max 10x zoom, Min 0.5x

    if (newScale !== scale) {
      // Calculate cursor position relative to the container for centered zooming
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setTransformOrigin(`${x}% ${y}%`);
      }
      setScale(newScale);
    }
  };

  const resetZoom = () => {
    setScale(defaultZoom);
    setTransformOrigin("center");
  };

  const resetToOriginal = () => {
    setScale(1);
    setTransformOrigin("center");
  };

  const saveAsDefault = () => {
    setDefaultZoom(scale);
  };

  return (
    <main 
      className="flex-1 bg-black flex flex-col relative overflow-hidden" 
      ref={containerRef} 
      onWheel={handleWheel}
      onDoubleClick={resetZoom}
    >
      {/* Background Grid Pattern for Neutral Space */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '24px 24px' }} />

      {/* Main Image Container */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10 overflow-hidden cursor-crosshair">
        {!images.length && !isLoading && (
          <div className="w-full h-full max-w-5xl max-h-[85vh] border-2 border-dashed border-neutral-800 rounded-2xl flex flex-col items-center justify-center text-neutral-500 gap-6 group hover:border-neutral-700 transition-colors cursor-default">
            <div className="w-16 h-16 bg-neutral-900 rounded-2xl flex items-center justify-center group-hover:bg-neutral-800 transition-colors">
              <ImageIcon className="w-8 h-8 text-neutral-600" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-neutral-300">No Image Selected</h3>
              <p className="text-sm mt-1 max-w-[200px] mx-auto text-neutral-500">Open a dataset folder to begin annotation workflow</p>
            </div>
            <button 
              onClick={loadDirectory}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-blue-500/10"
            >
              <FolderOpen className="w-5 h-5" />
              <span>Select Dataset Folder</span>
            </button>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-neutral-900 rounded-full flex items-center justify-center border border-neutral-800">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-bold text-white">Indexing Dataset...</p>
              <p className="text-xs text-neutral-500 tabular-nums">Found {loadingProgress.processed} images</p>
            </div>
          </div>
        )}

        {images.length > 0 && !isLoading && (
          <div className="w-full h-full flex items-center justify-center relative">
             {isImageLoading && (
               <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20 backdrop-blur-sm rounded-2xl">
                 <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
               </div>
             )}

             {loadError && (
               <div className="w-full h-full max-w-5xl max-h-[85vh] bg-neutral-900/50 rounded-2xl border border-red-900/50 flex flex-col items-center justify-center gap-4 text-red-500 p-8">
                 <AlertCircle className="w-12 h-12 opacity-50" />
                 <div className="text-center">
                   <h3 className="text-lg font-bold">Failed to load image</h3>
                   <p className="text-sm opacity-70 mt-1">{currentImage?.originalFilename}</p>
                   <p className="text-xs mt-4 font-mono bg-red-950/50 px-3 py-1.5 rounded border border-red-900/30">{loadError}</p>
                 </div>
               </div>
             )}

             {imageUrl && !loadError && (
               <div className="w-full h-full flex items-center justify-center relative">
                 {/* Image scaling with preserve-aspect-ratio */}
                 <img 
                   src={imageUrl} 
                   alt={currentImage?.originalFilename}
                   className="w-auto h-auto max-w-full max-h-[90vh] object-contain rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-transform duration-200 ease-out will-change-transform"
                   style={{ 
                     imageRendering: 'auto',
                     transform: `scale(${scale})`,
                     transformOrigin: transformOrigin
                   }}
                 />
                 
                 {/* Zoom Indicator and Controls */}
                 <div className="absolute bottom-4 right-4 bg-blue-600/80 backdrop-blur-md p-1.5 rounded-xl border border-blue-400/30 flex items-center gap-1 animate-in fade-in zoom-in duration-200">
                    <div className="flex items-center gap-2 px-2 border-r border-blue-400/30 mr-1">
                      <MousePointer2 className="w-3 h-3 text-white" />
                      <span className="text-xs font-bold text-white tabular-nums min-w-[3rem]">{Math.round(scale * 100)}%</span>
                    </div>

                    <button 
                      onClick={(e) => { e.stopPropagation(); saveAsDefault(); }}
                      className={`p-1.5 rounded-lg transition-colors ${Math.abs(scale - defaultZoom) < 0.01 ? 'bg-blue-400/40 text-white' : 'hover:bg-white/20 text-blue-100'}`}
                      title="Set as Default Zoom"
                    >
                      <Anchor className="w-3.5 h-3.5" />
                    </button>

                    <button 
                      onClick={(e) => { e.stopPropagation(); resetZoom(); }}
                      className="p-1.5 hover:bg-white/20 text-blue-100 rounded-lg transition-colors"
                      title="Reset to Default"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>

                    <button 
                      onClick={(e) => { e.stopPropagation(); resetToOriginal(); }}
                      className="p-1.5 hover:bg-white/20 text-blue-100 rounded-lg transition-colors"
                      title="Reset to 100%"
                    >
                      <Minimize2 className="w-3.5 h-3.5" />
                    </button>
                 </div>

                 {/* Filename Overlay */}
                 <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-neutral-800 pointer-events-none">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-0.5">Original File</p>
                    <p className="text-xs font-mono text-white truncate max-w-[200px]">{currentImage?.originalFilename}</p>
                 </div>
               </div>
             )}
          </div>
        )}
      </div>

      {/* Bottom Navigation Area */}
      <NavigationControls />
    </main>
  );
};

