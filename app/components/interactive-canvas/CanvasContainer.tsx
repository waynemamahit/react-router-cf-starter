import { useCallback, useEffect, useState } from "react";
import { useHistory } from "~/hooks/useHistory";
import { useLocalStorage } from "~/hooks/useLocalStorage";
import type { Shape } from "~/models/canvas";
import { exportToImage, exportToSvg } from "~/utils/export";
import { Canvas } from "./Canvas";
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
  } = useHistory<Shape[]>([]); // Initialize with empty to match SSR
  
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

  return (
    <div className="flex flex-col min-h-screen md:h-screen max-w-6xl mx-auto p-4 gap-4">
      <div className="flex-1 flex flex-col md:flex-row gap-4">
        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col min-h-[500px] md:min-h-0">
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
          <div className="flex-1 min-h-0">
            <Canvas 
                shapes={shapes}
                onShapesChange={handleShapesChange}
                selectedId={selectedId}
                onSelect={setSelectedId}
            />
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0 flex flex-col gap-4">
          <Statistics shapes={shapes} />
          <UserGuide />
        </div>
      </div>
    </div>
  );
}
