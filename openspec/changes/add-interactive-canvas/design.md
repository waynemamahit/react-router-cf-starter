## Context

The current app has a static home page (`app/routes/home.tsx`). We need to replace it with a full interactive canvas using React + HTML Canvas 2D API. The canvas supports creating points, rectangles, and squares with selection, resizing, moving, undo/redo, export, persistence, and statistics. The app uses React Router v7, Tailwind CSS v4, and DaisyUI v5.

## Goals / Non-Goals

**Goals:**
- Replace home page with interactive canvas rendered via HTML Canvas 2D API
- Points created on click with coordinate labels on hover
- Rectangles on click+drag, squares with Shift held (toggleable mid-drag)
- Resize at corners with live dimension/area labels and direction-specific cursors
- Move shapes via drag-and-drop
- Delete via Delete key or button
- Undo/redo via buttons and Ctrl+Z / Ctrl+Shift+Z (history capped at 50)
- Export to PNG, JPG, SVG (native Canvas API, no external library)
- User guide modal
- Count statistics (points, rectangles, squares)
- Reset/clear canvas (undoable)
- Auto-save to localStorage with throttled writes, backup fallback, and SSR-safe restore

**Non-Goals:**
- Freehand drawing / pencil tool
- Shape rotation
- Multi-selection or grouping
- Server-side persistence or sharing
- Collaborative editing

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Canvas approach | HTML Canvas 2D API via React + `useRef` | Full pixel control for drawing shapes, labels, and handles. SVG would be simpler for DOM events but harder for complex rendering and export. |
| State management | React `useReducer` in `useCanvasHistory` hook | Local state only, no server sync. Reducer pattern suits undo/redo (action history stack). Two-layer reducer: inner `canvasReducer` for state transforms, outer `historyReducer` for past/present/future management. |
| Export | Native Canvas `.toDataURL()` for PNG/JPG, SVG string serialization for SVG | No external dependency needed. Offscreen canvas created via `document.createElement("canvas")` for PNG/JPG. SVG built as markup string. |
| Persistence | localStorage with throttled saves (500ms) | Simple, no backend needed. Full history (past/present/future) saved, not just current state. Backup key for corruption recovery. |
| Undo/redo | History stack with `past`/`present`/`future` arrays | Max 50 entries in `past`. Selection changes (`SELECT_SHAPE`) do NOT create history entries. `RESTORE` action sets the full history from persistence. |
| Shape model | Two types: `CanvasPoint` (x, y) and `CanvasRect` (x, y, w, h, isSquare, color) | Squares stored as rects with `isSquare` flag. `color` field exists but renderer uses fixed blue (`#3b82f6`). Stats count squares and rectangles separately. |
| Z-ordering | Shapes stored in array order; points drawn last (on top) | Points are always above rects. Rects ordered by creation time. Hit-testing iterates in reverse (last = topmost checked first). |
| Rendering | `requestAnimationFrame`-based `scheduleDraw()` throttles redraws | Prevents excessive redraws during rapid mouse moves. Uses `stateRef.current` pattern to avoid stale closures. |
| Interaction model | Mutable `interactionRef` + `stateRef` for live feedback | During drag, shapes are updated directly on the ref (not via dispatch) for smooth visual feedback. Final position dispatched on mouse up. |
| SSR safety | `initialized` flag gating persistence | Home page starts with `initialized = false`, dispatches `RESTORE` in `useEffect` (client-only), then sets `initialized = true`. Persistence only saves after hydration. |
| ID generation | Module-scoped counter + `Date.now()` | Counter survives component re-mounts. Combined with timestamp for uniqueness. |

## Architecture

### Component Tree

```
Home (app/routes/home.tsx)
├── CanvasToolbar (toolbar buttons, outside canvas)
├── CanvasErrorBoundary
│   └── Canvas (main canvas element + mouse handlers)
├── CanvasStats (live counts, outside canvas)
└── UserGuide (modal overlay)
```

### File Structure

```
app/
├── types/canvas.ts              # Shape model, state, actions, interaction types
├── hooks/
│   ├── useCanvasHistory.ts      # useReducer + undo/redo history stack
│   └── useCanvasPersistence.ts  # Throttled auto-save hook
├── utils/
│   ├── canvas-renderer.ts       # Canvas 2D rendering, hit-testing, resize math
│   ├── export.ts                # PNG/JPG/SVG export
│   └── persistence.ts           # localStorage save/load/validate
├── components/canvas/
│   ├── Canvas.tsx               # Main canvas component
│   ├── CanvasToolbar.tsx        # Toolbar with action buttons
│   ├── CanvasStats.tsx          # Shape count display
│   ├── UserGuide.tsx            # Help modal
│   └── CanvasErrorBoundary.tsx  # Error boundary class component
└── routes/home.tsx              # Home page route (orchestrator)
```

### State Flow

1. `Home` creates state via `useCanvasHistory({ shapes: [], selectedId: null })`
2. `Home` passes `state` and `dispatch` to `Canvas`
3. `Canvas` handles mouse events, calls `dispatch` for final actions, mutates `stateRef` for live preview
4. `useCanvasPersistence` watches `past`/`present`/`future` and throttles saves to localStorage
5. On mount, `Home` reads localStorage via `restoreCanvasHistory()` and dispatches `RESTORE`

### Mouse Interaction State Machine

```
idle → mousedown on handle → resizing
idle → mousedown on shape → moving
idle → mousedown on empty → drawing
drawing/moving/resizing → mouseup → idle
any → mouseleave → idle (finalize current action)
```

## Risks / Trade-offs

- **Canvas event handling complexity** → Hit-testing on mouse events. Points use distance check (8px threshold); rects use bounding box + corner handle detection (6px tolerance).
- **Performance with many shapes** → `requestAnimationFrame` throttling + `useRef` pattern avoids re-renders. No virtual canvas needed for typical use.
- **localStorage size limits** → ~5-10MB should be fine for canvas state. Backup key created if serialized state > 4MB.
- **Stale closure problem** → Solved with `stateRef.current` and `interactionRef` mutable refs that event handlers read from instead of captured state.
- **SSR hydration mismatch** → Persistence disabled until `useEffect` runs. Initial render always shows empty canvas; `RESTORE` dispatched client-side.

## Error Handling

- **Export operations**: All export functions wrapped in try-catch blocks with `console.error` logging. Return empty string on failure. `downloadExport` returns `false` on empty shapes or error.
- **Persistence operations**: All localStorage operations wrapped in try-catch blocks. Backup fallback when primary key corrupted. Validation rejects invalid shape data.
- **Canvas rendering**: React `CanvasErrorBoundary` wraps Canvas component to catch and display rendering errors with a "Try again" button.
- **User feedback**: Export failures trigger `alert()` in the home page handler. Empty export guarded with early return and user alert.
