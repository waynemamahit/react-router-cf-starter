## ADDED Requirements

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
