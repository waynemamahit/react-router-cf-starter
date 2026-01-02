# Change: Add Drag and Resize Support for Canvas Shapes

## Why
Users need the ability to reposition and resize rectangles and squares after they are created on the canvas. Currently, shapes are immutable once drawn, limiting the interactive capabilities of the canvas. This change enables post-creation manipulation of shapes, making the canvas tool more practical for design and layout work.

## What Changes
- Add drag functionality to move existing rectangles and squares to new positions
- Add corner resize handles that allow users to resize shapes by dragging from any corner
- Update dimension labels in real-time during drag and resize operations
- Maintain shape constraints (e.g., squares remain squares when resized with Shift held)
- Ensure visual feedback during manipulation (hover states, active states)

## Impact
- Affected specs: canvas-interaction
- Affected code: `app/routes/canvas.tsx`
- New interaction patterns: shape selection, drag operations, resize handles
- Enhanced user experience with more flexible shape manipulation
