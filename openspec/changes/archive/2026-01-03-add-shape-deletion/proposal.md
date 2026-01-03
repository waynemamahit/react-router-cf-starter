# Change: Add Shape Deletion and Drawing Management

## Why
Users need the ability to delete individual shapes (points and rectangles) from the canvas and delete saved drawings from the list. Currently, there is no way to remove unwanted shapes or manage saved drawings, which limits the canvas's usability and requires users to start over if they make mistakes.

## What Changes
- Add ability to delete individual points by clicking them when selected
- Add ability to delete individual rectangles/squares when selected
- Add delete button in the saved drawings list for each drawing
- Add DELETE API endpoint at `/api/v1/drawings/:id` to remove drawings from storage
- Add visual feedback for deletion actions (confirmation or immediate delete)
- Update the drawings list after deletion to reflect changes

## Impact
- Affected specs: canvas-interaction
- Affected code:
  - `app/routes/canvas.tsx` - Add delete functionality for shapes and drawing list items
  - `app/routes/canvas.models.ts` - May need to add types for delete operations
  - `server/routes/v1/drawings.ts` - Add DELETE endpoint
  - `server/routes/v1/drawings.test.ts` - Add tests for DELETE endpoint
