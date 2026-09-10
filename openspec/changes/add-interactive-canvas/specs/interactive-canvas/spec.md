## ADDED Requirements

### Requirement: Canvas display
The system SHALL render a full-screen interactive canvas on the home page using the HTML Canvas 2D API with a light grid background (20px grid lines, `#e5e7eb` on `#f9fafb`). The shape model uses two types: `CanvasPoint` (points with x, y) and `CanvasRect` (rectangles/squares distinguished by an `isSquare` boolean flag). The canvas SHALL use `devicePixelRatio` scaling for crisp rendering on retina displays.

#### Scenario: Canvas is visible on page load
- **WHEN** user navigates to the home page
- **THEN** the interactive canvas SHALL be displayed as the main content, filling the available viewport space

### Requirement: Point creation
The system SHALL create a point at the click location when the user clicks on an empty area of the canvas. Points are created when a mouse drag covers less than 3px in both axes (distinguishing click from drag).

#### Scenario: Click on empty canvas creates point
- **WHEN** user clicks on an empty area of the canvas (drag < 3px)
- **THEN** a point SHALL be created at the click coordinates
- **THEN** the point SHALL NOT be automatically selected
- **THEN** the statistics count SHALL increment

### Requirement: Point hover labels
The system SHALL show coordinate labels on hover over created points.

#### Scenario: Hover over point shows coordinates
- **WHEN** user hovers over a created point
- **THEN** a label SHALL display the point's (x, y) coordinates near the cursor with a dark semi-transparent background

### Requirement: Rectangle creation
The system SHALL create a rectangle when the user clicks and drags on an empty area of the canvas. A dashed preview rectangle SHALL be shown during the drag.

#### Scenario: Click+drag creates rectangle
- **WHEN** user clicks and drags on an empty area of the canvas (drag >= 3px in either axis)
- **THEN** a rectangle SHALL be drawn from the start point to the current cursor position
- **THEN** while dragging, the rectangle SHALL display live dimension (width x height) and area labels
- **THEN** on mouse release, the rectangle SHALL be finalized at the current position

### Requirement: Square creation with Shift
The system SHALL create a perfect square when the user holds Shift while click+dragging on the canvas. Shift can be pressed or released mid-drag to toggle square constraint dynamically.

#### Scenario: Click+drag+Shift creates square
- **WHEN** user holds Shift while clicking and dragging on the canvas
- **THEN** a square SHALL be drawn constrained to equal width and height
- **THEN** the square SHALL display live dimension and area labels during creation

#### Scenario: Press Shift mid-drag to create square
- **WHEN** user starts dragging a rectangle and then presses Shift before releasing the mouse
- **THEN** the rectangle SHALL become constrained to a square for the remaining drag

### Requirement: Shape resizing
The system SHALL allow resizing of rectangles and squares by dragging their corner handles (nw, ne, sw, se). Corner handles are 8px squares rendered at each corner of the selected shape.

#### Scenario: Drag corner to resize
- **WHEN** user clicks and drags a corner handle of a selected rectangle or square
- **THEN** the shape SHALL resize from the opposite corner (opposite corner stays fixed)
- **THEN** live dimension (width x height) and area labels SHALL display during resize
- **THEN** on mouse release, the shape SHALL be finalized at the new size

#### Scenario: Resize with negative dimensions
- **WHEN** user drags a corner handle past the opposite edge
- **THEN** the shape SHALL flip its position and dimensions to maintain positive width/height

#### Scenario: Resize with Shift constraint
- **WHEN** user holds Shift while resizing a shape
- **THEN** the shape SHALL be constrained to equal width and height (square)

#### Scenario: Auto-detect square on resize
- **WHEN** user resizes a rectangle to equal width and height (even without Shift)
- **THEN** it SHALL be automatically counted as a square in statistics

#### Scenario: Auto-detect rectangle on resize
- **WHEN** user resizes a square to unequal width and height
- **THEN** it SHALL be automatically counted as a rectangle in statistics

### Requirement: Shape moving
The system SHALL allow moving of rectangles and squares by clicking and dragging the body of the shape (not corner handles). During drag, the shape follows the cursor with live visual feedback.

#### Scenario: Drag shape body to move
- **WHEN** user clicks and drags the body (not corners) of a selected rectangle or square
- **THEN** the shape SHALL follow the cursor
- **THEN** on mouse release, the shape SHALL be dropped at the new position

### Requirement: Shape selection
The system SHALL allow selecting points, rectangles, and squares by clicking on them. Only one shape can be selected at a time.

#### Scenario: Click to select a shape
- **WHEN** user clicks on a point, rectangle, or square
- **THEN** the shape SHALL be visually highlighted with a dashed orange border
- **THEN** clicking on a different shape SHALL deselect the previous and select the new one
- **THEN** clicking on empty canvas SHALL deselect all

#### Scenario: Hit testing priority
- **WHEN** multiple shapes overlap at the click position
- **THEN** the topmost shape (points always above rects, later-created rects above earlier) SHALL be selected

### Requirement: Shape deletion
The system SHALL delete selected shapes when the user presses the Delete key or clicks the delete button.

#### Scenario: Delete key removes selected shape
- **WHEN** a shape is selected and user presses the Delete key (or Backspace)
- **THEN** the selected shape SHALL be removed from the canvas
- **THEN** the statistics SHALL update accordingly

