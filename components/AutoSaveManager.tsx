"use client";

import { useEffect, useRef } from "react";
import { useDatasetStore } from "@/store/useDatasetStore";

const STORAGE_KEY = "platematch_session";

export const AutoSaveManager: React.FC = () => {
  const { datasetName, images, currentIndex, defaultZoom } = useDatasetStore();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!datasetName || images.length === 0) return;

    // Debounce saving to localStorage
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
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
        defaultZoom,
        metadata,
        lastSaved: Date.now(),
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
        console.log("Session auto-saved");
      } catch (e) {
        console.error("Failed to auto-save session:", e);
      }
    }, 2000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [datasetName, images, currentIndex, defaultZoom]);

  return null; // Renderless component
};
