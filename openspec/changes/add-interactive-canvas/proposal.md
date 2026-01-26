# Change: Add Interactive Canvas

## Why
The application needs an interactive canvas feature to replace the current home page, allowing users to create, manipulate, and persist geometric shapes (points, rectangles, and squares) with full undo/redo support and export capabilities.

## What Changes
- Replace the current home page with an interactive canvas component
- Add canvas drawing capabilities for points and rectangles/squares
- Add shape selection, movement, and resizing functionality
- Add undo/redo history management with keyboard shortcuts
- Add export functionality (PNG, JPG, SVG formats)
- Add local storage persistence for canvas state
- Add user guide and statistics display
- Add reset/clear canvas functionality

## Impact
- Affected specs: `interactive-canvas` (new capability)
- Affected code:
  - `app/routes/home.tsx` - Replace with canvas component
  - `app/components/` - New canvas components (Canvas, Toolbar, Statistics, Guide)
  - `app/hooks/` - New hooks for canvas state, history, and persistence
  - `app/models/` - New types for shapes, canvas state, and history
  - `app/utils/` - New utilities for geometry calculations and export
