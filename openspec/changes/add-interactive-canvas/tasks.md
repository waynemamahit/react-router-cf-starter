## 1. Project Setup

- [x] 1.1 Create directory structure: `app/components/canvas/`, `app/hooks/`, `app/utils/`, `app/types/`
- [x] 1.2 Create type definitions for shape model (`CanvasPoint`, `CanvasRect`, `CanvasShape`, `CanvasState`, `CanvasAction`, `InteractionState`, `CanvasStats`) in `app/types/canvas.ts`
- [x] 1.3 Add `lucide-react` for toolbar icons (Undo2, Redo2, Trash2, Download, RotateCcw, HelpCircle, X)

## 2. State Management

- [x] 2.1 Implement `canvasReducer` handling ADD_POINT, ADD_RECT, DELETE_SHAPE, MOVE_SHAPE, RESIZE_SHAPE, SELECT_SHAPE, RESET, RESTORE actions
- [x] 2.2 Implement `historyReducer` wrapping canvasReducer with past/present/future arrays (max 50 past entries)
- [x] 2.3 Implement UNDO/REDO actions in historyReducer (selection changes do NOT create history entries)
- [x] 2.4 Create `useCanvasHistory` hook returning `{ state, dispatch, canUndo, canRedo, past, future }`
- [x] 2.5 Accept optional `initialPast` and `initialFuture` parameters for persistence restore

## 3. Canvas Rendering

- [x] 3.1 Implement `renderCanvas()` with DPR-aware scaling, grid background (20px, `#e5e7eb` on `#f9fafb`)
- [x] 3.2 Implement point rendering (4px dark gray circles at `#1f2937`)
- [x] 3.3 Implement rectangle rendering (semi-transparent blue fill `rgba(59,130,246,0.15)`, blue stroke `#3b82f6`)
- [x] 3.4 Implement selection highlight rendering (dashed orange border `#f59e0b`, 8px corner handles)
- [x] 3.5 Implement hover label rendering (point coordinates, rect WxH + area)
- [x] 3.6 Implement resize label rendering (WxH + area during resize operation)
- [x] 3.7 Implement z-ordering: draw all rects first, then all points (points always on top)
- [x] 3.8 Implement dashed preview rectangle during drawing mode

## 4. Hit-Testing & Resize Math

- [x] 4.1 Implement `hitTest()` — iterate shapes in reverse order, points by squared distance (8px threshold), rects by bounding box
- [x] 4.2 Implement `getCornerHandle()` — detect mouse near corner handles (6px tolerance) returning nw/ne/sw/se
- [x] 4.3 Implement `computeResize()` — handle all 4 corners, negative dimension normalization, Shift square constraint
- [x] 4.4 Implement `getStats()` — count points, squares (rect with isSquare=true), rectangles (rect with isSquare=false)

## 5. Canvas Component & Interaction

- [x] 5.1 Create `Canvas` component with `useRef` for canvas element, interaction state, and state mirror
- [x] 5.2 Implement `ResizeObserver` for responsive canvas sizing with `devicePixelRatio` scaling
- [x] 5.3 Implement `handleMouseDown` — detect corner handle (→ resizing), shape hit (→ moving), empty area (→ drawing)
- [x] 5.4 Implement `handleMouseMove` — update interaction state, call `scheduleDraw()` for live preview, mutate `stateRef` for smooth feedback during move/resize
- [x] 5.5 Implement `handleMouseUp` — finalize: drawing (< 3px = point, >= 3px = rect), moving (dispatch MOVE_SHAPE), resizing (dispatch RESIZE_SHAPE)
- [x] 5.6 Implement `handleMouseLeave` — finalize in-progress action, reset hover/cursor
- [x] 5.7 Implement `scheduleDraw()` with `requestAnimationFrame` throttling, cancel on mouse up
- [x] 5.8 Implement dynamic cursor classes: crosshair (idle), grab (hover shape), grabbing (moving), nw/ne/sw-se-resize (handles)
- [x] 5.9 Implement global Shift keydown/keyup listeners for mid-drag square constraint toggle
- [x] 5.10 Auto-detect square on rect creation (`isSquare: inter.isSquare || w === h`)

