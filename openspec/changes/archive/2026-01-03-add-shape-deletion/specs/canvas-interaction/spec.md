## ADDED Requirements

### Requirement: Shape Deletion via Keyboard
The canvas SHALL allow users to delete selected shapes using the Delete key.

#### Scenario: Delete selected point with Delete key
- **WHEN** user has a point selected and presses the Delete key
- **THEN** the selected point is removed from the canvas
- **AND** the shape selection is cleared
- **AND** the point is no longer visible or interactive

#### Scenario: Delete selected rectangle with Delete key
- **WHEN** user has a rectangle or square selected and presses the Delete key
- **THEN** the selected shape is removed from the canvas
- **AND** the shape selection is cleared
- **AND** the shape is no longer visible or interactive

#### Scenario: Delete key with no selection
- **WHEN** user presses Delete key with no shape selected
- **THEN** no action occurs
- **AND** the canvas state remains unchanged

### Requirement: Shape Deletion via UI Control
The canvas SHALL provide a visual delete button or control to remove selected shapes.

#### Scenario: Delete button visibility
- **WHEN** a shape (point or rectangle) is selected
- **THEN** a delete button or control is displayed near the selected shape or in a toolbar
- **AND** the button is clearly labeled and accessible

#### Scenario: Click delete button removes shape
- **WHEN** user clicks the delete button while a shape is selected
- **THEN** the selected shape is removed from the canvas
- **AND** the shape selection is cleared
- **AND** visual feedback confirms the deletion

### Requirement: Shape Deletion Feedback
The canvas SHALL provide user feedback when shapes are deleted.

#### Scenario: Deletion success message
- **WHEN** a shape is successfully deleted
- **THEN** a brief success message or indicator is displayed
- **AND** the message confirms which type of shape was deleted (point or rectangle)

#### Scenario: Update shape count after deletion
- **WHEN** a shape is deleted
- **THEN** the displayed count of points or rectangles is immediately updated
- **AND** the count accurately reflects the remaining shapes

### Requirement: Saved Drawing Deletion UI
The canvas SHALL provide delete controls for each saved drawing in the list.

#### Scenario: Delete button in drawings list
- **WHEN** saved drawings are displayed in the list
- **THEN** each drawing list item includes a delete button or icon
- **AND** the delete control is visually distinct and accessible

#### Scenario: Delete button hover state
- **WHEN** user hovers over a drawing's delete button
- **THEN** visual feedback indicates the button is interactive
- **AND** tooltip or label clarifies the delete action

### Requirement: Saved Drawing Deletion Confirmation
The canvas SHALL request user confirmation before permanently deleting a saved drawing.

#### Scenario: Click delete shows confirmation
- **WHEN** user clicks the delete button for a saved drawing
- **THEN** a confirmation dialog or prompt is displayed
- **AND** the prompt clearly states which drawing will be deleted
- **AND** the user can confirm or cancel the deletion

#### Scenario: Cancel deletion
- **WHEN** user cancels the deletion confirmation
- **THEN** the drawing is not deleted
- **AND** the drawing remains in the list
- **AND** the confirmation UI is dismissed

#### Scenario: Confirm deletion removes drawing
- **WHEN** user confirms the deletion
- **THEN** the drawing is removed from the saved drawings list
- **AND** the delete API request is sent to the server
- **AND** visual feedback confirms the deletion

### Requirement: Saved Drawing Deletion Feedback
The canvas SHALL provide feedback when saved drawings are deleted.

#### Scenario: Successful deletion message
- **WHEN** a saved drawing is successfully deleted
- **THEN** a success message is displayed
- **AND** the message confirms which drawing was deleted by name

#### Scenario: Failed deletion error message
- **WHEN** a drawing deletion fails due to server error
- **THEN** an error message is displayed
- **AND** the message indicates the deletion failed
- **AND** the drawing remains in the list

#### Scenario: List updates after deletion
- **WHEN** a drawing is successfully deleted
- **THEN** the saved drawings list is automatically refreshed
- **AND** the deleted drawing no longer appears in the list
- **AND** remaining drawings maintain their order

### Requirement: Backend API for Drawing Deletion
The system SHALL provide a REST API endpoint to delete saved drawings by identifier.

#### Scenario: DELETE drawing by ID
- **WHEN** a DELETE request is made to `/api/v1/drawings/:id` with a valid drawing ID
- **THEN** the API returns HTTP 204 status (No Content)
- **AND** the drawing is removed from KV storage
- **AND** the drawing ID is removed from the drawings index
- **AND** no response body is returned

#### Scenario: Delete non-existent drawing
- **WHEN** a DELETE request is made to `/api/v1/drawings/:id` with a non-existent ID
- **THEN** the API returns HTTP 404 status
- **AND** the response includes an error message indicating the drawing was not found
- **AND** no changes are made to storage

#### Scenario: Invalid ID format on delete
- **WHEN** a DELETE request is made with an invalid ID format
- **THEN** the API returns HTTP 400 status
- **AND** the response includes an error message about the invalid ID
- **AND** no deletion is attempted

#### Scenario: Delete updates storage index
- **WHEN** a drawing is successfully deleted via the API
- **THEN** the drawing key is removed from KV storage
- **AND** the drawings index is updated to exclude the deleted drawing ID
- **AND** subsequent GET requests to `/api/v1/drawings` do not include the deleted drawing
