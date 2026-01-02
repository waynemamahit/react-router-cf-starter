# Implementation Tasks

## 1. Add Shape Selection State Management
- [x] 1.1 Add `selectedShapeId` state to track the currently selected shape
- [x] 1.2 Add `onShapeClick` handler to handle shape selection
- [x] 1.3 Implement deselection when clicking canvas background
- [x] 1.4 Add visual indicator (border style/color change) for selected shapes

## 2. Implement Shape Dragging
- [x] 2.1 Add `isDraggingShape` state to track when a shape is being moved
- [x] 2.2 Add `dragOffset` state to store the initial click offset relative to shape position
- [x] 2.3 Modify `handleMouseDown` to detect clicks on shapes vs canvas background
- [x] 2.4 Implement shape drag logic in `handleMouseMove` to update shape position
- [x] 2.5 Update `handleMouseUp` to finalize shape position after drag
- [x] 2.6 Ensure dimension labels move with shapes during drag
- [x] 2.7 Update Rectangle interface to include position coordinates if needed

## 3. Implement Corner Resize Handles
- [x] 3.1 Create resize handle components (4 corners per selected shape)
- [x] 3.2 Add CSS styling for resize handles (small squares/circles at corners)
- [x] 3.3 Add `isResizing` state to track active resize operation
- [x] 3.4 Add `resizeCorner` state to track which corner is being dragged
- [x] 3.5 Implement resize handle click detection and event handling
- [x] 3.6 Add hover states for resize handles

## 4. Implement Resize Logic
- [x] 4.1 Calculate new dimensions based on mouse position and anchor corner
- [x] 4.2 Handle resize with Shift key to maintain aspect ratio (for squares)
- [x] 4.3 Allow rectangles to be resized into squares with Shift
- [x] 4.4 Update shape dimensions in real-time during resize operation
- [x] 4.5 Ensure minimum size constraints (e.g., minimum 10x10 pixels)
- [x] 4.6 Update dimension labels in real-time during resize

## 5. Refactor Event Handling
- [x] 5.1 Separate event handlers for shape manipulation vs new shape creation
- [x] 5.2 Implement proper event propagation control (stopPropagation where needed)
- [x] 5.3 Handle edge cases: clicking resize handle, clicking shape border, clicking shape interior
- [x] 5.4 Ensure point creation is not affected by shape manipulation changes

## 6. Update Dimension Labels
- [x] 6.1 Ensure dimension labels remain attached to shapes during all operations
- [x] 6.2 Verify real-time updates during drag operations
- [x] 6.3 Verify real-time updates during resize operations
- [x] 6.4 Test label positioning edge cases (shapes near canvas boundaries)

## 7. Testing
- [x] 7.1 Write tests for shape selection functionality
- [x] 7.2 Write tests for shape dragging functionality
- [x] 7.3 Write tests for corner resize handles rendering
- [x] 7.4 Write tests for resize operations (normal and with Shift)
- [x] 7.5 Write tests for real-time dimension label updates
- [x] 7.6 Write tests for deselection behavior
- [x] 7.7 Update existing tests if interaction patterns changed
- [x] 7.8 Test edge cases: dragging outside canvas, negative dimensions, etc.

## 8. Visual Polish
- [x] 8.1 Add smooth cursor changes (move cursor on shapes, resize cursors on handles)
- [x] 8.2 Ensure selected shape has clear visual distinction
- [x] 8.3 Test and refine resize handle visibility and size
- [x] 8.4 Verify all interactions work smoothly together (no conflicts)
