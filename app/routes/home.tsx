import { env } from "cloudflare:workers";

import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Canvas from "~/components/canvas/Canvas";
import CanvasErrorBoundary from "~/components/canvas/CanvasErrorBoundary";
import CanvasStats from "~/components/canvas/CanvasStats";
import CanvasToolbar from "~/components/canvas/CanvasToolbar";
import UserGuide from "~/components/canvas/UserGuide";
import { useCanvasHistory } from "~/hooks/useCanvasHistory";
import {
  restoreCanvasHistory,
  useCanvasPersistence,
} from "~/hooks/useCanvasPersistence";
import { getStats } from "~/utils/canvas-renderer";
import { downloadExport } from "~/utils/export";

export function meta() {
  return [
    { title: "Interactive Canvas" },
    {
      name: "description",
      content: "Interactive drawing canvas for points, rectangles, and squares",
    },
  ];
}

export function loader() {
  return { message: env.VALUE_FROM_CLOUDFLARE };
}

export default function Home() {
  const navigate = useNavigate();
  const [guideOpen, setGuideOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const { state, dispatch, canUndo, canRedo, past, future } = useCanvasHistory({
    shapes: [],
    selectedId: null,
  });

  useCanvasPersistence(past, state, future, initialized);

  useEffect(() => {
    const saved = restoreCanvasHistory();
    if (saved) {
      dispatch({
        type: "RESTORE",
        state: saved.present,
        past: saved.past,
        future: saved.future,
      });
    }
    setInitialized(true);
  }, [dispatch]);

  const handleUndo = useCallback(() => dispatch({ type: "UNDO" }), [dispatch]);
  const handleRedo = useCallback(() => dispatch({ type: "REDO" }), [dispatch]);

  const handleDelete = useCallback(() => {
    if (state.selectedId) {
      dispatch({ type: "DELETE_SHAPE", id: state.selectedId });
    }
  }, [state.selectedId, dispatch]);

  const handleExport = useCallback(
    (format: "png" | "jpg" | "svg") => {
      const ok = downloadExport(state.shapes, format);
      if (!ok) alert("Nothing to export — add some shapes first.");
    },
    [state.shapes],
  );

  const handleReset = useCallback(() => {
    if (state.shapes.length === 0) return;
    dispatch({ type: "RESET" });
  }, [state.shapes.length, dispatch]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (
          state.selectedId &&
          !(
            e.target instanceof HTMLInputElement ||
            e.target instanceof HTMLTextAreaElement
          )
        ) {
          e.preventDefault();
          handleDelete();
        }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state.selectedId, handleDelete, handleUndo, handleRedo]);

  const stats = getStats(state.shapes);

  return (
    <div
      className="flex flex-col h-screen max-h-screen"
      data-canvas-ready={initialized ? "true" : "false"}
    >
      <header className="relative z-20 flex items-center justify-between px-4 py-2 border-b border-base-300 bg-base-100">
        <h1 className="text-xl font-bold">Interactive Canvas</h1>
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => navigate("/about")}
        >
          About
        </button>
      </header>

      <div className="flex flex-col flex-1 min-h-0 gap-2 p-4">
        <CanvasToolbar
          canUndo={canUndo}
          canRedo={canRedo}
          hasSelection={state.selectedId !== null}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onDelete={handleDelete}
          onExport={handleExport}
          onReset={handleReset}
          onHelp={() => {
            window.setTimeout(() => setGuideOpen(true), 0);
          }}
        />

        <CanvasErrorBoundary>
          <Canvas state={state} dispatch={dispatch} />
        </CanvasErrorBoundary>

        <CanvasStats stats={stats} />
      </div>

      <UserGuide isOpen={guideOpen} onClose={() => setGuideOpen(false)} />
    </div>
  );
}
