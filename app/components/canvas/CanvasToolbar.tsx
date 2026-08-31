import {
  Download,
  HelpCircle,
  Redo2,
  RotateCcw,
  Trash2,
  Undo2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface CanvasToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  hasSelection: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onDelete: () => void;
  onExport: (format: "png" | "jpg" | "svg") => void;
  onReset: () => void;
  onHelp: () => void;
}

export default function CanvasToolbar({
  canUndo,
  canRedo,
  hasSelection,
  onUndo,
  onRedo,
  onDelete,
  onExport,
  onReset,
  onHelp,
}: CanvasToolbarProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showExportMenu) return;

    const close = (event: PointerEvent) => {
      if (
        exportRef.current &&
        !exportRef.current.contains(event.target as Node)
      ) {
        setShowExportMenu(false);
      }
    };

    // Defer so the opening click does not immediately close the menu.
    const timer = window.setTimeout(() => {
      document.addEventListener("pointerdown", close);
    }, 0);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("pointerdown", close);
    };
  }, [showExportMenu]);

  return (
    <div className="relative z-20 flex items-center gap-2 p-3 bg-base-200 rounded-lg flex-wrap">
      <button
        type="button"
        className="btn btn-sm btn-ghost"
        onClick={onUndo}
        disabled={!canUndo}
        title="Undo (Ctrl+Z)"
      >
        <Undo2 className="w-4 h-4" />
        Undo
      </button>
      <button
        type="button"
        className="btn btn-sm btn-ghost"
        onClick={onRedo}
        disabled={!canRedo}
        title="Redo (Ctrl+Shift+Z)"
      >
        <Redo2 className="w-4 h-4" />
        Redo
      </button>

      <div className="w-px h-6 bg-base-300" />

      <button
        type="button"
        className="btn btn-sm btn-ghost"
        onClick={onDelete}
        disabled={!hasSelection}
        title="Delete (Delete key)"
      >
        <Trash2 className="w-4 h-4" />
        Delete
      </button>

      <div className="w-px h-6 bg-base-300" />

      <div className="relative" ref={exportRef}>
        <button
          type="button"
          className="btn btn-sm btn-ghost"
          onClick={() => setShowExportMenu(true)}
          title="Export canvas"
          aria-haspopup="menu"
          aria-expanded={showExportMenu}
        >
          <Download className="w-4 h-4" />
          Export
        </button>
        {showExportMenu && (
          <div
            className="absolute top-full left-0 mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg z-30 min-w-32"
            role="menu"
          >
            <button
              type="button"
              role="menuitem"
              className="block w-full text-left px-4 py-2 hover:bg-base-200 text-sm"
              onClick={() => {
                onExport("png");
                setShowExportMenu(false);
              }}
            >
              Export as PNG
            </button>
            <button
              type="button"
              role="menuitem"
              className="block w-full text-left px-4 py-2 hover:bg-base-200 text-sm"
              onClick={() => {
                onExport("jpg");
                setShowExportMenu(false);
              }}
            >
              Export as JPG
            </button>
            <button
              type="button"
              role="menuitem"
              className="block w-full text-left px-4 py-2 hover:bg-base-200 text-sm"
              onClick={() => {
                onExport("svg");
                setShowExportMenu(false);
              }}
            >
              Export as SVG
            </button>
          </div>
        )}
      </div>

      <div className="w-px h-6 bg-base-300" />

      <button
        type="button"
        className="btn btn-sm btn-ghost text-error"
        onClick={onReset}
        title="Clear canvas"
      >
        <RotateCcw className="w-4 h-4" />
        Reset
      </button>

      <div className="flex-1" />

      <button
        type="button"
        className="btn btn-sm btn-ghost"
        onClick={onHelp}
        title="User Guide"
        aria-label="User Guide"
      >
        <HelpCircle className="w-4 h-4" />
      </button>
    </div>
  );
}
