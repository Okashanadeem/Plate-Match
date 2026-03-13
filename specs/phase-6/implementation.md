# Phase 6 Implementation: Export Engine

## Technical Details
- **ZIP Library:** JSZip or fflate.
- **Performance:** ZIP generation in a Web Worker (if feasible) to keep the UI responsive.
- **Structure:** `dataset/{valid,corrected,unclear,rejected}/`

## Key Functions
- `generateZip()`: Loops through index, resolves names, and adds to ZIP object.
- `downloadZip(blob)`: Creates a temporary anchor and clicks it.
- `resolveFilename(record)`: Returns the string to use for the image file in the ZIP.
- `validateExport()`: Checks for errors like naming conflicts before packaging.
