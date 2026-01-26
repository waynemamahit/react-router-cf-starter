# Interactive Canvas Specification

## ADDED Requirements

### Requirement: Canvas Display
The system SHALL display an interactive canvas on the home page that allows users to create and manipulate geometric shapes.

#### Scenario: Canvas visibility on home page
- **WHEN** user navigates to the home page
- **THEN** an interactive canvas is displayed as the main content area
- **AND** toolbar controls are visible outside the canvas
- **AND** user guide is visible outside the canvas
- **AND** statistics display is visible outside the canvas

---

### Requirement: Point Creation
The system SHALL allow users to create points by clicking on empty areas of the canvas.

#### Scenario: Create point on click
- **WHEN** user clicks on an empty area of the canvas
- **THEN** a point is created at the click coordinates
- **AND** the point is NOT automatically selected after creation
- **AND** the point is added to the canvas state

#### Scenario: Point coordinate label on hover
- **WHEN** user hovers over a created point
- **THEN** a label displaying the point coordinates (x, y) is shown

---

### Requirement: Rectangle Creation
The system SHALL allow users to create rectangles by clicking and dragging on the canvas.

#### Scenario: Create rectangle on click+drag
- **WHEN** user clicks and drags on the canvas
- **THEN** a rectangle is created with dimensions matching the drag area
- **AND** dimension and area labels are displayed during creation

#### Scenario: Rectangle dimension label on hover
- **WHEN** user hovers over a created rectangle
- **THEN** a label displaying the dimension (width × height) and area is shown

---

### Requirement: Square Creation
The system SHALL allow users to create squares by holding the Shift key while clicking and dragging on the canvas.

#### Scenario: Create square on click+drag+shift
- **WHEN** user clicks and drags on the canvas while holding Shift key
- **THEN** a square is created (equal width and height)
- **AND** dimension and area labels are displayed during creation

---

### Requirement: Shape Rendering Order
The system SHALL render shapes with z-index ordering based on creation time, with points always rendered on top of rectangles and squares.

#### Scenario: Point visibility over rectangles
- **WHEN** a point is created in an area covered by a rectangle
- **THEN** the point remains visible and selectable on top of the rectangle

#### Scenario: Rectangle z-index by creation order
- **WHEN** multiple rectangles overlap
- **THEN** rectangles created later appear on top of earlier ones

---

### Requirement: Shape Selection
The system SHALL allow users to select shapes by clicking on them.

#### Scenario: Select shape on click
- **WHEN** user clicks on an existing shape (point, rectangle, or square)
- **THEN** the shape becomes selected
- **AND** a visual selection indicator is displayed

#### Scenario: Deselect when clicking empty area
- **WHEN** user clicks on empty canvas area with a shape selected
- **THEN** a new point is created at click location
- **AND** the previously selected shape is deselected

---

### Requirement: Rectangle Movement
The system SHALL allow users to move selected rectangles and squares via drag and drop.

#### Scenario: Move rectangle via drag and drop
- **WHEN** user drags a selected rectangle or square
- **THEN** the shape moves to follow the cursor
- **AND** the shape's position is updated when dropped

---

### Requirement: Rectangle Resizing
The system SHALL allow users to resize rectangles and squares by dragging corner handles.

#### Scenario: Resize from corner handles
- **WHEN** user clicks and drags a corner of a selected rectangle or square
- **THEN** the shape resizes in the direction of the drag
- **AND** dimension and area labels are displayed during resize

#### Scenario: Resize in all directions
- **WHEN** user drags different corners of a rectangle
- **THEN** the shape can be resized in all four directions

#### Scenario: Rectangle transforms to square on equal resize
- **WHEN** user resizes a rectangle to have equal width and height
- **THEN** the shape is treated as a square for statistics counting

#### Scenario: Square transforms to rectangle on unequal resize
- **WHEN** user resizes a square to have unequal width and height
- **THEN** the shape is treated as a rectangle for statistics counting

