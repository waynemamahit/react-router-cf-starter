import { useCallback, useEffect, useState } from "react";
import { useDrawingPersistence } from "~/hooks/useDrawingPersistence";
import { useHistory } from "~/hooks/useHistory";
import { useLocalStorage } from "~/hooks/useLocalStorage";
import type { Shape } from "~/models/canvas";
import { exportToImage, exportToSvg } from "~/utils/export";
import { Canvas } from "./Canvas";
import { SaveDrawingForm } from "./SaveDrawingForm";
import { SavedDrawingsList } from "./SavedDrawingsList";
import { Statistics } from "./Statistics";
import { Toolbar } from "./Toolbar";
import { UserGuide } from "./UserGuide";

export function CanvasContainer() {
  // 1. Persistence
  const [savedShapes, setSavedShapes, isLoaded] = useLocalStorage<Shape[]>("canvas-shapes", []);
  
  // 2. History & State
  const { 
    state: shapes, 
    set: setHistoryShapes, 
    updateTransient: setTransientShapes,
    undo, 
    redo, 
    canUndo, 
    canRedo 
  } = useHistory<Shape[]>(savedShapes); // Initialize with saved

  // 3. Remote Persistence
  const {
    drawings,
    isLoadingList,
    listError,
    hasMore,
    loadMore,
    refreshList,
    isSaving,
    saveError,
    saveDrawing: apiSaveDrawing,
    loadError,
    loadDrawing: apiLoadDrawing,
    isDeleting,
    deleteError,
    deleteDrawing,
  } = useDrawingPersistence();
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hasSynced, setHasSynced] = useState(false);

  // Sync Load: LocalStorage -> History
  useEffect(() => {
    if (isLoaded && !hasSynced) {
      setHistoryShapes(savedShapes);
      setHasSynced(true);
    }
  }, [isLoaded, savedShapes, hasSynced, setHistoryShapes]);
  
  // Sync Save: History -> LocalStorage (auto-save) with debounce
  useEffect(() => {
    if (!hasSynced) return;
    
    const timeoutId = setTimeout(() => {
      setSavedShapes(shapes);
    }, 1000); // 1s debounce to prevent render spam during drag
    
    return () => clearTimeout(timeoutId);
  }, [shapes, setSavedShapes, hasSynced]);

  // Handle Shapes Change from Canvas
  const handleShapesChange = useCallback((newShapes: Shape[], isTransient: boolean) => {
    if (isTransient) {
        setTransientShapes(newShapes);
    } else {
        setHistoryShapes(newShapes);
    }
  }, [setHistoryShapes, setTransientShapes]);

  // Remote Persistence Handlers
  const handleSaveDrawing = useCallback(async (name: string) => {
    return await apiSaveDrawing(name, shapes);
  }, [apiSaveDrawing, shapes]);

  const handleLoadDrawing = useCallback(async (name: string) => {
    const drawing = await apiLoadDrawing(name);
    if (drawing) {
      setHistoryShapes(drawing.shapes);
      setSelectedId(null);
    }
  }, [apiLoadDrawing, setHistoryShapes]);

  // Actions
  const handleDelete = useCallback(() => {
    if (!selectedId) return;
    const newShapes = shapes.filter(s => s.id !== selectedId);
    setHistoryShapes(newShapes);
    setSelectedId(null);
  }, [shapes, selectedId, setHistoryShapes]);

  const handleReset = useCallback(() => {
    setHistoryShapes([]);
    setSelectedId(null);
  }, [setHistoryShapes]);

  const handleExport = useCallback((format: 'png' | 'jpg' | 'svg') => {
    // We need element dimensions for exact export, or we can use fixed/calculated
    // For this implementation, we'll grab the current canvas size or valid bounds
    const width = 800; // default/fallback
    const height = 600;
    
    // Better: Get bounds of all shapes
    if (format === 'svg') {
        exportToSvg(shapes, width, height);
    } else {
        exportToImage(shapes, width, height, format);
    }
  }, [shapes]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo: Ctrl+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Redo: Ctrl+Y or Ctrl+Shift+Z
      if (((e.ctrlKey || e.metaKey) && e.key === 'y') || 
          ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey)) {
        e.preventDefault();
        redo();
      }
      // Delete: Delete or Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId) { // Only if something is selected
             // Prevent backspace nav if not in input
             // But be careful, backspace is delete on mac
             e.preventDefault();
             handleDelete();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, handleDelete, selectedId]);

  // Hydration fix: ensure client matches server (empty) on first render
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);
  const renderedShapes = isMounted ? shapes : [];

  return (
    <div className="flex flex-col min-h-[100dvh] xl:h-[100dvh] max-w-7xl mx-auto p-2 sm:p-4 gap-4">
      <div className="flex flex-col xl:flex-row gap-4 xl:h-full xl:overflow-hidden">
        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col min-h-[50vh] xl:min-h-0 gap-2 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
            <div>
              <Toolbar 
                canUndo={canUndo}
                canRedo={canRedo}
                canDelete={!!selectedId}
                onUndo={undo}
                onRedo={redo}
                onDelete={handleDelete}
                onReset={handleReset}
                onExport={handleExport}
              />
            </div>
            <div className="flex-grow min-w-[140px]">
              <SaveDrawingForm 
                onSave={handleSaveDrawing} 
                isSaving={isSaving} 
                error={saveError} 
              />
            </div>
          </div>
          <div className="flex-1 min-h-[350px] xl:min-h-0 relative shadow-sm rounded-lg overflow-hidden border border-gray-200 bg-white">
            <Canvas 
                shapes={renderedShapes}
                onShapesChange={handleShapesChange}
                selectedId={selectedId}
                onSelect={setSelectedId}
            />
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="w-full xl:w-72 flex-shrink-0 flex flex-col gap-4 xl:overflow-y-auto xl:min-h-0 border-t xl:border-t-0 pt-4 xl:pt-0">
          <Statistics shapes={renderedShapes} />
          
          <SavedDrawingsList 
            drawings={drawings}
            isLoading={isLoadingList}
            error={listError}
            hasMore={hasMore}
            onLoadMore={loadMore}
            onRetry={refreshList}
            onLoadDrawing={handleLoadDrawing}
            onDeleteDrawing={deleteDrawing}
            isDeleting={isDeleting}
          />
          {(loadError || deleteError) && (
            <div className="p-2 text-xs text-red-500 bg-red-50 border border-red-100 rounded">
              {loadError || deleteError}
            </div>
          )}
          
          <UserGuide />
        </div>
      </div>
    </div>
  );
}
