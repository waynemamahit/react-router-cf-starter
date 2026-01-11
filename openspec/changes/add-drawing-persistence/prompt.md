GOAL: 
Enhance Canvas Persistence

REQUIREMENTS:
- Users can save the drawing canvas with button and input the drawing name own.
- Users can see list saved drawing.
- Users can load the drawing from list saved drawing with click on list item.
- Users can delete drawing from list saved drawing with click delete button on list item.

OBJECTIVE:
- Create Save Drawing API and save into JSON via KV.
- Create List Drawing API and list saved drawing from JSON via KV.
- Create Delete Drawing API.
- Input drawing name and click button save for save the drawing canvas.
- Click each list item saved drawing will be show or load saved drawing.
- Click each delete button in list item saved drawing will be hit Delete Drawing API.


CONSTRAINTS AND RULES:
- Must be show error message if cannot list saved drawing, fail to save and delete drawing.
- List saved drawing must be paging 10 item per page.
- List saved drawing must be one page with canvas.
- List saved drawing must be show retry button if fail to get.
- Separate error handling save drawing and list drawing API.
- Input drawing name and save button UI must be top of canvas (side of buttons).
- Saved drawing name must be validate without duplicate name.
