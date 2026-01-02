# Change: Add Interactive Canvas Page with Point Markers

## Why
Users need a visual canvas interface where they can click to place point markers that display coordinate labels. This provides an interactive way to see exact click positions with visual feedback.

## What Changes
- Add new `/canvas` route to the application
- Create canvas page component with click interaction
- Display visual point markers at click locations
- Show coordinate labels next to each point marker
- Style the canvas page with appropriate visual feedback

## Impact
- Affected specs: `canvas-interaction` (new capability)
- Affected code:
  - `app/routes.ts` - add new route
  - `app/routes/canvas.tsx` - new route component
