## Why

The home page is a static placeholder. Adding an interactive drawing canvas gives users a creative tool directly on the landing page — allowing them to create points, rectangles, and squares with intuitive click/drag interactions, complete with undo/redo, export, and persistence.

## What Changes

- Replace the home page with a full interactive canvas page rendered via the HTML Canvas 2D API
- Add point creation on click with coordinate labels on hover
- Add rectangle creation on click+drag with live dimension/area labels; hold Shift to create squares
- Add resize on rectangle/square corners with live dimension/area labels and direction-specific cursors
- Add move for rectangles/squares via drag-and-drop
- Add delete for selected shapes via Delete key or toolbar button
- Add undo/redo via buttons and keyboard shortcuts (Ctrl+Z / Ctrl+Shift+Z)
- Add export to PNG, JPG, and SVG (native Canvas `toDataURL` + manual SVG serialization)
- Add user guide modal with interaction instructions
- Add count statistics (points, rectangles, squares)
- Add reset/clear canvas (undoable)
- Add auto-save to localStorage with throttled writes and backup fallback
- Add auto-restore on page load (SSR-safe via `useEffect` hydration)

## Capabilities

### New Capabilities
- `interactive-canvas`: Core drawing canvas with point, rectangle, and square creation, selection, resizing, moving, deletion, undo/redo, export, statistics, user guide, and reset
- `canvas-persistence`: Automatic save to localStorage with throttled writes, backup fallback for corruption, and SSR-safe restore on page load

### Modified Capabilities
<!-- No existing specs to modify -->

## Impact

- `app/routes/home.tsx` — Replace home page with canvas layout (header + toolbar + canvas + stats + guide modal)
- `app/types/canvas.ts` — New type definitions for shape model, state, actions, and interaction state
- `app/components/canvas/Canvas.tsx` — Main canvas component with mouse interaction state machine
- `app/components/canvas/CanvasToolbar.tsx` — Toolbar with undo, redo, delete, export dropdown, reset, help buttons
- `app/components/canvas/CanvasStats.tsx` — Live shape count statistics display
- `app/components/canvas/UserGuide.tsx` — Modal with interaction instructions
- `app/components/canvas/CanvasErrorBoundary.tsx` — React class ErrorBoundary for canvas errors
- `app/hooks/useCanvasHistory.ts` — Custom hook wrapping useReducer with undo/redo history stack (max 50)
- `app/hooks/useCanvasPersistence.ts` — Throttled auto-save hook with SSR-safe hydration flag
- `app/utils/canvas-renderer.ts` — Canvas 2D rendering, hit-testing, resize math, and shape counting
- `app/utils/export.ts` — PNG/JPG export via offscreen canvas, SVG export via manual serialization
- `app/utils/persistence.ts` — localStorage save/load with validation, backup key, and corruption recovery
- `e2e/canvas.spec.ts` — Playwright end-to-end tests covering all interactions
