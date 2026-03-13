"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, FastForward, Hash, CornerDownLeft } from "lucide-react";
import { useDatasetStore } from "@/store/useDatasetStore";

export const NavigationControls: React.FC = () => {
  const { images, currentIndex, nextImage, prevImage, setCurrentIndex } = useDatasetStore();
  const [jumpValue, setJumpValue] = useState("");

  // Update local input when index changes
  useEffect(() => {
    setJumpValue((currentIndex + 1).toString());
  }, [currentIndex]);

  const handleJump = () => {
    const target = parseInt(jumpValue);
    if (!isNaN(target) && target >= 1 && target <= images.length) {
      setCurrentIndex(target - 1);
    } else {
      setJumpValue((currentIndex + 1).toString());
    }
  };

  const isLast = currentIndex === images.length - 1;
  const isFirst = currentIndex === 0;

  if (images.length === 0) return null;

  return (
    <div className="h-20 border-t border-neutral-800 bg-neutral-900/50 flex items-center justify-center px-8 relative">
      <div className="flex items-center gap-6">
        {/* Previous Button */}
        <button 
          onClick={prevImage}
          disabled={isFirst}
          className="flex flex-col items-center gap-1 group disabled:opacity-20"
        >
          <div className="p-2 bg-neutral-800 group-hover:bg-neutral-700 rounded-lg transition-colors border border-neutral-700">
            <ChevronLeft className="w-5 h-5 text-white" />
          </div>
          <span className="text-[10px] font-bold text-neutral-500 uppercase">Prev [A]</span>
        </button>

        {/* Jump-to-Index Input */}
        <div className="flex items-center gap-3 px-6 py-2 bg-neutral-950 rounded-2xl border border-neutral-800 shadow-inner group">
          <div className="flex items-center gap-2 text-neutral-500">
            <Hash className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-1">
            <input 
              type="text"
              value={jumpValue}
              onChange={(e) => setJumpValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJump()}
              className="w-12 bg-transparent text-center font-bold text-white outline-none text-sm tabular-nums"
            />
            <span className="text-neutral-600 font-medium text-sm">/</span>
            <span className="text-neutral-500 font-medium text-sm tabular-nums">{images.length}</span>
          </div>
          <button 
            onClick={handleJump}
            className="p-1 text-neutral-600 hover:text-blue-500 transition-colors"
          >
            <CornerDownLeft className="w-3 h-3" />
          </button>
        </div>

        {/* Next Button */}
        <button 
          onClick={nextImage}
          disabled={isLast}
          className="flex flex-col items-center gap-1 group disabled:opacity-20"
        >
          <div className="p-2 bg-neutral-800 group-hover:bg-neutral-700 rounded-lg transition-colors border border-neutral-700">
            <ChevronRight className="w-5 h-5 text-white" />
          </div>
          <span className="text-[10px] font-bold text-neutral-500 uppercase">Next [D]</span>
        </button>
      </div>

      {/* Skip Button (Right aligned) */}
      <div className="absolute right-8">
        <button 
          onClick={nextImage}
          disabled={isLast}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg border border-neutral-700 transition-all active:scale-95 text-xs font-bold uppercase tracking-widest group disabled:opacity-20"
        >
          <span>Skip Image</span>
          <FastForward className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
