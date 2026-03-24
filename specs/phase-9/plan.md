# Phase 9: Specialist OCR Integration (Fast-Plate-OCR)

## Objective
Replace the current general-purpose TrOCR model (`Xenova/trocr-small-printed`) with a specialized, high-performance license plate OCR system based on `fast-plate-ocr`. This will improve inference speed, reduce model size, and increase accuracy for diverse license plate formats.

## Why Fast-Plate-OCR?
- **Speed:** CCT (Compact Convolutional Transformer) architecture is much faster than the full encoder-decoder TrOCR.
- **Size:** Models are significantly smaller (XS/S variants), leading to faster initial loads.
- **Specialization:** Trained specifically on license plates, handling varying fonts and conditions better than general printed text models.

## Integration Strategy
Since there is no official NPM package for `fast-plate-ocr`, we will integrate its **ONNX** models directly into the browser using `onnxruntime-web`.

### 1. Model Selection
We will use the **`cct-s-v2-global-model`** which provides a good balance between speed and accuracy for global license plates.

### 2. Implementation Steps
1.  **Dependency Setup:**
    - Install `onnxruntime-web` for browser-based ONNX inference.
    - Install `ndarray` and `ndarray-ops` for efficient image preprocessing (or use native `Canvas` + `Float32Array`).
2.  **Asset Management:**
    - Place the `.onnx` model and its corresponding character vocabulary (alphabet) in the `public/models` directory.
3.  **Refactor `ocrService.ts`:**
    - Replace `Transformers.js` logic with `onnxruntime-web` initialization.
    - Implement image preprocessing:
        - Resize input to model's expected dimensions (e.g., 224x48).
        - Normalize pixel values (0-1).
        - Convert to the correct tensor shape (CHW).
    - Implement postprocessing:
        - Greedy decoding of the output tensor.
        - Map character indices to the license plate alphabet.
4.  **Optimization:**
    - Utilize WebGL or WebGPU backends in `onnxruntime-web` for hardware acceleration.
    - Maintain the sequential queue to prevent UI blocking.

## Success Criteria
- [x] OCR inference is at least 3x faster than TrOCR (CCT model <10ms).
- [x] Model download size is reduced from ~60MB to <15MB (5MB ONNX file).
- [x] Improved accuracy on stylized or non-standard license plate fonts.
- [x] Automated workflow with copy shortcuts and interactive edit box.
