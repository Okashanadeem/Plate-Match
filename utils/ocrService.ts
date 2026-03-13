// Dynamic import for Transformers.js to prevent SSR issues in Next.js
let ocrPipeline: any = null;
let isInitializing = false;
let initializationPromise: Promise<any> | null = null;

/**
 * Initialize the TrOCR (Transformer-based OCR) pipeline.
 * Model: Xenova/trocr-small-printed (~60MB download, cached after first run)
 */
export const getOCRPipeline = async () => {
  if (typeof window === 'undefined') return null; // Safety for server-side evaluation
  if (ocrPipeline) return ocrPipeline;
  if (isInitializing) return initializationPromise!;

  isInitializing = true;
  initializationPromise = (async () => {
    try {
      console.log("Initializing AI Vision Model (TrOCR)...");
      
      // Use the modern @huggingface/transformers package
      const Transformers = await import('@huggingface/transformers');
      const { pipeline, env } = Transformers;
      
      // Ensure env is defined before accessing it
      if (env) {
        env.allowLocalModels = false;
        env.allowRemoteModels = true;
        env.useBrowserCache = true;
        // Suppress ONNX Runtime logging/warnings
        env.backends.onnx.logLevel = 'error';
      }

      // 'trocr-small-printed' is specialized for reading high-contrast printed text like plates
      const newPipeline = await pipeline('image-to-text', 'Xenova/trocr-small-printed', {
        device: 'webgpu', // Try WebGPU first for speed, falls back to CPU automatically
        dtype: 'fp32',    // Ensure stable precision
      });
      
      ocrPipeline = newPipeline;
      console.log("AI Vision Model Loaded Successfully.");
      return ocrPipeline;
    } catch (error) {
      console.error("AI Model Loading Error:", error);
      
      // Fallback to CPU if WebGPU fails or is not supported
      try {
        const { pipeline } = await import('@huggingface/transformers');
        const fallbackPipeline = await pipeline('image-to-text', 'Xenova/trocr-small-printed');
        ocrPipeline = fallbackPipeline;
        return ocrPipeline;
      } catch (fallbackError) {
        console.error("Critical AI Error:", fallbackError);
        return null;
      }
    } finally {
      isInitializing = false;
    }
  })();

  return initializationPromise;
};

/**
 * Normalizes strings for robust comparison of plate text.
 * Handles common OCR mistakes for plates.
 */
export const normalizePlateText = (text: string): string => {
  if (!text) return "";
  return text
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .replace(/O/g, '0')
    .replace(/I/g, '1')
    .replace(/L/g, '1')
    .replace(/Z/g, '2')
    .replace(/B/g, '8');
};

// Sequential queue to prevent browser hangs during heavy inference
let ocrQueue: Promise<any> = Promise.resolve();

export const performOCR = async (imageSource: string | Blob): Promise<{ text: string; confidence: number }> => {
  if (typeof window === 'undefined') return { text: "", confidence: 0 };

  return new Promise((resolve, reject) => {
    ocrQueue = ocrQueue.then(async () => {
      try {
        const pipe = await getOCRPipeline();
        if (!pipe) {
           resolve({ text: "", confidence: 0 });
           return;
        }
        
        const output = await pipe(imageSource);
        const text = output[0]?.generated_text || "";
        
        resolve({ text: text.trim(), confidence: text ? 90 : 0 });
      } catch (error) {
        console.error('AI Inference Error:', error);
        reject(error);
      }
    });
  });
};

export const terminateOCR = async () => {
  ocrPipeline = null;
  initializationPromise = null;
};
