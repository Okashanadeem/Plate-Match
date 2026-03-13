# Phase 8 Implementation: AI-Powered Automation

## 1. Technological Integration
### OCR Stack: `Tesseract.js`
- Use the **Web Worker** worker thread implementation to prevent UI freezing.
- Load the OCR language data on startup (cached in indexedDB by Tesseract).

## 2. Store Changes (`useDatasetStore.ts`)
Add new fields to the `ImageRecord` interface:
```typescript
interface ImageRecord {
  // ... existing fields ...
  ocrResult?: string;
  ocrConfidence?: number;
  ocrMatchStatus?: 'Match' | 'Mismatch' | 'Uncertain';
}
```

## 3. Worker Strategy (`utils/ocrWorker.ts`)
- Initialize Tesseract `Scheduler`.
- Expose a `recognize(image: Blob)` function.
- Clean the OCR output: Remove non-alphanumeric characters to match typical plate formats.

## 4. UI Refinement
### TopNav
- Add a "Run OCR on All" button with a background progress bar.
- Add a "Batch Approve" dropdown (e.g., "Approve all matches").

### FileInfoPanel
- Add an "OCR Insight" card showing:
  - System read: `XYZ-123`
  - Confidence: `94%`
  - Match status: ✅

## 5. Automation Logic
- **Matching Rule:** If `ocrResult.replace(/[^A-Z0-9]/g, '') === filename.replace(/[^A-Z0-9]/g, '')`.
- **Confidence Threshold:** Only mark as "Match" if confidence > 85%.
