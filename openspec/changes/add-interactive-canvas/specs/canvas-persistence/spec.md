## ADDED Requirements

### Requirement: Auto-save to localStorage
The system SHALL automatically save the canvas state (past, present, future) to localStorage after each change, throttled to 500ms intervals.

#### Scenario: Save on every action
- **WHEN** user creates, deletes, moves, resizes, or resets any shape
- **THEN** the full history (past, present, future) SHALL be saved to localStorage
- **THEN** saves SHALL be throttled to at most once every 500ms

### Requirement: Backup fallback
The system SHALL maintain a backup copy of the canvas state in a separate localStorage key to recover from corruption.

#### Scenario: Backup created on large state
- **WHEN** the serialized canvas state exceeds 4MB
- **THEN** the current state SHALL be saved to a backup key before overwriting the primary key

#### Scenario: Restore from backup on corruption
- **WHEN** the primary localStorage key contains invalid or corrupted data
- **THEN** the system SHALL attempt to load from the backup key
- **THEN** if the backup is also invalid, the canvas SHALL start empty

### Requirement: Auto-restore on page load
The system SHALL restore the last canvas state from localStorage when the user reopens the page. Restore uses a `useEffect` to dispatch a `RESTORE` action with the full past/present/future, ensuring SSR safety.

#### Scenario: Restore canvas on revisit
- **WHEN** user reopens the page after previously making changes
- **THEN** the canvas SHALL display the last saved state
- **THEN** undo/redo history SHALL also be restored

#### Scenario: SSR-safe hydration
- **WHEN** the page is server-side rendered
- **THEN** localStorage SHALL NOT be read during render
- **THEN** restore SHALL happen only in a client-side `useEffect`
- **THEN** persistence saving SHALL be disabled until hydration completes

#### Scenario: Empty state on first visit
- **WHEN** user visits the page for the first time (no saved state in localStorage)
- **THEN** the canvas SHALL display as empty

### Requirement: Data validation
The system SHALL validate persisted data before restoring. Each shape must have `id` (string), `type` ("point" or "rect"), `x` (number), and `y` (number). The full history arrays (past, future) must each contain only valid states.

#### Scenario: Invalid state rejected
- **WHEN** persisted data contains shapes missing required fields
- **THEN** the system SHALL reject the corrupted data and start with an empty canvas

#### Scenario: Invalid history rejected
- **WHEN** any state in the persisted past or future array is invalid
- **THEN** the entire history SHALL be rejected and the canvas SHALL start empty

### Requirement: Clear on reset
The system SHALL clear all localStorage keys (primary, backup, history) when the user resets the canvas.

#### Scenario: Reset clears localStorage
- **WHEN** user clicks the reset button
- **THEN** all persisted canvas data SHALL be removed from localStorage
