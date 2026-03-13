"use client";

import { useEffect } from "react";
import { useDatasetStore } from "@/store/useDatasetStore";
import { useCacheStore } from "@/store/useCacheStore";
import { performOCR, terminateOCR } from "@/utils/ocrService";

export const PreloadManager: React.FC = () => {
  const { images, currentIndex, updateImageOCR, datasetName } = useDatasetStore();
  const { addToCache, getFromCache } = useCacheStore();

  useEffect(() => {
    if (!datasetName || images.length === 0) return;

    // Only preload/OCR if we have a dataset open
    const preloadBuffer = 3;
    const start = currentIndex; 
    const end = Math.min(start + preloadBuffer, images.length);

    for (let i = start; i < end; i++) {
      const img = images[i];
      
      // Handle Cache & OCR
      if (!getFromCache(img.id) || img.ocrMatchStatus === undefined || img.ocrMatchStatus === 'None') {
        (async () => {
          try {
            let url = getFromCache(img.id);
            if (!url) {
              const file = await img.fileHandle.getFile();
              url = URL.createObjectURL(file);
              addToCache(img.id, url);
              console.log(`Preloaded: ${img.originalFilename}`);
            }

            // Perform OCR if not already done
            if (img.ocrMatchStatus === undefined || img.ocrMatchStatus === 'None') {
              const result = await performOCR(url);
              updateImageOCR(img.id, result.text, result.confidence);
              console.log(`OCR Complete for ${img.originalFilename}: ${result.text} (${result.confidence}%)`);
            }
          } catch (e) {
            console.error(`Failed to process ${img.originalFilename}:`, e);
          }
        })();
      }
    }
  }, [images, currentIndex, addToCache, getFromCache, updateImageOCR]);

  // Cleanup worker on unmount
  useEffect(() => {
    return () => {
      terminateOCR();
    };
  }, []);

  return null;
};
