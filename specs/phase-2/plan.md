# Phase 2: Dataset Loading & Indexing

## Objective
Implement the dataset loading workflow using the File System Access API and construct an in-memory index for all valid image files.

## Strategy
1. Integrate the Browser File System Access API to pick local directories.
2. Build a recursive filtering engine for supported image formats.
3. Define and populate the initial in-memory dataset index with metadata (ID, original filename, etc.).
4. Implement basic directory error handling and permission requesting.

## Key Outcomes
- Successful local directory picking and scanning.
- Reactive dataset index representing all supported images.
- Basic loading progress display for large folders.
