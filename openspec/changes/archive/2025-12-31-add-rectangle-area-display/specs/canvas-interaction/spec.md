# Canvas Interaction Spec Delta

## ADDED Requirements

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
