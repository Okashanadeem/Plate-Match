"use client";

import React from "react";
import { BarChart3, CheckCircle2, AlertCircle, HelpCircle, XCircle } from "lucide-react";
import { useDatasetStore } from "@/store/useDatasetStore";
import { SessionControls } from "./SessionControls";

export const ProgressPanel: React.FC = () => {
  const { getStats } = useDatasetStore();
  const stats = getStats();
  
  const progressPercentage = stats.total > 0 ? Math.round((stats.reviewed / stats.total) * 100) : 0;

  return (
    <aside className="w-72 border-r border-neutral-800 bg-neutral-900 overflow-y-auto p-6 hidden lg:flex flex-col">
      <div className="flex items-center gap-2 mb-8">
        <BarChart3 className="w-5 h-5 text-blue-500" />
        <h2 className="font-bold text-white uppercase tracking-wider text-sm">Session Progress</h2>
      </div>

      <div className="flex-1 space-y-6">
        {/* Overall Progress Bar */}
        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs text-neutral-400 font-medium">Reviewed Status</span>
            <span className="text-sm font-bold text-white tabular-nums">{progressPercentage}%</span>
          </div>
          <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-500" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-[11px] text-neutral-500 mt-2 italic text-center tabular-nums">
            {stats.reviewed} of {stats.total} images processed
          </p>
        </div>

        <div className="h-px bg-neutral-800" />

        {/* Detailed Breakdown */}
        <div className="space-y-3">
          <StatItem label="Valid" count={stats.valid} color="text-green-500" icon={<CheckCircle2 className="w-4 h-4" />} />
          <StatItem label="Corrected" count={stats.corrected} color="text-blue-500" icon={<AlertCircle className="w-4 h-4" />} />
          <StatItem label="Unclear" count={stats.unclear} color="text-amber-500" icon={<HelpCircle className="w-4 h-4" />} />
          <StatItem label="Rejected" count={stats.rejected} color="text-red-500" icon={<XCircle className="w-4 h-4" />} />
        </div>

        {/* Session Persistence Controls */}
        <SessionControls />
      </div>
    </aside>
  );
};

const StatItem: React.FC<{ label: string; count: number; color: string; icon: React.ReactNode }> = ({ label, count, color, icon }) => (
  <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-800/30 border border-neutral-700/30 hover:bg-neutral-800/50 transition-colors">
    <div className="flex items-center gap-3">
      <div className={color}>{icon}</div>
      <span className="text-sm font-medium text-neutral-300">{label}</span>
    </div>
    <span className="text-sm font-bold text-white tabular-nums">{count}</span>
  </div>
);
