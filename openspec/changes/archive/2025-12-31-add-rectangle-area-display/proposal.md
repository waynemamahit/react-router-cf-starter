# Change: Add Area Display for Rectangles and Squares

## Why
Users need to see the calculated area of rectangles and squares to understand the size of shapes they create. Currently, only width and height dimensions are displayed, but area is a fundamental measurement that provides immediate insight into the total size of a shape.

## What Changes
- Add area calculation and display to rectangle and square dimension labels
- Show area information alongside existing width and height labels
- Update dimension labels for both active drawing and completed shapes
- Format area as "Area: {width × height}" in pixels squared

## Impact
- Affected specs: `canvas-interaction`
- Affected code: `app/routes/canvas.tsx` (dimension label rendering for rectangles)
- No breaking changes
