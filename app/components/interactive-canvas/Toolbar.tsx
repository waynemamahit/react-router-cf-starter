export interface ToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  canDelete: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onDelete: () => void;
  onReset: () => void;
  onExport: (format: 'png' | 'jpg' | 'svg') => void;
}

export function Toolbar({ 
  canUndo, 
  canRedo, 
  canDelete, 
  onUndo, 
  onRedo, 
  onDelete, 
  onReset,
  onExport
}: ToolbarProps) {
  return (
    <div className="flex flex-wrap gap-2 p-2 bg-white rounded-lg shadow-sm border border-gray-200 mb-4 items-center">
      <div className="flex gap-1 border-r border-gray-200 pr-2">
        <button 
          onClick={onUndo} 
          disabled={!canUndo}
          className="px-3 py-1.5 text-sm font-medium rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Undo (Ctrl+Z)"
        >
          Undo
        </button>
        <button 
          onClick={onRedo} 
          disabled={!canRedo}
          className="px-3 py-1.5 text-sm font-medium rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Redo (Ctrl+Y)"
        >
          Redo
        </button>
      </div>
      
      <div className="flex gap-1 border-r border-gray-200 pr-2">
        <button 
          onClick={onDelete} 
          disabled={!canDelete}
          className="px-3 py-1.5 text-sm font-medium rounded text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Delete Selection (Del)"
        >
          Delete
        </button>
        <button 
          onClick={onReset}
          className="px-3 py-1.5 text-sm font-medium rounded hover:bg-gray-100"
        >
          Reset
        </button>
      </div>
      
      <div className="flex gap-1">
        <select 
          onChange={(e) => onExport(e.target.value as any)}
          defaultValue=""
          className="px-3 py-1.5 text-sm font-medium rounded border border-gray-200 hover:bg-gray-50 bg-transparent"
        >
            <option value="" disabled>Export As...</option>
            <option value="png">PNG Image</option>
            <option value="jpg">JPG Image</option>
            <option value="svg">SVG Vector</option>
        </select>
      </div>
    </div>
  );
}
