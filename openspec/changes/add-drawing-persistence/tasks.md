# Tasks: Add Drawing Persistence

## 1. Backend API Implementation

- [x] 1.1 Create drawing models and types (`app/models/drawing.ts`)
  - Define `StoredDrawing`, `DrawingMetadata`, `ListDrawingsResponse` interfaces
  - Define API request/response types

- [x] 1.2 Create drawings API routes (`server/routes/v1/drawings.ts`)
  - Implement POST `/drawings` - Save drawing with name validation
  - Implement GET `/drawings` - List drawings with cursor-based pagination (10 per page)
  - Implement GET `/drawings/:name` - Get single drawing
  - Implement DELETE `/drawings/:name` - Delete drawing
  - Register routes in `server/routes/v1/index.ts`

- [x] 1.3 Add duplicate name validation
  - Check if drawing name exists before saving
  - Return 409 Conflict error with descriptive message

- [x] 1.4 Write unit tests for API endpoints
  - Test happy paths for all CRUD operations
  - Test duplicate name validation (409 response)
  - Test pagination cursor handling
  - Test error responses (404 for missing drawing)

## 2. Frontend Models and Hooks

- [x] 2.1 Create API client utilities (`app/utils/drawings-api.ts`)
  - `saveDrawing(name: string, shapes: Shape[]): Promise<SaveDrawingResponse>`
  - `listDrawings(cursor?: string): Promise<ListDrawingsResponse>`
  - `loadDrawing(name: string): Promise<StoredDrawing>`
  - `deleteDrawing(name: string): Promise<void>`

- [x] 2.2 Create drawing persistence hook (`app/hooks/useDrawingPersistence.ts`)
  - Manage save state (loading, error)
  - Manage list state (data, loading, error, pagination)
  - Provide retry functionality for list errors
  - Handle optimistic updates for delete

## 3. UI Components

- [x] 3.1 Create SaveDrawingForm component (`app/components/interactive-canvas/SaveDrawingForm.tsx`)
  - Input field for drawing name
  - Save button with loading state
  - Error message display (inline)
  - Validation feedback for empty/duplicate names

- [x] 3.2 Create SavedDrawingsList component (`app/components/interactive-canvas/SavedDrawingsList.tsx`)
  - Display list of saved drawings with metadata
  - Click to load drawing functionality
  - Delete button per list item
  - Loading skeleton UI
  - Error state with retry button
  - Pagination controls (prev/next)
  - Empty state message

- [x] 3.3 Integrate components into CanvasContainer
  - Add SaveDrawingForm next to toolbar
  - Add SavedDrawingsList to sidebar
  - Wire up state management and callbacks
  - Handle loading saved drawing into canvas

- [x] 3.4 Write component tests
  - Test SaveDrawingForm input and validation
  - Test SavedDrawingsList rendering and interactions
  - Test error states and retry functionality
  - Test pagination navigation

## 4. Integration and Polish

- [x] 4.1 End-to-end integration testing
  - Save drawing → appears in list
  - Load drawing → canvas updates
  - Delete drawing → removed from list
  - Error handling displays correctly

- [x] 4.2 Responsive design verification
  - Test on mobile viewport sizes
  - Ensure list fits within sidebar constraints
  - Verify input/button layout on small screens

## Dependencies
- Tasks 1.x can be done in parallel with Tasks 2.x
- Task 3.x depends on 1.x and 2.x completion
- Task 4.x depends on all previous tasks
