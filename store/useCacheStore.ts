import { create } from 'zustand';

interface CacheState {
  cache: Map<string, string>; // Map<imageId, objectUrl>
  ringBuffer: string[]; // Array of imageIds in order of addition
  
  // Actions
  addToCache: (id: string, url: string) => void;
  getFromCache: (id: string) => string | undefined;
  clearCache: () => void;
}

const MAX_CACHE_SIZE = 10;

export const useCacheStore = create<CacheState>((set, get) => ({
  cache: new Map(),
  ringBuffer: [],

  addToCache: (id, url) => set((state) => {
    if (state.cache.has(id)) return state;

    const newCache = new Map(state.cache);
    const newRingBuffer = [...state.ringBuffer, id];

    if (newRingBuffer.length > MAX_CACHE_SIZE) {
      const oldestId = newRingBuffer.shift();
      if (oldestId) {
        const oldestUrl = newCache.get(oldestId);
        if (oldestUrl) {
          URL.revokeObjectURL(oldestUrl);
          console.log(`Revoked ObjectURL for ${oldestId}`);
        }
        newCache.delete(oldestId);
      }
    }

    newCache.set(id, url);
    return { cache: newCache, ringBuffer: newRingBuffer };
  }),

  getFromCache: (id) => get().cache.get(id),

  clearCache: () => {
    const { cache } = get();
    cache.forEach((url) => URL.revokeObjectURL(url));
    set({ cache: new Map(), ringBuffer: [] });
  },
}));
