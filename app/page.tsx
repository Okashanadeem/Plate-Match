"use client";

import { TopNav } from "@/components/TopNav";
import { ProgressPanel } from "@/components/ProgressPanel";
import { ImageViewer } from "@/components/ImageViewer";
import { FileInfoPanel } from "@/components/FileInfoPanel";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

import { AutoSaveManager } from "@/components/AutoSaveManager";
import { PreloadManager } from "@/components/PreloadManager";
import { ShortcutLegend } from "@/components/ShortcutLegend";

export default function Home() {
  useKeyboardShortcuts();

  return (
    <div className="h-screen flex flex-col bg-neutral-950 text-neutral-100 overflow-hidden">
      <AutoSaveManager />
      <PreloadManager />
      <ShortcutLegend />
      <TopNav />

      <div className="flex flex-1 pt-16 overflow-hidden">
        {/* Left Side: Progress Statistics */}
        <ProgressPanel />

        {/* Center: Image Viewport */}
        <ImageViewer />

        {/* Right Side: Metadata & Specific Controls */}
        <FileInfoPanel />
      </div>
    </div>
  );
}
