# Canvas Interaction Specification

## Requirements

### Requirement: Canvas Route
The application SHALL provide a `/canvas` route that displays an interactive canvas page.

#### Scenario: Navigate to canvas page
- **WHEN** user navigates to `/canvas` URL
- **THEN** the canvas page is displayed
- **AND** the page contains a clickable canvas area

### Requirement: Visual Point Markers
The canvas page SHALL display visual point markers at each location where the user clicks.

#### Scenario: Click creates point marker
- **WHEN** user clicks anywhere on the canvas
- **THEN** a visual point marker is rendered at the click location
- **AND** the point marker is visible and distinguishable

#### Scenario: Multiple points are displayed
- **WHEN** user clicks multiple times on different locations
- **THEN** all point markers remain visible on the canvas
- **AND** each point marker shows its own location

### Requirement: Coordinate Labels
The canvas page SHALL display coordinate labels showing the x and y position for each point marker.

#### Scenario: Point shows coordinate label
- **WHEN** a point marker is created
- **THEN** a coordinate label is displayed near the point
- **AND** the label shows the x and y coordinates relative to the canvas element
- **AND** the coordinates are formatted as "X: {x}, Y: {y}"

#### Scenario: Multiple labels are visible
- **WHEN** multiple point markers exist
- **THEN** each point marker has its own coordinate label
- **AND** all labels remain visible and readable

### Requirement: Visual Canvas Area
The canvas page SHALL provide a clearly defined visual area for user interaction.

#### Scenario: Canvas is visually distinct
- **WHEN** the canvas page loads
- **THEN** a canvas element is rendered with visible boundaries
- **AND** the canvas area is large enough for meaningful interaction (minimum 400x400 pixels)

### Requirement: Rectangle Drawing
The canvas SHALL allow users to draw rectangles by clicking and dragging on the canvas area.

#### Scenario: Start rectangle drawing
- **WHEN** user clicks and holds the mouse button on the canvas
- **THEN** a rectangle drawing session begins
- **AND** the starting point is captured

#### Scenario: Draw rectangle with drag
- **WHEN** user drags the mouse while holding the button down
- **THEN** a rectangle preview is displayed in real-time
- **AND** the rectangle stretches from the starting point to the current mouse position
- **AND** dimension labels show the width and height of the rectangle

#### Scenario: Complete rectangle drawing
- **WHEN** user releases the mouse button
- **THEN** the rectangle is finalized and added to the canvas
- **AND** the rectangle remains visible with its dimensions

### Requirement: Square Drawing with Shift Modifier
The canvas SHALL allow users to draw perfect squares by holding the Shift key while dragging.

#### Scenario: Draw square with Shift key
- **WHEN** user holds the Shift key while clicking and dragging
- **THEN** the shape is constrained to a square (equal width and height)
- **AND** dimension labels show the size of the square
- **AND** the square maintains 1:1 aspect ratio regardless of drag direction

#### Scenario: Release Shift during drag
- **WHEN** user releases the Shift key while dragging
- **THEN** the shape transitions from square to rectangle mode
- **AND** the shape adjusts to the current mouse position without constraint

#### Scenario: Press Shift during drag
- **WHEN** user presses the Shift key while already dragging
- **THEN** the shape transitions from rectangle to square mode
- **AND** the shape adjusts to maintain 1:1 aspect ratio

### Requirement: Shape Dimension Display
The canvas SHALL display dimension information for drawn rectangles and squares.

#### Scenario: Show dimensions during drawing
- **WHEN** user is actively drawing a rectangle or square
- **THEN** dimension labels display the current width and height
- **AND** labels are formatted as "W: {width}, H: {height}"
- **AND** labels are positioned visibly near the shape being drawn

#### Scenario: Show dimensions for completed shapes
- **WHEN** a rectangle or square drawing is completed
- **THEN** dimension labels remain visible on the completed shape
- **AND** dimensions reflect the final width and height in pixels

### Requirement: Mixed Interaction Modes
The canvas SHALL support both point markers and shape drawing without mode switching.

#### Scenario: Simple click creates point
- **WHEN** user clicks without dragging
- **THEN** a point marker is created at the click location
- **AND** existing point marker functionality is preserved

