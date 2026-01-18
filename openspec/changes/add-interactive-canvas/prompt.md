GOAL:
Create Interactive Canvas

REQUIREMENTS:
- Users can see the canvas on home page.
- Users can create point with click anywhere on canvas and show the label coordinates on hover the created points.
- Users can create rectangles with click+drag on canvas while show dimension and area label on creation and hover. While creating rectangle press shift to create square.
- Users can resize the created rectangles and squares on corners and show the label dimension and area while resizing.
- Users can move the created rectangles and squares with drag and drop.
- Users can delete the created points, rectangles and squares with button and delete key.
- Users can undo and redo the created points, rectangles and squares with button and shortcut keys.
- Users can export the drawing canvas into image (png, jpg, svg).
- Users can see the guide how to use the interactive canvas.
- Users can see count statistics of created points, rectangles and squares.
- Users can clean or reset the drawing.
- Users can see last changes of drawing canvas when reopen the page.

OBJECTIVE:
- Create canvas page to replace home page.
- Click on canvas will create point.
- Click+drag on canvas will create rectangle.
- Click+drag+shift on canvas will create square.
- Click+drag and drop for move created rectangles and squares.
- Click corners of created rectangle and square to resize.
- Click for select the points, rectangles and squares.
- Press delete key to delete the selected points, rectangles and squares.
- Click delete button to delete the selected points, rectangles and squares.
- Click undo button to undo the last action.
- Click redo button to redo the last undone action.
- Press shortcut key for undo and redo.
- Click export button to export the canvas into image (png, jpg, svg).
- Click reset button for clean or reset the drawing.
- Automatically save the last changes on local storage and load automatically when user reopen the page.

CONSTRAINTS AND RULES:
- Points must be top of rectangles and squares make it visible for selection.
- Rectangles and squares z-index must order by creation time.
- After create point make sure not to select the created point automatically.
- Rectangles and squares can resize on all directions.
- Rectangles can resize into squares and vice versa.
- Delete, export, reset, undo and redo buttons must be outside the canvas.
- User guide must be outside the canvas.
- Count statistics must be outside the canvas.
- Count statistics for squares will be automatically count if user manually create square and resize existing rectangles into square without using shift key.
- On export result do not show the detail of selected points, rectangles and squares (like colors, rectangles, and squares).
- Cleaned or Reseted canvas can be undo.
