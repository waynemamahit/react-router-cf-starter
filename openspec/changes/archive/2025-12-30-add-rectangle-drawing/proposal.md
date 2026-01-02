# Change: Add Rectangle and Square Drawing to Canvas

## Why
The canvas currently only supports placing point markers. Users need the ability to draw rectangular shapes with dimension feedback to create more complex drawings and layouts. This enhances the canvas's utility for design and measurement tasks.

## What Changes
- Add click+drag interaction to create rectangles with real-time dimension display
- Add Shift key modifier to constrain rectangles to perfect squares
- Display width and height dimensions during and after shape creation
- Maintain existing point marker functionality alongside new shape drawing

## Impact
- Affected specs: `canvas-interaction`
- Affected code: `app/routes/canvas.tsx`, `app/routes/canvas.test.tsx`
- Breaking: No - additive feature that preserves existing behavior
