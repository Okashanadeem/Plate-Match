# Phase 2 Implementation: Dataset Loading & Indexing

## Technical Specifications
- **API:** Browser File System Access API (`window.showDirectoryPicker`)
- **Indexing:** In-memory array of `ImageRecord` objects.
- **Persistence:** Metadata stored in Zustand; binary file handles preserved for on-demand reading.

## Key Functions
- `loadDirectory()`: Triggers picker and iterates through entries.
- `createImageRecord()`: Maps a file entry to the internal schema (ID, Filename, etc.).
- `validateImageFormat()`: Regex-based extension check for jpg, png, webp.
