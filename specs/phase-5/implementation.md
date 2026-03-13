# Phase 5 Implementation: Progress & Persistence

## Technical Details
- **Progress Tracking:** Using `useMemo` in React to calculate stats from the index.
- **Persistence:** Serializing the dataset index to JSON and storing in `localStorage`.
- **Note:** Binary file handles cannot be persisted to `localStorage`. Re-selecting the folder may be required to restore handles.

## Key Components
- `ProgressPanel.tsx`: Sidebar with counters and bar.
- `SessionControls.tsx`: Buttons for manually saving/loading JSON session files.
- `AutoSaveManager.tsx`: Debounced worker that persists index on change.