#### Scenario: Delete button removes selected shape
- **WHEN** a shape is selected and user clicks the delete button
- **THEN** the selected shape SHALL be removed from the canvas
- **THEN** the statistics SHALL update accordingly

### Requirement: Undo/Redo
The system SHALL support undo and redo of all canvas actions (create, delete, move, resize, reset) via a history stack capped at 50 entries. Selection changes are NOT undoable.

#### Scenario: Undo last action
- **WHEN** user clicks undo button or presses Ctrl+Z (Cmd+Z on Mac)
- **THEN** the last action SHALL be reverted
- **THEN** the canvas SHALL display the previous state

#### Scenario: Redo undone action
- **WHEN** user has undone an action and clicks redo button or presses Ctrl+Shift+Z (Cmd+Shift+Z on Mac)
- **THEN** the undone action SHALL be reapplied
- **THEN** the canvas SHALL display the state after the redone action

#### Scenario: Undo/redo buttons reflect state
- **WHEN** no actions are in the undo history
- **THEN** the undo button SHALL be disabled
- **WHEN** no actions are in the redo history
- **THEN** the redo button SHALL be disabled

### Requirement: Export to image
The system SHALL export the canvas drawing to PNG, JPG, and SVG formats. PNG and JPG use an offscreen canvas with `toDataURL()`. SVG is generated by serializing shapes to SVG markup. Export output includes only the raw shapes — no grid, selection highlights, hover labels, corner handles, or interaction UI.

#### Scenario: Export to PNG
- **WHEN** user clicks export button and selects PNG
- **THEN** the canvas SHALL be downloaded as a PNG image file (`image/png`)

#### Scenario: Export to JPG
- **WHEN** user clicks export button and selects JPG
- **THEN** the canvas SHALL be downloaded as a JPG image file (`image/jpeg`)

#### Scenario: Export to SVG
- **WHEN** user clicks export button and selects SVG
- **THEN** the canvas SHALL be downloaded as an SVG image file

#### Scenario: Export hides selection details
- **WHEN** user exports the canvas to any format
- **THEN** the exported image SHALL NOT show selection highlights, hover labels, corner handles, or any interaction UI

#### Scenario: Export with no shapes
- **WHEN** user clicks export and no shapes exist on the canvas
- **THEN** the system SHALL NOT download an empty file
- **THEN** the user SHALL be informed that there is nothing to export

### Requirement: User guide
The system SHALL display a user guide modal explaining how to use the canvas.

#### Scenario: View user guide
- **WHEN** user clicks the help/guide button
- **THEN** a modal SHALL display instructions for creating shapes, selecting, modifying, undo/redo, export, and persistence
- **THEN** clicking the close button or outside the modal SHALL dismiss it

### Requirement: Count statistics
The system SHALL display live count statistics for points, rectangles, and squares. Rectangles and squares are counted separately (squares are rects where `isSquare === true`).

#### Scenario: Statistics update on shape change
- **WHEN** a shape is created, deleted, or a rectangle is resized to/from a square
- **THEN** the statistics display SHALL update to reflect the current counts

### Requirement: Reset canvas
The system SHALL allow the user to reset/clear the entire canvas.

#### Scenario: Reset canvas clears all shapes
- **WHEN** user clicks the reset button
- **THEN** all shapes SHALL be removed
- **THEN** statistics SHALL reset to zero
- **THEN** the reset action SHALL be undoable

### Requirement: Cursor visibility
The system SHALL ensure the mouse cursor is visible with high contrast against the canvas background. The cursor SHALL adapt to the current interaction mode.

#### Scenario: Cursor adapts to interaction mode
- **WHEN** user moves the cursor over empty canvas
- **THEN** the cursor SHALL be a crosshair
- **WHEN** user hovers over a movable shape
- **THEN** the cursor SHALL change to grab
- **WHEN** user drags a shape
- **THEN** the cursor SHALL change to grabbing
- **WHEN** user hovers over a corner handle of a selected shape
- **THEN** the cursor SHALL change to the appropriate resize cursor (nw-resize, ne-resize, sw-resize, se-resize)

### Requirement: Z-ordering
The system SHALL maintain proper z-ordering: points on top of all shapes, rectangles and squares ordered by creation time.

#### Scenario: Points render above shapes
- **WHEN** points and rectangles/squares overlap on the canvas
- **THEN** points SHALL always render on top for clickability

### Requirement: Buttons outside canvas
The system SHALL place delete, export, reset, undo, and redo buttons outside the canvas area in a toolbar strip.

#### Scenario: Toolbar is separate from canvas
- **WHEN** user views the page
- **THEN** the toolbar buttons SHALL be positioned outside the canvas boundary

### Requirement: Error boundary
The system SHALL wrap the canvas component in a React ErrorBoundary to catch and display rendering errors gracefully.

#### Scenario: Canvas error shows fallback
- **WHEN** the canvas component throws a rendering error
- **THEN** a fallback UI SHALL be displayed with the error message and a "Try again" button

### Requirement: Responsive layout
The system SHALL use a full-height flex layout that adapts to different screen sizes.

#### Scenario: Full viewport layout
- **WHEN** user views the page at any screen size
- **THEN** the layout SHALL fill the viewport with header at top, toolbar below header, canvas filling remaining space, and stats at bottom
