# Phase 6: Export Engine

## Objective
Implement the final ZIP export system, resolving filenames and organizing images into the specified directory structure.

## Strategy
1. Build the `ExportProcessor` to partition the dataset index by status.
2. Resolve the final filename for each image (original vs. corrected).
3. Integrate a client-side ZIP library (e.g., JSZip or fflate) to build the export structure.
4. Implement the asynchronous ZIP build process with progress feedback.

## Key Outcomes
- Functional ZIP generation with Valid/Corrected/Unclear/Rejected folders.
- Correct filename resolution for the `Corrected` folder.
- Working browser-triggered download of `dataset_export.zip`.
