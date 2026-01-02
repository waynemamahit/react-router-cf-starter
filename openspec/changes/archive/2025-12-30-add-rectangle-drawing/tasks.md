## 1. Type Definitions and State Management
- [x] 1.1 Add `Rectangle` interface with id, startX, startY, width, height properties
- [x] 1.2 Add state for `rectangles` array to store completed shapes
- [x] 1.3 Add state for `currentRectangle` to track shape being drawn
- [x] 1.4 Add state for `isShiftPressed` to track Shift key state

## 2. Mouse Event Handlers
- [x] 2.1 Implement `handleMouseDown` to initiate rectangle drawing
- [x] 2.2 Implement `handleMouseMove` to update rectangle preview during drag
- [x] 2.3 Implement `handleMouseUp` to finalize rectangle and distinguish from point clicks
- [x] 2.4 Add drag threshold detection to differentiate clicks from drags

## 3. Keyboard Event Handlers
- [x] 3.1 Implement `handleKeyDown` to detect Shift key press
- [x] 3.2 Implement `handleKeyUp` to detect Shift key release
- [x] 3.3 Add effect hooks to attach/detach keyboard listeners
- [x] 3.4 Update rectangle dimensions when Shift state changes during drag

## 4. Shape Constraint Logic
- [x] 4.1 Implement square constraint calculation when Shift is pressed
- [x] 4.2 Ensure square uses smaller of width/height to maintain aspect ratio
- [x] 4.3 Handle negative dimensions for drag in any direction

## 5. Visual Components
- [x] 5.1 Add rectangle rendering component with border and fill
- [x] 5.2 Add dimension label component for rectangles showing "W: {w}, H: {h}"
- [x] 5.3 Style current/preview rectangle differently from completed rectangles
- [x] 5.4 Ensure point markers remain visible and functional

## 6. Testing
- [x] 6.1 Write test for rectangle creation via click+drag
- [x] 6.2 Write test for square creation with Shift key
- [x] 6.3 Write test for dimension label display during and after drawing
- [x] 6.4 Write test for Shift key toggle during drag
- [x] 6.5 Write test for point marker creation on simple click (no drag)
- [x] 6.6 Write test for multiple rectangles and points coexisting
- [x] 6.7 Write test for drag threshold to prevent accidental rectangles

## 7. Validation
- [x] 7.1 Verify all existing point marker tests still pass
- [x] 7.2 Manually test rectangle drawing in all four directions
- [x] 7.3 Manually test Shift key behavior during active drag
- [x] 7.4 Test dimension label positioning and readability
