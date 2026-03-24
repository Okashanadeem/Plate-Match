# Phase 9: Specialist OCR Integration (Fast-Plate-OCR) - Tasks

## Checklist

### [T090] Setup Dependencies
- [x] Install `onnxruntime-web`.
- [x] Copy WASM files to `public/wasm/` for production support.

### [T091] Model Preparation
- [x] Research and download the global CCT model in ONNX format (v2 global).
- [x] Store the model in `public/models/fast-plate-ocr-s-v2.onnx`.
- [x] Verified alphabet from hub config: `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_`.

### [T092] Refactor OCR Service
- [x] Implement `getFastPlateOCRSession` for ONNX initialization.
- [x] Implement `preprocess` function:
    - Resize to 128x64 (as per hub config).
    - Convert to `Uint8Array`.
    - `NHWC` transposition (Channels Last).
- [x] Implement `postprocess` function:
    - Greedy decoding (Argmax).
    - Map to alphabet with padding handling.
    - Robust reshaping of output tensor.
- [x] Update `performOCR` to use the new ONNX pipeline with TrOCR fallback.

### [T093] Performance Optimization
- [x] Enable WebGL/WebGPU acceleration in `onnxruntime-web`.
- [x] Configure explicit WASM paths for Next.js compatibility.

### [T094] Validation & Testing
- [x] Verified implementation against official `fast-plate-ocr` repository standards.
- [x] Compare inference speed between TrOCR and Fast-Plate-OCR (Fast-Plate-OCR is significantly faster <10ms).
- [x] Verify accuracy against the existing sample dataset.
- [x] Implemented UI/UX improvements: Copy button, 'S' shortcut for copying, and clickable edit box.
