# Drawing Persistence Specification

## ADDED Requirements

### Requirement: Save Drawing API
The system SHALL provide an API endpoint to save a canvas drawing with a user-specified name to Cloudflare KV storage.

#### Scenario: Successfully save new drawing
- **WHEN** user sends POST `/api/v1/drawings` with valid name and shapes
- **THEN** drawing is stored in KV with key `drawing:<name>`
- **AND** response includes the saved drawing metadata with timestamps
- **AND** response status is 201 Created

#### Scenario: Reject duplicate drawing name
- **WHEN** user sends POST `/api/v1/drawings` with a name that already exists
- **THEN** response status is 409 Conflict
- **AND** response includes error message indicating duplicate name

#### Scenario: Reject empty drawing name
- **WHEN** user sends POST `/api/v1/drawings` with empty or whitespace-only name
- **THEN** response status is 400 Bad Request
- **AND** response includes validation error message

---

### Requirement: List Drawings API
The system SHALL provide an API endpoint to list saved drawings with pagination support (10 items per page).

#### Scenario: List first page of drawings
- **WHEN** user sends GET `/api/v1/drawings` without cursor
- **THEN** response includes up to 10 drawings sorted by creation date (newest first)
- **AND** response includes `nextCursor` if more drawings exist
- **AND** response includes `hasMore` boolean indicator

#### Scenario: List subsequent page of drawings
- **WHEN** user sends GET `/api/v1/drawings?cursor=<cursor>`
- **THEN** response includes next 10 drawings after the cursor position
- **AND** response includes new `nextCursor` if more drawings exist

#### Scenario: Empty drawings list
- **WHEN** user sends GET `/api/v1/drawings` with no saved drawings
- **THEN** response includes empty `drawings` array
- **AND** response includes `hasMore` as false
- **AND** response includes `nextCursor` as null

---

### Requirement: Load Drawing API
The system SHALL provide an API endpoint to retrieve a specific saved drawing by name.

#### Scenario: Load existing drawing
- **WHEN** user sends GET `/api/v1/drawings/:name` with valid name
- **THEN** response includes full drawing data with shapes array
- **AND** response status is 200 OK

#### Scenario: Load non-existent drawing
- **WHEN** user sends GET `/api/v1/drawings/:name` with unknown name
- **THEN** response status is 404 Not Found
- **AND** response includes error message

---

### Requirement: Delete Drawing API
The system SHALL provide an API endpoint to delete a saved drawing by name.

#### Scenario: Delete existing drawing
- **WHEN** user sends DELETE `/api/v1/drawings/:name` with valid name
- **THEN** drawing is removed from KV storage
- **AND** response status is 204 No Content

#### Scenario: Delete non-existent drawing
- **WHEN** user sends DELETE `/api/v1/drawings/:name` with unknown name
- **THEN** response status is 404 Not Found
- **AND** response includes error message

---

### Requirement: Save Drawing UI
The system SHALL provide a UI form to save the current canvas drawing with a user-specified name, positioned next to the toolbar buttons.

#### Scenario: Display save form
- **WHEN** user views the canvas page
- **THEN** a text input field for drawing name is displayed at the top of the canvas area
- **AND** a Save button is displayed next to the input field
- **AND** the input and button are positioned alongside existing toolbar buttons

#### Scenario: Save drawing via form submission
- **WHEN** user enters a name and clicks Save button
- **THEN** save button shows loading state
- **AND** current canvas shapes are sent to save API
- **AND** on success, input is cleared and list refreshes

#### Scenario: Display save error inline
- **WHEN** save API returns an error (e.g., duplicate name)
- **THEN** error message is displayed near the input field
- **AND** error message clearly describes the issue

---

### Requirement: Saved Drawings List UI
The system SHALL display a list of saved drawings on the same page as the canvas with pagination (10 items per page).

#### Scenario: Display saved drawings list
- **WHEN** user views the canvas page
- **THEN** a list of saved drawings is displayed in the sidebar area
- **AND** each item shows the drawing name and creation date
- **AND** each item has a delete button

#### Scenario: Paginate through drawings
- **WHEN** more than 10 drawings exist
- **THEN** pagination controls are displayed
- **AND** user can navigate to next/previous pages

#### Scenario: Display empty state
- **WHEN** no drawings are saved
- **THEN** an empty state message is displayed in the list area

---

### Requirement: Load Drawing from List
The system SHALL allow users to load a saved drawing by clicking on a list item.

#### Scenario: Load drawing on click
- **WHEN** user clicks on a drawing item in the list
- **THEN** the drawing is fetched from the API
- **AND** canvas is updated to display the loaded shapes
- **AND** current unsaved changes are replaced

---

### Requirement: Delete Drawing from List
The system SHALL allow users to delete a saved drawing by clicking the delete button on a list item.

#### Scenario: Delete drawing on button click
- **WHEN** user clicks the delete button on a list item
- **THEN** delete API is called for that drawing
- **AND** drawing is removed from the list on success

---

### Requirement: List Error Handling
The system SHALL display error messages and a retry button when the drawings list fails to load.

#### Scenario: Display list loading error
- **WHEN** list API request fails
- **THEN** an error message is displayed in the list area
- **AND** a retry button is displayed

#### Scenario: Retry loading list
- **WHEN** user clicks the retry button
- **THEN** list API request is retried
- **AND** on success, drawings list is displayed

---

### Requirement: Separate Error States
The system SHALL maintain separate error states for save and list operations, allowing continued use of working features when one fails.

#### Scenario: Save error does not affect list
- **WHEN** save API fails
- **THEN** list continues to display and function normally
- **AND** save error is shown only near the save form

#### Scenario: List error does not affect save
- **WHEN** list API fails
- **THEN** save functionality continues to work normally
- **AND** list error is shown only in the list area
