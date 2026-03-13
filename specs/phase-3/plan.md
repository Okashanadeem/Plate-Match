# Phase 3: Annotation Interface & Logic

## Objective
Build the core annotation workspace where images are displayed and reviewers perform the four status actions (Valid, Corrected, Unclear, Rejected).

## Strategy
1. Implement the responsive `ImageViewer` component with on-demand image reading.
2. Build the `FileInfoPanel` with the filename rename field.
3. Develop the `AnnotationEngine` to apply status changes and rename events to the dataset index.
4. Integrate the four annotation buttons with their respective status transition logic.

## Key Outcomes
- Functional single-image viewer.
- Interactive status buttons applying changes to global state.
- Real-time display of metadata and working filename.