#### Scenario: Click and drag creates shape
- **WHEN** user clicks and drags beyond a minimal threshold
- **THEN** a rectangle or square is created instead of a point
- **AND** no point marker is created for drag interactions

### Requirement: Shape Selection
The canvas SHALL allow users to select rectangles and squares for manipulation.

#### Scenario: Click shape to select
- **WHEN** user clicks on an existing rectangle or square
- **THEN** the shape is selected for manipulation
- **AND** visual feedback indicates the selected state (e.g., highlighted border or selection indicator)

#### Scenario: Deselect shape
- **WHEN** user clicks on the canvas background or another shape
- **THEN** the previously selected shape is deselected
- **AND** the selection visual feedback is removed

### Requirement: Shape Dragging
The canvas SHALL allow users to drag selected rectangles and squares to reposition them.

#### Scenario: Drag shape to new position
- **WHEN** user clicks and drags a selected shape
- **THEN** the shape follows the mouse cursor in real-time
- **AND** the shape's position updates as the mouse moves
- **AND** dimension labels move with the shape

#### Scenario: Complete drag operation
- **WHEN** user releases the mouse button while dragging
- **THEN** the shape is placed at the new position
- **AND** the shape remains in its new location
- **AND** dimension labels update to reflect the new position

#### Scenario: Drag updates dimensions in real-time
- **WHEN** user is actively dragging a shape
- **THEN** dimension labels remain visible and attached to the shape
- **AND** coordinate information updates continuously during the drag

### Requirement: Shape Corner Resizing
The canvas SHALL allow users to resize rectangles and squares by dragging corner handles.

#### Scenario: Display resize handles on selected shape
- **WHEN** a shape is selected
- **THEN** resize handles appear at all four corners of the shape
- **AND** handles are visually distinguishable and interactive

#### Scenario: Resize shape from corner
- **WHEN** user clicks and drags a corner resize handle
- **THEN** the shape resizes dynamically based on the mouse position
- **AND** the opposite corner remains anchored as the resize pivot point
- **AND** dimension labels update in real-time to show current width and height

#### Scenario: Complete resize operation
- **WHEN** user releases the mouse button while resizing
- **THEN** the shape maintains its new dimensions
- **AND** dimension labels reflect the final width and height
- **AND** resize handles remain visible on the selected shape

#### Scenario: Resize square with Shift maintains aspect ratio
- **WHEN** user holds the Shift key while resizing a square
- **THEN** the shape maintains its 1:1 aspect ratio during resize
- **AND** dimension labels show equal width and height values

#### Scenario: Resize rectangle with Shift creates square
- **WHEN** user holds the Shift key while resizing a rectangle
- **THEN** the shape is constrained to a square (equal width and height)
- **AND** dimension labels show equal width and height values

### Requirement: Rectangle Area Display
The canvas SHALL display the calculated area for all rectangles and squares in addition to their dimensions.

#### Scenario: Show area during drawing
- **WHEN** user is actively drawing a rectangle or square
- **THEN** the dimension label displays the calculated area
- **AND** area is calculated as width multiplied by height
- **AND** area is formatted as "Area: {area}" in pixels squared
- **AND** area appears alongside the existing width and height information

#### Scenario: Show area for completed shapes
- **WHEN** a rectangle or square drawing is completed
- **THEN** the dimension label displays the calculated area
- **AND** area reflects the final dimensions of the shape
- **AND** area remains visible with other dimension information

#### Scenario: Update area during resize
- **WHEN** user resizes a selected rectangle or square
- **THEN** the area value updates in real-time
- **AND** area calculation reflects the current dimensions during the resize operation
- **AND** area displays the final value when resize is complete

### Requirement: Real-time Dimension Label Updates
The canvas SHALL update dimension labels automatically during all shape manipulation operations.

#### Scenario: Dimensions update during drag
- **WHEN** user is dragging a shape
- **THEN** dimension labels remain visible and positioned relative to the shape
- **AND** labels show current width and height without delay

#### Scenario: Dimensions update during resize
- **WHEN** user is resizing a shape from a corner
- **THEN** dimension labels update in real-time to reflect current dimensions
- **AND** labels are formatted as "W: {width}, H: {height}"
- **AND** dimensions are displayed in pixels
