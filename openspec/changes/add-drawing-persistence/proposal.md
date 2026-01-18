# Change: Add Drawing Persistence

## Why
Users need the ability to save, list, load, and delete their canvas drawings with named persistence via server-side storage (Cloudflare KV). The current local storage persistence only maintains a single unnamed canvas state, limiting the ability to manage multiple drawings.

## What Changes
- Add backend API endpoints for drawing CRUD operations using Cloudflare KV
  - POST `/api/v1/drawings` - Save a drawing with a custom name
  - GET `/api/v1/drawings` - List saved drawings with pagination (10 per page)
  - GET `/api/v1/drawings/:name` - Get a specific drawing
  - DELETE `/api/v1/drawings/:name` - Delete a drawing
- Add frontend UI components for drawing management
  - Save input field and button (positioned alongside toolbar)
  - Saved drawings list with pagination (on same page as canvas)
  - Load drawing functionality via list item click
  - Delete button on each list item
- Add error handling with user-visible error messages
  - Separate error states for save vs list operations
  - Retry button for failed list operations
- Add validation to prevent duplicate drawing names

## Impact
- Affected specs: `drawing-persistence` (new capability)
- Affected code:
  - `server/routes/v1/` - New drawing API routes
  - `app/components/interactive-canvas/` - Extended UI components
  - `app/models/` - New types for drawing entities
  - `app/hooks/` - New custom hooks for API interactions
