## ADDED Requirements

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