## 6. Toolbar Component

- [x] 6.1 Create `CanvasToolbar` with undo, redo, delete, export, reset, help buttons
- [x] 6.2 Implement export dropdown menu (PNG/JPG/SVG) with click-outside-to-close
- [x] 6.3 Use `lucide-react` icons and DaisyUI button classes
- [x] 6.4 Disable undo/redo/delete buttons based on state (no history = disabled, no selection = delete disabled)

## 7. Stats & User Guide Components

- [x] 7.1 Create `CanvasStats` component displaying points, rectangles, squares counts
- [x] 7.2 Create `UserGuide` modal component with sections for creating, selecting, modifying, undo/redo, export, persistence
- [x] 7.3 Implement modal backdrop click-to-close and close button

## 8. Export

- [x] 8.1 Implement `renderToOffscreen()` — create offscreen canvas, draw shapes with background, return `toDataURL(mimeType)`
- [x] 8.2 Implement `exportToPNG()` and `exportToJPG()` using `renderToOffscreen()` with correct MIME types
- [x] 8.3 Implement `exportToSVG()` — manual SVG string serialization with `<rect>` and `<circle>` elements
- [x] 8.4 Implement `downloadExport()` — create temporary `<a>` element, trigger download, filename `canvas-export-{timestamp}.{ext}`
- [x] 8.5 Guard empty shapes: return early without download

## 9. Persistence

- [x] 9.1 Implement `persistence.ts` — save/load/clear for canvas state and full history (past/present/future)
- [x] 9.2 Implement validation (`isValidState`) checking shape id, type, x, y fields
- [x] 9.3 Implement backup key fallback for corrupted primary data
- [x] 9.4 Implement 4MB size guard with backup before overwrite
- [x] 9.5 Create `useCanvasPersistence` hook with 500ms throttled auto-save
- [x] 9.6 Implement SSR-safe hydration: `enabled` flag prevents save before client-side restore
- [x] 9.7 Dispatch RESTORE action in `useEffect` on mount to hydrate from localStorage

## 10. Home Page Integration

- [x] 10.1 Replace home page route with canvas layout (header + toolbar + canvas + stats + guide)
- [x] 10.2 Wire all components together with `useCanvasHistory`, `useCanvasPersistence`, keyboard shortcuts
- [x] 10.3 Implement keyboard shortcuts: Delete/Backspace (delete), Ctrl+Z/Cmd+Z (undo), Ctrl+Shift+Z/Cmd+Shift+Z (redo)
- [x] 10.4 Implement handleReset dispatching RESET action (no-op if no shapes)
- [x] 10.5 Implement handleExport calling `downloadExport()` with alert on empty/failed
- [x] 10.6 Wrap Canvas in `CanvasErrorBoundary`

## 11. Error Handling

- [x] 11.1 Add try-catch to all export functions with `console.error` logging
- [x] 11.2 Add try-catch to all persistence functions with backup fallback
- [x] 11.3 Create `CanvasErrorBoundary` class component with fallback UI and "Try again" button

## 12. End-to-End Tests

- [x] 12.1 Add e2e test: page loads with title, toolbar buttons, stats, and canvas visible
- [x] 12.2 Add e2e test: click creates point, enables undo
- [x] 12.3 Add e2e test: drag creates rectangle
- [x] 12.4 Add e2e test: undo after point creation disables undo
- [x] 12.5 Add e2e test: user guide opens and closes
- [x] 12.6 Add e2e test: export menu shows PNG/JPG/SVG options
- [x] 12.7 Add e2e test: keyboard Ctrl+Z undo shortcut
- [x] 12.8 Add e2e test: Shift+drag creates square (stats show square count)
- [x] 12.9 Add e2e test: mid-drag Shift creates square (dynamic Shift tracking)
- [x] 12.10 Add e2e test: Delete key removes selected shape
- [x] 12.11 Add e2e test: delete button removes selected shape
- [x] 12.12 Add e2e test: redo after undo (undo/redo cycle)
- [x] 12.13 Add e2e test: reset clears all shapes and stats
- [x] 12.14 Add e2e test: multiple shape types update stats correctly
