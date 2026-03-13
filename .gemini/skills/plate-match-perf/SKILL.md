---
name: plate-match-perf
description: Specialist in PlateMatch performance optimization. Use for implementing lazy loading, preloading buffers, memory management (Object URL revocation), and offloading exports.
---

# PlateMatch Performance & Optimization

## Core Performance Mandates (Section 8)
- **Lazy Loading**: Only load the current image and a small buffer (Section 8.1).
- **Preloading**: Maintain a 2-3 image buffer for near-instant transitions (Section 8.2).
- **Memory Management**: MUST revoke Object URLs using `URL.revokeObjectURL()` (Section 8.3).
- **Virtualized Index**: Use virtual scrolling for large lists of images (Section 8.4).
- **Export Offloading**: Build ZIP files using Web Workers (Section 8.6).

## Key Patterns
- `URL.createObjectURL(fileHandle)` for reading from disk.
- `ringBuffer` for managing the preload cache.
- `fflate` or `JSZip` for asynchronous archive generation.

## Reference Material
- See [performance_specs.md](references/performance_specs.md) for implementation details.
