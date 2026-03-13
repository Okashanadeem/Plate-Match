# PlateMatch Performance Specifications

## Memory Ring Buffer (Section 8.3)
Implement a ring buffer for the preloaded image cache:
- **Size**: 5-10 slots.
- **Action**: When the user moves far from the cached index, revoke the oldest Object URLs to free memory.
- **Code Pattern**: `if (cache.size > MAX) URL.revokeObjectURL(oldestUrl);`

## Preloading Buffer (Section 8.2)
- Background load the next 3 images (`index + 1`, `index + 2`, `index + 3`).
- Use hidden `<img>` tags or a dedicated `PreloadProvider` to warm the browser's cache.

## Export Engine (Section 7.3)
- Use a Web Worker for the `generateZip` process.
- Pass progress back to the main thread: `Packaging: 2,340 / 5,000`.
- Batch image binary reads to avoid blocking the UI thread.
