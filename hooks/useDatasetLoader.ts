import { useDatasetStore } from "@/store/useDatasetStore";
import { scanDirectory } from "@/utils/datasetScanner";
import { useCallback } from "react";

const STORAGE_KEY = "platematch_session";

export const useDatasetLoader = () => {
  const setDataset = useDatasetStore((state) => state.setDataset);
  const setLoading = useDatasetStore((state) => state.setLoading);
  const restoreMetadata = useDatasetStore((state) => state.restoreMetadata);
  const setCurrentIndex = useDatasetStore((state) => state.setCurrentIndex);
  const resetStore = useDatasetStore((state) => state.reset);

  const loadDirectory = useCallback(async () => {
    try {
      // 1. Open directory picker
      if (!window.showDirectoryPicker) {
        alert("Your browser does not support the File System Access API. Please use a modern browser like Chrome or Edge.");
        return;
      }

      const directoryHandle = await window.showDirectoryPicker({
        mode: 'read',
      });

      setLoading(true, { processed: 0, total: 0 });

      // 2. Scan directory
      const images = await scanDirectory(directoryHandle, (processed) => {
        setLoading(true, { processed, total: -1 });
      });

      if (images.length === 0) {
        alert("No supported images found in the selected folder.");
        setLoading(false);
        return;
      }

      // 3. Update store
      setDataset(directoryHandle.name, images);

      // 4. Check for saved session
      const savedSession = localStorage.getItem(STORAGE_KEY);
      if (savedSession) {
        try {
          const sessionData = JSON.parse(savedSession);
          if (sessionData.datasetName === directoryHandle.name) {
            const reviewedCount = sessionData.metadata.filter((m: any) => m.status !== 'Pending').length;
            if (reviewedCount > 0) {
              if (confirm(`Found a saved session for "${directoryHandle.name}" with ${reviewedCount} reviewed images. Would you like to restore your progress?`)) {
                restoreMetadata(sessionData.metadata);
                setCurrentIndex(sessionData.currentIndex || 0);
              }
            }
          }
        } catch (e) {
          console.error("Failed to parse saved session:", e);
        }
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('User cancelled the directory picker');
      } else {
        console.error('Failed to load directory:', error);
        alert(`Failed to load directory: ${error.message}`);
      }
      setLoading(false);
    }
  }, [setDataset, setLoading, restoreMetadata, setCurrentIndex]);

  const reset = useCallback(() => {
    if (confirm("Are you sure you want to reset the current session? All unsaved progress will be lost.")) {
      resetStore();
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [resetStore]);

  return { loadDirectory, reset };
};
