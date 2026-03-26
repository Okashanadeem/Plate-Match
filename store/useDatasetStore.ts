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
  originalExtension: string; // The .jpg, .png part
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

export interface FilenamePattern {
  isActive: boolean;
  prefix: string;
  suffix: string;
  startOffset: number; // New: Number of characters to skip from start
  endOffset: number;   // New: Number of characters to skip from end
  regex: string; // Optional custom regex
  useRegex: boolean;
  exportOnlyPlate: boolean; // NEW: Whether to strip prefixes/suffixes during export
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
  defaultZoom: number;
  
  // Filename Pattern Settings
  pattern: FilenamePattern;

  // Actions
  setDataset: (name: string, images: ImageRecord[]) => void;
  setCurrentIndex: (index: number) => void;
  updateImageStatus: (id: string, status: AnnotationStatus, newFilename?: string) => void;
  updateImageOCR: (id: string, result: string, confidence: number) => void;
  setFilter: (filter: AnnotationStatus | 'All') => void;
  setLoading: (loading: boolean, progress?: { processed: number; total: number }) => void;
  setEditing: (isEditing: boolean) => void;
  setShowShortcuts: (show: boolean) => void;
  setDefaultZoom: (zoom: number) => void;
  setPattern: (pattern: Partial<FilenamePattern>) => void;
  nextImage: () => void;
  prevImage: () => void;
  restoreMetadata: (metadata: any[]) => void;
  reset: () => void;

  // Helpers
  getExtractedPlate: (filename: string) => string;
  reconstructFilename: (original: string, newPlate: string) => string;

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
  defaultZoom: 1,

  pattern: {
    isActive: false,
    prefix: "plate_",
    suffix: "",
    startOffset: 0,
    endOffset: 0,
    regex: "^plate_(.+)_(?:\\d{8})_(?:\\d{6})_(?:\\d+)$",
    useRegex: false,
    exportOnlyPlate: true,
  },

  setDataset: (name, images) => set({ datasetName: name, images, currentIndex: 0, isLoading: false }),
  
  setCurrentIndex: (index) => set({ currentIndex: index }),

  setShowShortcuts: (showShortcuts) => set({ showShortcuts }),
  
  setDefaultZoom: (defaultZoom) => set({ defaultZoom }),

  setPattern: (newPattern) => set((state) => ({
    pattern: { ...state.pattern, ...newPattern }
  })),

  getExtractedPlate: (filename) => {
    const { pattern } = get();
    const lastDotIndex = filename.lastIndexOf('.');
    const nameWithoutExt = lastDotIndex !== -1 ? filename.substring(0, lastDotIndex) : filename;

    if (!pattern.isActive) return nameWithoutExt;

    if (pattern.useRegex && pattern.regex) {
      try {
        const re = new RegExp(pattern.regex);
        const match = nameWithoutExt.match(re);
        if (match && match[1]) return match[1];
      } catch (e) {
        console.error("Invalid regex in pattern extraction", e);
      }
    }

    // Default prefix/suffix/offset behavior
    let extracted = nameWithoutExt;
    
    // 1. Apply Offsets first (dynamic area selection)
    if (pattern.startOffset > 0 || pattern.endOffset > 0) {
      extracted = nameWithoutExt.substring(
        pattern.startOffset, 
        nameWithoutExt.length - pattern.endOffset
      );
    }

    // 2. Then strip literal prefix/suffix if they still match the result
    if (pattern.prefix && extracted.startsWith(pattern.prefix)) {
      extracted = extracted.substring(pattern.prefix.length);
    }
    if (pattern.suffix && extracted.endsWith(pattern.suffix)) {
      extracted = extracted.substring(0, extracted.length - pattern.suffix.length);
    }
    return extracted;
  },

  reconstructFilename: (original, newPlate) => {
    const { pattern } = get();
    const lastDotIndex = original.lastIndexOf('.');
    const nameWithoutExt = lastDotIndex !== -1 ? original.substring(0, lastDotIndex) : original;
    const ext = lastDotIndex !== -1 ? original.substring(lastDotIndex) : '';

    if (!pattern.isActive) return newPlate + ext;

    if (pattern.useRegex && pattern.regex) {
      try {
        const re = new RegExp(pattern.regex);
        const match = nameWithoutExt.match(re);
        if (match && match[1]) {
          // Replace only the first capture group with the newPlate
          const startIndex = nameWithoutExt.indexOf(match[1]);
          const prefixPart = nameWithoutExt.substring(0, startIndex);
          const suffixPart = nameWithoutExt.substring(startIndex + match[1].length);
          return prefixPart + newPlate + suffixPart + ext;
        }
      } catch (e) {}
    }

    // Reconstruct using offsets + prefix/suffix
    const prefixPart = nameWithoutExt.substring(0, pattern.startOffset) + (pattern.prefix || "");
    const suffixPart = (pattern.suffix || "") + nameWithoutExt.substring(nameWithoutExt.length - pattern.endOffset);
    
    return prefixPart + newPlate + suffixPart + ext;
  },
  
  updateImageStatus: (id, status, newPlateText) => set((state) => ({
    images: state.images.map((img) => {
      if (img.id !== id) return img;
      
      const updatedImg: ImageRecord = {
        ...img,
        status,
        reviewedAt: Date.now(),
      };

      if (newPlateText) {
        const newFilename = get().reconstructFilename(img.originalFilename, newPlateText);
        
        if (newFilename !== img.currentFilename) {
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
      }

      return updatedImg;
    }),
  })),

  updateImageOCR: (id, result, confidence) => set((state) => ({
    images: state.images.map((img) => {
      if (img.id !== id) return img;

      const cleanOCR = normalizePlateText(result);
      const extractedPlate = get().getExtractedPlate(img.originalFilename);
      const cleanFilename = normalizePlateText(extractedPlate);

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
