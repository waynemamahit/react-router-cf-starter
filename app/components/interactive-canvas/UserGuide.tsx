export function UserGuide() {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <h3 className="font-semibold text-gray-700 mb-2">User Guide</h3>
      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
        <li><strong>Click</strong> on empty space to create a Point</li>
        <li><strong>Drag</strong> to create a Rectangle</li>
        <li><strong>Shift + Drag</strong> to create a Square</li>
        <li><strong>Click</strong> a shape to Select it</li>
        <li><strong>Drag</strong> a selected shape to Move it</li>
        <li><strong>Drag Corners</strong> of selected shape to Resize</li>
        <li><strong>Delete Key/Button</strong> to remove selected shape</li>
        <li><strong>Ctrl+Z / Ctrl+Y</strong> to Undo / Redo</li>
      </ul>
    </div>
  );
}