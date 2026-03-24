# Phase 9: Specialist OCR Integration (Fast-Plate-OCR) - Implementation

## Implementation Architecture

### 1. Preprocessing (Canvas-based)
To feed images into the ONNX model, they must be converted into a `Float32Array` of shape `(1, 3, 48, 224)` with normalized values (0 to 1).

```typescript
async function preprocess(imageSource: string | Blob): Promise<Float32Array> {
  const img = await loadImage(imageSource); // Helper to load Image from URL/Blob
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  canvas.width = 224;
  canvas.height = 48;
  ctx.drawImage(img, 0, 0, 224, 48);
  
  const imageData = ctx.getImageData(0, 0, 224, 48);
  const data = imageData.data;
  
  // Create CHW Float32Array
  const float32Data = new Float32Array(3 * 48 * 224);
  for (let i = 0; i < data.length / 4; i++) {
    // Normalization (0-1) and CHW split
    float32Data[i] = data[i * 4] / 255.0;           // R
    float32Data[i + 48 * 224] = data[i * 4 + 1] / 255.0; // G
    float32Data[i + 2 * 48 * 224] = data[i * 4 + 2] / 255.0; // B
  }
  
  return float32Data;
}
```

### 2. Postprocessing (Alphabet Mapping)
The model's character vocabulary is as follows:
`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-` (plus an optional blank/CTC token depending on the model variant). We will need to map the argmax of the model's output tensor (shape `1, sequence_length, alphabet_size`) to these characters.

### 3. Service Refactoring (`utils/ocrService.ts`)
The `getOCRPipeline` will be replaced with `getFastPlateOCRPipeline` which returns an `InferenceSession` from `onnxruntime-web`.

```typescript
import * as ort from 'onnxruntime-web';

let session: ort.InferenceSession | null = null;

export const getFastPlateOCRPipeline = async () => {
  if (session) return session;
  session = await ort.InferenceSession.create('/models/fast-plate-ocr-s-v2.onnx', {
    executionProviders: ['webgpu', 'webgl', 'wasm']
  });
  return session;
};
```

### 4. Integration with `PreloadManager.tsx`
The `PreloadManager` will remain largely unchanged but will benefit from the significant speed-up, allowing for a larger `preloadBuffer` if necessary.

## Security Considerations
- Ensure the model file is served with the correct MIME type.
- Verify `onnxruntime-web` WASM workers are correctly configured if the main thread fallback is needed.

## Performance Analysis
- Memory usage is expected to drop by 40-60%.
- Inference time should be <10ms per plate on most modern browsers.
