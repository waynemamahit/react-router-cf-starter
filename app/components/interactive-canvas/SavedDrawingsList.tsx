import type { DrawingMetadata } from '~/models/drawing';

interface SavedDrawingsListProps {
  drawings: DrawingMetadata[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  onLoadMore: () => void;
  onRetry: () => void;
  onLoadDrawing: (name: string) => void;
  onDeleteDrawing: (name: string) => void;
  isDeleting: boolean;
}

export function SavedDrawingsList({
  drawings,
  isLoading,
  error,
  hasMore,
  onLoadMore,
  onRetry,
  onLoadDrawing,
  onDeleteDrawing,
  isDeleting,
}: SavedDrawingsListProps) {
  if (error) {
    return (
      <div className="p-4 text-center border border-red-200 rounded bg-red-50 text-red-600">
        <p className="mb-2 text-sm">{error}</p>
        <button
          onClick={onRetry}
          className="text-xs font-medium underline hover:no-underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (drawings.length === 0 && !isLoading) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm italic border border-dashed border-gray-300 rounded">
        No saved drawings yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-semibold text-sm mb-2 text-gray-700">Saved Drawings</h3>
      <div className="space-y-2 pr-1">
        {drawings.map((drawing) => (
          <div
            key={drawing.name}
            className="flex items-center justify-between p-3 border border-gray-200 rounded bg-white hover:bg-gray-50 group transition-colors shadow-sm"
          >
            <button
              onClick={() => onLoadDrawing(drawing.name)}
              className="flex-1 text-left text-sm truncate mr-2 cursor-pointer"
              title={`Created: ${new Date(drawing.createdAt).toLocaleString()}`}
            >
              <span className="font-medium text-gray-800">{drawing.name}</span>
              <span className="block text-xs text-gray-500 mt-0.5">
                {new Date(drawing.createdAt).toLocaleDateString()}
              </span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Are you sure you want to delete "${drawing.name}"?`)) {
                  onDeleteDrawing(drawing.name);
                }
              }}
              disabled={isDeleting}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all disabled:opacity-50 opacity-0 group-hover:opacity-100 focus:opacity-100"
              title="Delete drawing"
              aria-label={`Delete ${drawing.name}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        ))}
        
        {(isLoading || hasMore) && (
          <div className="text-center pt-2 pb-1">
            {isLoading ? (
              <span className="text-xs text-gray-400 animate-pulse">Loading...</span>
            ) : (
              <button
                onClick={onLoadMore}
                className="text-xs text-blue-600 font-medium hover:underline py-1 px-2 cursor-pointer"
              >
                Load more
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
