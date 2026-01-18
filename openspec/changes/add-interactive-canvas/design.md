# Design: Interactive Canvas

## Context
This feature introduces an interactive 2D canvas that allows users to create and manipulate geometric shapes. The canvas will serve as the main landing page, replacing the current welcome component. The implementation must support persistent state, comprehensive undo/redo, and multiple export formats.

### Stakeholders
- End users who need a visual shape creation tool
- Developers maintaining the React application

### Constraints
- Must work with React 19 and React Router framework mode
- Must use TailwindCSS 4 for styling
- Must persist state in local storage (no server-side storage)
- Must support modern browsers with HTML5 Canvas API

## Goals / Non-Goals

### Goals
- Provide intuitive mouse-based shape creation (click for points, drag for rectangles)
- Enable precise shape manipulation (move, resize from corners)
- Maintain complete action history for undo/redo
- Support keyboard shortcuts for power users
- Export drawings in web-standard image formats
- Persist user work automatically across sessions

### Non-Goals
- Complex shape types beyond points, rectangles, and squares
- Collaborative editing or cloud sync
- Advanced drawing tools (curves, freehand, etc.)
- Mobile touch optimization (mouse-first design)

## Decisions

### Decision 1: Use HTML5 Canvas API with React State Management
- **What**: Render shapes using a `<canvas>` element managed by React state
- **Why**: Canvas API provides excellent performance for 2D graphics and is well-supported; React state ensures predictable updates
- **Alternatives considered**:
  - SVG-based rendering: More DOM overhead, harder to implement hit detection
  - WebGL: Overkill for simple 2D shapes

### Decision 2: Command Pattern for Undo/Redo
- **What**: Implement undo/redo using a command pattern with action history stack
- **Why**: Clean separation of actions, easy to add new action types, standard pattern for undo systems
- **Alternatives considered**:
  - Full state snapshots: Higher memory usage, simpler implementation
  - Event sourcing: More complex, better for persistence requirements we don't have

### Decision 3: Single Canvas Component with Composition
- **What**: One main `Canvas` component that composes smaller UI elements (Toolbar, Statistics, Guide)
- **Why**: Keeps canvas logic centralized while allowing modular UI
- **Alternatives considered**:
  - Multiple canvas layers: Unnecessary complexity for our use case

### Decision 4: Local Storage for Persistence
- **What**: Serialize canvas state to JSON and store in local storage
- **Why**: Project constraint specifies no server-side storage; local storage is simple and sufficient
- **Alternatives considered**:
  - IndexedDB: Overkill for our data size
  - Session storage: Doesn't persist across browser sessions

### Decision 5: Shape Rendering Order
- **What**: Z-index ordering based on creation time; points always rendered on top
- **Why**: Ensures predictable visual layering; points must remain accessible for selection regardless of rectangle placement
- **Alternatives considered**:
  - Explicit z-index per shape: More complex, unnecessary for requirements

## Architecture

### Component Hierarchy
```
HomePage (route: /)
├── CanvasContainer
│   ├── Canvas (main drawing area)
│   ├── Toolbar
│   │   ├── UndoButton
│   │   ├── RedoButton
│   │   ├── DeleteButton
│   │   ├── ResetButton
│   │   └── ExportMenu
│   ├── Statistics
│   └── UserGuide
```

### State Structure
```typescript
interface CanvasState {
  shapes: Shape[];          // All shapes (points, rectangles)
  selectedId: string | null; // Currently selected shape
  isDragging: boolean;       // Drag operation in progress
  isResizing: boolean;       // Resize operation in progress
  resizeCorner: Corner | null;
}

interface HistoryState {
  past: CanvasState[];      // Undo stack
  present: CanvasState;     // Current state
  future: CanvasState[];    // Redo stack
}
```

### Shape Types
```typescript
type Shape = Point | Rectangle;

interface Point {
  type: 'point';
  id: string;
  x: number;
  y: number;
  createdAt: number;
}

interface Rectangle {
  type: 'rectangle';
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  createdAt: number;
  isSquare: boolean; // Computed: width === height
}
```

## Risks / Trade-offs

### Risk 1: Canvas Performance with Many Shapes
- **Risk**: Rendering performance may degrade with hundreds of shapes
- **Mitigation**: Implement basic optimizations (dirty rectangles, shape culling) if needed; current requirements don't indicate high shape counts

### Risk 2: Export Quality Across Formats
- **Risk**: SVG export requires different rendering approach than PNG/JPG
- **Mitigation**: Use two export paths—canvas `toDataURL` for raster; manual SVG generation for vector

### Trade-off 1: Selection vs Click-to-Create
- **Trade-off**: Click action could mean "select shape" or "create point"
- **Resolution**: Click on empty space creates point; click on existing shape selects it

### Trade-off 2: Square Detection Precision
- **Trade-off**: Floating-point comparison for square detection
- **Resolution**: Use tolerance-based comparison (`Math.abs(width - height) < 0.5`)

## Implementation Notes

### Keyboard Shortcuts
| Action | Windows/Linux | Mac |
|--------|--------------|-----|
| Undo | Ctrl+Z | Cmd+Z |
| Redo | Ctrl+Y / Ctrl+Shift+Z | Cmd+Shift+Z |
| Delete | Delete / Backspace | Delete / Backspace |

### Export Specifications
- **PNG**: High-quality, transparent background option
- **JPG**: White background, 0.9 quality
- **SVG**: Vector format with inline styles

### Hit Detection
- Points: Circle hit area with 10px radius
- Rectangles: Bounding box + 8px corner zones for resize handles

## Open Questions
- None. All requirements are well-specified.
