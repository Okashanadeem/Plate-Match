import { create } from 'zustand';
import { normalizePlateText } from '@/utils/ocrService';

export type AnnotationStatus = 'Pending' | 'Valid' | 'Corrected' | 'Unclear' | 'Rejected';

export interface CorrectionEntry {
  timestamp: number;
  oldFilename: string;
  newFilename: string;
}

export interface ImageRecord {
  id: string;
  originalFilename: string;
  currentFilename: string;
  fileHandle: FileSystemFileHandle;
  format: string;
  status: AnnotationStatus;
  reviewedAt?: number;
  correctionHistory: CorrectionEntry[];
  ocrResult?: string;
  ocrConfidence?: number;
  ocrMatchStatus?: 'Match' | 'Mismatch' | 'Uncertain' | 'None';
}

interface DatasetState {
  datasetName: string | null;
  images: ImageRecord[];
  currentIndex: number;
  filter: AnnotationStatus | 'All';
  isLoading: boolean;
  loadingProgress: { processed: number; total: number };
  isEditing: boolean;
  showShortcuts: boolean;

  // Actions
  setDataset: (name: string, images: ImageRecord[]) => void;
  setCurrentIndex: (index: number) => void;
  updateImageStatus: (id: string, status: AnnotationStatus, newFilename?: string) => void;
  updateImageOCR: (id: string, result: string, confidence: number) => void;
  setFilter: (filter: AnnotationStatus | 'All') => void;
  setLoading: (loading: boolean, progress?: { processed: number; total: number }) => void;
  setEditing: (isEditing: boolean) => void;
  setShowShortcuts: (show: boolean) => void;
  nextImage: () => void;
  prevImage: () => void;
  restoreMetadata: (metadata: any[]) => void;
  reset: () => void;

  // Computed Stats
  getStats: () => {
    total: number;
    reviewed: number;
    pending: number;
    valid: number;
    corrected: number;
    unclear: number;
    rejected: number;
  };
}

export const useDatasetStore = create<DatasetState>((set, get) => ({
  datasetName: null,
  images: [],
  currentIndex: 0,
  filter: 'All',
  isLoading: false,
  loadingProgress: { processed: 0, total: 0 },
  isEditing: false,
  showShortcuts: false,

  setDataset: (name, images) => set({ datasetName: name, images, currentIndex: 0, isLoading: false }),
  
  setCurrentIndex: (index) => set({ currentIndex: index }),

  setShowShortcuts: (showShortcuts) => set({ showShortcuts }),
  
  updateImageStatus: (id, status, newFilename) => set((state) => ({
    images: state.images.map((img) => {
      if (img.id !== id) return img;
      
      const updatedImg: ImageRecord = {
        ...img,
        status,
        reviewedAt: Date.now(),
      };

      if (newFilename && newFilename !== img.currentFilename) {
        updatedImg.correctionHistory = [
          ...img.correctionHistory,
          {
            timestamp: Date.now(),
            oldFilename: img.currentFilename,
            newFilename,
          }
        ];
        updatedImg.currentFilename = newFilename;
      }

      return updatedImg;
    }),
  })),

  updateImageOCR: (id, result, confidence) => set((state) => ({
    images: state.images.map((img) => {
      if (img.id !== id) return img;

      const cleanOCR = normalizePlateText(result);
      // Remove extension from filename for comparison
      const cleanFilename = normalizePlateText(img.originalFilename.split('.')[0]);

      let ocrMatchStatus: 'Match' | 'Mismatch' | 'Uncertain' = 'Uncertain';
      
      if (confidence > 75) {
        ocrMatchStatus = cleanOCR === cleanFilename ? 'Match' : 'Mismatch';
      }

      return {
        ...img,
        ocrResult: result,
        ocrConfidence: confidence,
        ocrMatchStatus
      };
    })
  })),

  setFilter: (filter) => set({ filter }),
  
  setLoading: (isLoading, loadingProgress) => set({ 
    isLoading, 
    loadingProgress: loadingProgress || { processed: 0, total: 0 } 
  }),

  setEditing: (isEditing) => set({ isEditing }),

  nextImage: () => set((state) => {
    if (state.currentIndex < state.images.length - 1) {
      return { currentIndex: state.currentIndex + 1 };
    }
    return state;
  }),

  prevImage: () => set((state) => {
    if (state.currentIndex > 0) {
      return { currentIndex: state.currentIndex - 1 };
    }
    return state;
  }),

  restoreMetadata: (metadata) => set((state) => {
    const updatedImages = state.images.map((img) => {
      const saved = metadata.find(m => m.originalFilename === img.originalFilename);
      if (saved) {
        return {
          ...img,
          currentFilename: saved.currentFilename,
          status: saved.status,
          reviewedAt: saved.reviewedAt,
          correctionHistory: saved.correctionHistory,
        };
      }
      return img;
    });
    return { images: updatedImages };
  }),

  reset: () => set({ datasetName: null, images: [], currentIndex: 0, filter: 'All', isLoading: false, loadingProgress: { processed: 0, total: 0 }, isEditing: false }),

  getStats: () => {
    const images = get().images;
    const stats = {
      total: images.length,
      reviewed: images.filter(img => img.status !== 'Pending').length,
      pending: images.filter(img => img.status === 'Pending').length,
      valid: images.filter(img => img.status === 'Valid').length,
      corrected: images.filter(img => img.status === 'Corrected').length,
      unclear: images.filter(img => img.status === 'Unclear').length,
      rejected: images.filter(img => img.status === 'Rejected').length,
    };
    return stats;
  },
}));
