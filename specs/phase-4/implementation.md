# Phase 4 Implementation: Interaction & Navigation

## Technical Details
- **Keyboard Handling:** Using `addEventListener('keydown')` with focus checks (`document.activeElement`).
- **Navigation:** Using a simple index-based pointer in the Zustand store.
- **Shortcut Map:** A consistent mapping of keys to actions (e.g., `A` → Approve, `→` → Next).

## Key Components
- `NavigationControls.tsx`: The bottom bar with arrows, current index, and jump input.
- `KeyboardProvider.tsx`: Wrapper for managing shortcut lifecycle.
- `ShortcutLegend.tsx`: Collapsible tooltip/panel showing available keys.