---

### Requirement: Shape Deletion
The system SHALL allow users to delete selected shapes using a button or the Delete key.

#### Scenario: Delete with Delete key
- **WHEN** user presses the Delete key with a shape selected
- **THEN** the selected shape is removed from the canvas

#### Scenario: Delete with button
- **WHEN** user clicks the Delete button with a shape selected
- **THEN** the selected shape is removed from the canvas

---

### Requirement: Undo Functionality
The system SHALL allow users to undo canvas actions using a button or keyboard shortcuts.

#### Scenario: Undo with button
- **WHEN** user clicks the Undo button
- **THEN** the last canvas action is reversed

#### Scenario: Undo with keyboard shortcut
- **WHEN** user presses Ctrl+Z (or Cmd+Z on Mac)
- **THEN** the last canvas action is reversed

#### Scenario: Undo reset action
- **WHEN** user performs a reset and then clicks Undo
- **THEN** all shapes are restored to their state before the reset

---

### Requirement: Redo Functionality
The system SHALL allow users to redo undone actions using a button or keyboard shortcuts.

#### Scenario: Redo with button
- **WHEN** user clicks the Redo button
- **THEN** the last undone action is reapplied

#### Scenario: Redo with keyboard shortcut
- **WHEN** user presses Ctrl+Y or Ctrl+Shift+Z (or Cmd+Shift+Z on Mac)
- **THEN** the last undone action is reapplied

---

### Requirement: Canvas Export
The system SHALL allow users to export the canvas drawing as an image in PNG, JPG, or SVG format.

#### Scenario: Export to PNG
- **WHEN** user clicks Export and selects PNG format
- **THEN** the canvas is downloaded as a PNG image file

#### Scenario: Export to JPG
- **WHEN** user clicks Export and selects JPG format
- **THEN** the canvas is downloaded as a JPG image file

#### Scenario: Export to SVG
- **WHEN** user clicks Export and selects SVG format
- **THEN** the canvas is downloaded as an SVG vector file

#### Scenario: Export excludes selection indicators
- **WHEN** user exports the canvas with shapes selected
- **THEN** the exported image does NOT include selection indicators or visual selection states

---

### Requirement: User Guide Display
The system SHALL display a user guide outside the canvas that explains how to use the interactive canvas.

#### Scenario: Guide visibility
- **WHEN** user views the canvas page
- **THEN** a user guide is displayed outside the canvas area
- **AND** the guide includes instructions for creating shapes
- **AND** the guide includes keyboard shortcuts reference

---

### Requirement: Statistics Display
The system SHALL display count statistics for created shapes outside the canvas.

#### Scenario: Point count display
- **WHEN** user creates points
- **THEN** the statistics display shows the total count of points

#### Scenario: Rectangle count display
- **WHEN** user creates rectangles (non-square)
- **THEN** the statistics display shows the count of rectangles

#### Scenario: Square count automatic detection
- **WHEN** user creates a square using Shift key
- **THEN** the statistics display counts it as a square

#### Scenario: Square count on resize
- **WHEN** user resizes a rectangle to have equal width and height
- **THEN** the statistics display counts it as a square (not rectangle)

---

### Requirement: Canvas Reset
The system SHALL allow users to reset/clear the entire canvas drawing.

#### Scenario: Reset via button
- **WHEN** user clicks the Reset button
- **THEN** all shapes are removed from the canvas

#### Scenario: Reset is undoable
- **WHEN** user clicks Undo after resetting
- **THEN** all shapes are restored to their state before the reset

---

### Requirement: State Persistence
The system SHALL automatically save the canvas state to local storage and restore it when the user reopens the page.

#### Scenario: Auto-save on change
- **WHEN** user creates, modifies, or deletes shapes
- **THEN** the canvas state is automatically saved to local storage

#### Scenario: Auto-load on page open
- **WHEN** user opens or refreshes the canvas page
- **THEN** the previous canvas state is automatically restored from local storage
