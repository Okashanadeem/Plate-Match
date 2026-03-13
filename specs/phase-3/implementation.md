# Phase 3 Implementation: Annotation Interface & Logic

## Technical Details
- **Image Rendering:** Using `URL.createObjectURL` for file handles; revoking URLs after use to manage memory.
- **Form Management:** Using controlled inputs for renaming.
- **Status Transitions:** Updating single records in the Zustand index array for performance.

## Core Logic
- `onApprove()`: Sets status to Valid and triggers next image.
- `onRename(newFilename)`: Validates new text, sets status to Corrected, and updates index.
- `onUnclear()`: Sets status to Unclear and advances.
- `onReject()`: Sets status to Rejected and advances.
