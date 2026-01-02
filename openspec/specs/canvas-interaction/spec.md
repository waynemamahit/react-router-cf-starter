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

### Requirement: Drawing Save Functionality
The canvas SHALL provide functionality to save the current drawing state with a user-specified name.

#### Scenario: Save button available
- **WHEN** user is on the canvas page
- **THEN** a save button or control is visible and accessible
- **AND** the control allows the user to specify a name for the drawing

#### Scenario: Save drawing with name
- **WHEN** user enters a drawing name and triggers save
- **THEN** the current canvas state (all points and rectangles) is saved to the server
- **AND** the drawing is assigned a unique identifier
- **AND** the save timestamp is recorded
- **AND** the user receives confirmation of successful save

#### Scenario: Save empty canvas
- **WHEN** user attempts to save a canvas with no shapes
- **THEN** the save operation is allowed
- **AND** an empty drawing is saved with the specified name

#### Scenario: Save updates drawings list
- **WHEN** a drawing is successfully saved
- **THEN** the saved drawings list is refreshed to include the new drawing
- **AND** the new drawing appears in the list with its name and timestamp

### Requirement: Saved Drawings List Display
The canvas SHALL display a list of all saved drawings with their metadata.

#### Scenario: Display saved drawings list
- **WHEN** user is on the canvas page
- **THEN** a list of all saved drawings is visible
- **AND** each list item shows the drawing name
- **AND** each list item shows the creation timestamp
- **AND** the list is sorted by creation date (newest first)

#### Scenario: Empty drawings list
- **WHEN** no drawings have been saved
- **THEN** an appropriate message is displayed indicating no saved drawings exist
- **AND** the save functionality remains available

#### Scenario: List updates after save
- **WHEN** a new drawing is saved
- **THEN** the drawings list automatically updates to include the new item
- **AND** the new item appears at the top of the list

### Requirement: Drawing Load Functionality
The canvas SHALL allow users to load a previously saved drawing by clicking on it in the list.

#### Scenario: Click to load drawing
- **WHEN** user clicks on a saved drawing in the list
- **THEN** the drawing data is fetched from the server
- **AND** the canvas state is replaced with the loaded drawing's points and rectangles
- **AND** all previously displayed shapes are removed
- **AND** the loaded shapes are rendered on the canvas

#### Scenario: Load preserves shape properties
- **WHEN** a drawing is loaded
- **THEN** all points are restored with their exact x and y coordinates
- **AND** all rectangles are restored with their exact position and dimensions
- **AND** shapes maintain their visual appearance and behavior

#### Scenario: Load drawing with no shapes
- **WHEN** user loads an empty drawing (no points or rectangles)
- **THEN** the canvas is cleared of all shapes
- **AND** the canvas displays the empty state message

### Requirement: Backend API for Drawings List
The system SHALL provide a REST API endpoint to retrieve all saved drawings metadata.

#### Scenario: GET drawings list
- **WHEN** a GET request is made to `/api/v1/drawings`
- **THEN** the API returns HTTP 200 status
- **AND** the response body contains a JSON array of drawing summaries
- **AND** each summary includes id, name, and createdAt fields
- **AND** the list is ordered by creation date descending

#### Scenario: Empty drawings collection
- **WHEN** a GET request is made to `/api/v1/drawings` and no drawings exist
- **THEN** the API returns HTTP 200 status
- **AND** the response body contains an empty JSON array

### Requirement: Backend API for Drawing Creation
The system SHALL provide a REST API endpoint to create and save new drawings.

#### Scenario: POST new drawing
- **WHEN** a POST request is made to `/api/v1/drawings` with valid drawing data
- **THEN** the API returns HTTP 201 status
- **AND** a unique identifier is assigned to the drawing
- **AND** the drawing is saved to persistent storage on the server
- **AND** the response body contains the complete saved drawing including the assigned id

#### Scenario: Save drawing data format
- **WHEN** a drawing is saved via the API
- **THEN** the saved data contains the drawing name
- **AND** the data contains the creation timestamp in ISO 8601 format
- **AND** the data contains the complete array of points with id, x, and y coordinates
- **AND** the data contains the complete array of rectangles with id, startX, startY, width, and height

#### Scenario: Invalid drawing data
- **WHEN** a POST request is made with missing or invalid required fields
- **THEN** the API returns HTTP 400 status
- **AND** the response includes an error message describing the validation failure

### Requirement: Backend API for Drawing Retrieval
The system SHALL provide a REST API endpoint to retrieve a specific saved drawing by its identifier.

#### Scenario: GET specific drawing
- **WHEN** a GET request is made to `/api/v1/drawings/:id` with a valid drawing ID
- **THEN** the API returns HTTP 200 status
- **AND** the response body contains the complete drawing data
- **AND** the response includes all points and rectangles from the saved drawing

#### Scenario: Drawing not found
- **WHEN** a GET request is made to `/api/v1/drawings/:id` with a non-existent ID
- **THEN** the API returns HTTP 404 status
- **AND** the response includes an error message indicating the drawing was not found

#### Scenario: Invalid drawing ID format
- **WHEN** a GET request is made with an invalid ID format
- **THEN** the API returns HTTP 400 status
- **AND** the response includes an error message about the invalid ID

### Requirement: Drawing Storage with Cloudflare KV
The system SHALL persist drawings using Cloudflare KV storage for serverless compatibility.

#### Scenario: KV storage keys
- **WHEN** a drawing is saved
- **THEN** the drawing data is stored in KV with a key based on the unique ID
- **AND** the key uses the format `drawing:{uuid}`
- **AND** an index of all drawing IDs is maintained in KV under the key `drawings:index`

#### Scenario: KV data structure
- **WHEN** a drawing is stored in KV
- **THEN** the value contains valid JSON matching the SavedDrawing interface
- **AND** the JSON includes id, name, createdAt, points, and rectangles fields

#### Scenario: KV read on load
- **WHEN** a drawing is requested by ID
- **THEN** the corresponding value is read from KV storage
- **AND** the JSON is parsed and validated before returning
- **AND** KV read errors are handled gracefully with appropriate error responses

### Requirement: Drawing Data Validation
The system SHALL validate drawing data on both save and load operations.

#### Scenario: Validate drawing name
- **WHEN** saving a drawing
- **THEN** the drawing name is required and must not be empty
- **AND** the name must be a string
- **AND** excessively long names are rejected (max 200 characters)

#### Scenario: Validate points array
- **WHEN** saving or loading drawing data
- **THEN** points must be an array
- **AND** each point must have numeric id, x, and y properties
- **AND** coordinate values must be finite numbers

#### Scenario: Validate rectangles array
- **WHEN** saving or loading drawing data
- **THEN** rectangles must be an array
- **AND** each rectangle must have numeric id, startX, startY, width, and height properties
- **AND** all dimension values must be finite numbers
