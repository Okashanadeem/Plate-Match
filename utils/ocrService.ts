import * as ort from 'onnxruntime-web';

// Dynamic import for Transformers.js to prevent SSR issues in Next.js
let ocrPipeline: any = null;
let isInitializing = false;
let initializationPromise: Promise<any> | null = null;

// ONNX Session for Fast-Plate-OCR
let ortSession: ort.InferenceSession | null = null;
const MODEL_PATH = '/models/fast-plate-ocr-s-v2.onnx';

// Alphabet for Fast-Plate-OCR (Global CCT model from hub config)
const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_";
const PAD_CHAR = "_";
const IMG_WIDTH = 128;
const IMG_HEIGHT = 64;

/**
 * Initialize the Fast-Plate-OCR ONNX session.
 */
export const getFastPlateOCRSession = async () => {
  if (typeof window === 'undefined') return null;
  if (ortSession) return ortSession;

  try {
    console.log("Initializing Fast-Plate-OCR (ONNX)...");
    
    // Suppress verbose warnings (like node assignment hints)
    ort.env.logLevel = 'fatal';
    
    // Configure WASM paths explicitly for Next.js
    ort.env.wasm.wasmPaths = {
      'ort-wasm-simd-threaded.wasm': '/wasm/ort-wasm-simd-threaded.wasm',
      'ort-wasm-simd.wasm': '/wasm/ort-wasm-simd.wasm',
      'ort-wasm-threaded.wasm': '/wasm/ort-wasm-threaded.wasm',
      'ort-wasm.wasm': '/wasm/ort-wasm.wasm',
      'ort-wasm-simd-threaded.jsep.wasm': '/wasm/ort-wasm-simd-threaded.jsep.wasm',
    };
    ort.env.wasm.numThreads = navigator.hardwareConcurrency || 4;

    const session = await ort.InferenceSession.create(MODEL_PATH, {
      executionProviders: ['webgpu', 'webgl', 'wasm'],
      graphOptimizationLevel: 'all',
      logSeverityLevel: 4, // 0:Verbose, 1:Info, 2:Warning, 3:Error, 4:Fatal
    });
    
    ortSession = session;
    console.log("Fast-Plate-OCR Loaded Successfully. Available Providers:", session.executionProviders);
    return ortSession;
  } catch (error) {
    console.error("Fast-Plate-OCR Loading Error:", error);
    return null;
  }
};

/**
 * Initialize the TrOCR (Transformer-based OCR) pipeline as a fallback.
 * Model: Xenova/trocr-small-printed (~60MB download, cached after first run)
 */
export const getTrOCRPipeline = async () => {
  if (typeof window === 'undefined') return null; // Safety for server-side evaluation
  if (ocrPipeline) return ocrPipeline;
  if (isInitializing) return initializationPromise!;

  isInitializing = true;
  initializationPromise = (async () => {
    try {
      console.log("Initializing Fallback TrOCR Model...");
      
      const Transformers = await import('@huggingface/transformers');
      const { pipeline, env } = Transformers;
      
      if (env) {
        env.allowLocalModels = false;
        env.allowRemoteModels = true;
        env.useBrowserCache = true;
        env.backends.onnx.logLevel = 'error';
      }

      const newPipeline = await pipeline('image-to-text', 'Xenova/trocr-small-printed', {
        device: 'webgpu', 
        dtype: 'fp32',
      });
      
      ocrPipeline = newPipeline;
      console.log("Fallback TrOCR Model Loaded.");
      return ocrPipeline;
    } catch (error) {
      console.error("TrOCR Loading Error:", error);
      return null;
    } finally {
      isInitializing = false;
    }
  })();

  return initializationPromise;
};

/**
 * Preprocesses an image for the Fast-Plate-OCR model.
 * Default export format: 128x64, uint8, NHWC.
 */
async function preprocess(imageSource: string | Blob): Promise<ort.Tensor> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      canvas.width = IMG_WIDTH;
      canvas.height = IMG_HEIGHT;
      ctx.drawImage(img, 0, 0, IMG_WIDTH, IMG_HEIGHT);
      
      const imageData = ctx.getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT);
      const data = imageData.data;
      
      // Create NHWC Uint8Array (Height x Width x Channels)
      // Model expects RGB, Canvas provides RGBA
      const uint8Data = new Uint8Array(IMG_HEIGHT * IMG_WIDTH * 3);
      for (let i = 0; i < data.length / 4; i++) {
        uint8Data[i * 3] = data[i * 4];         // R
        uint8Data[i * 3 + 1] = data[i * 4 + 1];   // G
        uint8Data[i * 3 + 2] = data[i * 4 + 2];   // B
      }
      
      const tensor = new ort.Tensor('uint8', uint8Data, [1, IMG_HEIGHT, IMG_WIDTH, 3]);
      resolve(tensor);
    };
    img.onerror = reject;
    img.src = typeof imageSource === 'string' ? imageSource : URL.createObjectURL(imageSource);
  });
}

/**
 * Postprocesses the model output (Greedy decoding).
 */
function postprocess(output: ort.Tensor): string {
  const data = output.data as Float32Array;
  const dims = output.dims; // Expected [1, max_plate_slots, alphabet_size] or [1, max_plate_slots * alphabet_size]
  
  let seqLen: number;
  let alphaSize: number;

  if (dims.length === 3) {
    seqLen = dims[1];
    alphaSize = dims[2];
  } else if (dims.length === 2) {
    // Reshape [1, total_size] to [1, max_plate_slots, alphabet_size]
    // Default max_plate_slots = 10, alphabet_size = 37
    alphaSize = ALPHABET.length;
    seqLen = dims[1] / alphaSize;
  } else {
    console.error("Unexpected model output dims:", dims);
    return "";
  }
  
  let result = "";
  for (let i = 0; i < seqLen; i++) {
    let maxIdx = 0;
    let maxVal = -Infinity;
    
    for (let j = 0; j < alphaSize; j++) {
      const val = data[i * alphaSize + j];
      if (val > maxVal) {
        maxVal = val;
        maxIdx = j;
      }
    }
    
    // Map index to character
    if (maxIdx < ALPHABET.length) {
      const char = ALPHABET[maxIdx];
      if (char !== PAD_CHAR) {
        result += char;
      }
    }
  }
  
  return result.trim();
}

/**
 * Normalizes strings for robust comparison of plate text.
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
        // 1. Try Fast-Plate-OCR (ONNX)
        const session = await getFastPlateOCRSession();
        if (session) {
          const inputTensor = await preprocess(imageSource);
          const feeds: Record<string, ort.Tensor> = {};
          feeds[session.inputNames[0]] = inputTensor;
          
          const results = await session.run(feeds);
          const outputTensor = results[session.outputNames[0]];
          const text = postprocess(outputTensor);
          
          if (text) {
            resolve({ text, confidence: 95 }); // High confidence for specialized model
            return;
          }
        }
        
        // 2. Fallback to TrOCR if ONNX fails or model not found
        console.log("Falling back to TrOCR...");
        const pipe = await getTrOCRPipeline();
        if (!pipe) {
           resolve({ text: "", confidence: 0 });
           return;
        }
        
        const output = await pipe(imageSource);
        const text = output[0]?.generated_text || "";
        
        resolve({ text: text.trim(), confidence: text ? 90 : 0 });
      } catch (error) {
        console.error('OCR Inference Error:', error);
        // Don't reject, just return empty to keep queue moving
        resolve({ text: "", confidence: 0 });
      }
    });
  });
};

export const terminateOCR = async () => {
  ortSession = null;
  ocrPipeline = null;
  initializationPromise = null;
};
