# PlateMatch UI Specifications

## Color Palette (Tailwind)
- **Approve**: `text-green-500`, `bg-green-600` (Hover), `border-green-400`.
- **Rename**: `text-blue-500`, `bg-blue-600` (Hover), `border-blue-400`.
- **Unclear**: `text-amber-500`, `bg-amber-600` (Hover), `border-amber-400`.
- **Reject**: `text-red-500`, `bg-red-600` (Hover), `border-red-400`.
- **Backgrounds**: `bg-neutral-900` (Main), `bg-neutral-800` (Panels).

## Components (Section 6)
- **TopNav.tsx**: Logo, Dataset Name, Progress Counter, Export Button.
- **ImageViewer.tsx**: Responsive image scaling, Spinner while loading, Error state placeholder.
- **ControlGroup.tsx**: Button row with keyboard shortcut icons (e.g., [A], [U], [R]).
- **ProgressStats.tsx**: Progress bar and numeric breakdown.
