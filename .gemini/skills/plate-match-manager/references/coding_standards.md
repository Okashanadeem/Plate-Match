# Coding Standards for PlateMatch

## Next.js (App Router)
- Use functional components with TypeScript.
- Prefer client components for interactive UI elements.
- Use `lucide-react` for icons.

## Styling (Tailwind CSS)
- Neutral dark backgrounds (e.g., `bg-neutral-900`).
- High-contrast primary actions (e.g., `bg-green-600` for Approve).
- Responsive layouts using Tailwind's grid/flex utilities.

## State Management (Zustand)
- Store index and session state in a single store.
- Use selective selectors to prevent unnecessary re-renders.
