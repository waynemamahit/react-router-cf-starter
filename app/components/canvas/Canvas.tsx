import { useCallback, useEffect, useRef, useState } from "react";
import type {
  CanvasAction,
  CanvasState,
  InteractionState,
} from "~/types/canvas";
import {
  computeResize,
  getCornerHandle,
  hitTest,
  renderCanvas,
} from "~/utils/canvas-renderer";

interface CanvasProps {
  state: CanvasState;
  dispatch: React.Dispatch<CanvasAction>;
}

const defaultInteraction: InteractionState = {
  mode: "idle",
  startX: 0,
  startY: 0,
  currentX: 0,
  currentY: 0,
  shapeId: null,
  handle: null,
  origX: 0,
  origY: 0,
  origW: 0,
  origH: 0,
  isSquare: false,
};

const handleCursorMap: Record<string, string> = {
  nw: "cursor-nw-resize",
  ne: "cursor-ne-resize",
  sw: "cursor-sw-resize",
  se: "cursor-se-resize",
};

let shapeCounter = 0;
function nextId(): string {
  return `shape-${++shapeCounter}-${Date.now()}`;
}

function canvasPoint(
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number,
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  return { x: clientX - rect.left, y: clientY - rect.top };
}

export default function Canvas({ state, dispatch }: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const interactionRef = useRef<InteractionState>(defaultInteraction);
  const shiftHeldRef = useRef(false);
  const [hoveredShapeId, setHoveredShapeId] = useState<string | null>(null);
  const [cursorClass, setCursorClass] = useState("cursor-crosshair");
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const stateRef = useRef(state);
  const rafRef = useRef<number | null>(null);
  stateRef.current = state;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    renderCanvas(
      ctx,
      dimensions.width,
      dimensions.height,
      stateRef.current,
      hoveredShapeId,
      interactionRef.current,
    );
  }, [hoveredShapeId, dimensions]);

  const scheduleDraw = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      draw();
    });
  }, [draw]);

  useEffect(() => {
    draw();
  }, [draw]);

  // biome-ignore lint/correctness/useExhaustiveDependencies(state): needed as dep to redraw canvas when dispatch changes state
  useEffect(() => {
    draw();
  }, [state, draw]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = Math.floor(entry.contentRect.width);
        const height = Math.floor(entry.contentRect.height);
        if (width < 1 || height < 1) return;
        setDimensions({ width, height });
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const finishInteraction = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const inter = interactionRef.current;
    const currentState = stateRef.current;

    if (inter.mode === "drawing") {
      const dx = Math.abs(inter.currentX - inter.startX);
      const dy = Math.abs(inter.currentY - inter.startY);

      if (dx < 3 && dy < 3) {
        dispatch({
          type: "ADD_POINT",
          shape: {
            id: nextId(),
            type: "point",
            x: inter.startX,
            y: inter.startY,
          },
        });
      } else {
        const x = Math.min(inter.startX, inter.currentX);
        const y = Math.min(inter.startY, inter.currentY);
        const w = Math.abs(inter.currentX - inter.startX);
        const h = inter.isSquare ? w : Math.abs(inter.currentY - inter.startY);
        dispatch({
          type: "ADD_RECT",
          shape: {
            id: nextId(),
            type: "rect",
            x,
            y,
            width: w,
            height: h,
            isSquare: inter.isSquare || w === h,
            color: "#3b82f6",
          },
        });
      }
    }

    if (inter.mode === "moving" && inter.shapeId) {
      const shape = currentState.shapes.find((s) => s.id === inter.shapeId);
      if (shape && shape.type === "rect") {
        const dx = inter.currentX - inter.startX;
        const dy = inter.currentY - inter.startY;
        dispatch({
          type: "MOVE_SHAPE",
          id: inter.shapeId,
          x: inter.origX + dx,
          y: inter.origY + dy,
        });
      }
    }

    if (inter.mode === "resizing" && inter.shapeId && inter.handle) {
      const result = computeResize(
        inter.handle,
        inter.startX,
        inter.startY,
        inter.currentX,
        inter.currentY,
        inter.origX,
        inter.origY,
        inter.origW,
        inter.origH,
        inter.isSquare,
      );
      dispatch({
        type: "RESIZE_SHAPE",
        id: inter.shapeId,
        x: result.x,
        y: result.y,
        width: result.width,
        height: result.height,
      });
    }

    interactionRef.current = defaultInteraction;
    setCursorClass("cursor-crosshair");
  }, [dispatch]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (e.button !== 0) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const { x, y } = canvasPoint(canvas, e.clientX, e.clientY);
      const isSquare = e.shiftKey || shiftHeldRef.current;

      if (stateRef.current.selectedId) {
        const selected = stateRef.current.shapes.find(
          (s) => s.id === stateRef.current.selectedId,
        );
        if (selected && selected.type === "rect") {
          const handle = getCornerHandle(x, y, selected);
          if (handle) {
            interactionRef.current = {
              mode: "resizing",
              shapeId: selected.id,
              startX: x,
              startY: y,
              currentX: x,
              currentY: y,
              handle,
              origX: selected.x,
              origY: selected.y,
              origW: selected.width,
              origH: selected.height,
              isSquare,
            };
            setCursorClass(handleCursorMap[handle] || "cursor-nwse-resize");
            return;
          }
        }
      }

      const hit = hitTest(x, y, stateRef.current.shapes);
      if (hit) {
        dispatch({ type: "SELECT_SHAPE", id: hit.id });
        if (hit.type === "rect") {
          interactionRef.current = {
            mode: "moving",
            shapeId: hit.id,
            startX: x,
            startY: y,
            currentX: x,
            currentY: y,
            handle: null,
            origX: hit.x,
            origY: hit.y,
            origW: hit.width,
            origH: hit.height,
            isSquare: hit.isSquare,
          };
          setCursorClass("cursor-grabbing");
          return;
        }
        return;
      }

      dispatch({ type: "SELECT_SHAPE", id: null });
      interactionRef.current = {
        mode: "drawing",
        shapeId: null,
        startX: x,
        startY: y,
        currentX: x,
        currentY: y,
        handle: null,
        origX: 0,
        origY: 0,
        origW: 0,
        origH: 0,
        isSquare,
      };
      setCursorClass("cursor-crosshair");
    },
    [dispatch],
  );

  const applyPointerMove = useCallback(
    (clientX: number, clientY: number, shiftKey: boolean) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const { x, y } = canvasPoint(canvas, clientX, clientY);
      const inter = interactionRef.current;
      const isSquare = shiftKey || shiftHeldRef.current;

      if (inter.mode === "drawing") {
        const dx = Math.abs(x - inter.startX);
        const dy = Math.abs(y - inter.startY);
        if (dx < 3 && dy < 3) return;
        interactionRef.current = {
          ...inter,
          currentX: x,
          currentY: y,
          isSquare,
        };
        scheduleDraw();
        return;
      }

      if (inter.mode === "moving") {
        const dx = x - inter.startX;
        const dy = y - inter.startY;
        interactionRef.current = { ...inter, currentX: x, currentY: y };

        const shape = stateRef.current.shapes.find(
          (s) => s.id === inter.shapeId,
        );
        if (shape && shape.type === "rect") {
          stateRef.current = {
            ...stateRef.current,
            shapes: stateRef.current.shapes.map((s) =>
              s.id === inter.shapeId
                ? { ...s, x: inter.origX + dx, y: inter.origY + dy }
                : s,
            ),
          };
          scheduleDraw();
        }
        return;
      }

      if (inter.mode === "resizing" && inter.handle) {
        interactionRef.current = {
          ...inter,
          currentX: x,
          currentY: y,
          isSquare,
        };
        const result = computeResize(
          inter.handle,
          inter.startX,
          inter.startY,
          x,
          y,
          inter.origX,
          inter.origY,
          inter.origW,
          inter.origH,
          isSquare,
        );

        const shape = stateRef.current.shapes.find(
          (s) => s.id === inter.shapeId,
        );
        if (shape && shape.type === "rect") {
          stateRef.current = {
            ...stateRef.current,
            shapes: stateRef.current.shapes.map((s) =>
              s.id === inter.shapeId
                ? {
                    ...s,
                    x: result.x,
                    y: result.y,
                    width: result.width,
                    height: result.height,
                    isSquare: result.width === result.height,
                  }
                : s,
            ),
          };
          scheduleDraw();
        }
        return;
      }

      const hit = hitTest(x, y, stateRef.current.shapes);
      const hoveredId = hit ? hit.id : null;
      setHoveredShapeId(hoveredId);

      if (inter.mode === "idle") {
        if (hit && hit.type === "rect") {
          const selected = stateRef.current.shapes.find(
            (s) => s.id === stateRef.current.selectedId,
          );
          if (selected && selected.id === hit.id) {
            const handle = getCornerHandle(x, y, hit);
            setCursorClass(
              handle
                ? handleCursorMap[handle] || "cursor-nwse-resize"
                : "cursor-grab",
            );
          } else {
            setCursorClass("cursor-grab");
          }
        } else {
          setCursorClass("cursor-crosshair");
        }
      }
    },
    [scheduleDraw],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      applyPointerMove(e.clientX, e.clientY, e.shiftKey);
    },
    [applyPointerMove],
  );

  const handlePointerLeave = useCallback(() => {
    if (interactionRef.current.mode === "idle") {
      setHoveredShapeId(null);
      setCursorClass("cursor-crosshair");
    }
  }, []);

  useEffect(() => {
    const onWindowPointerMove = (event: PointerEvent) => {
      if (interactionRef.current.mode === "idle") return;
      applyPointerMove(event.clientX, event.clientY, event.shiftKey);
    };
    const onWindowPointerUp = () => {
      if (interactionRef.current.mode !== "idle") {
        finishInteraction();
      }
    };
    window.addEventListener("pointermove", onWindowPointerMove);
    window.addEventListener("pointerup", onWindowPointerUp);
    return () => {
      window.removeEventListener("pointermove", onWindowPointerMove);
      window.removeEventListener("pointerup", onWindowPointerUp);
    };
  }, [applyPointerMove, finishInteraction]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Shift") return;
      shiftHeldRef.current = true;
      const inter = interactionRef.current;
      if (inter.mode === "drawing" || inter.mode === "resizing") {
        interactionRef.current = { ...inter, isSquare: true };
        scheduleDraw();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key !== "Shift") return;
      shiftHeldRef.current = false;
      const inter = interactionRef.current;
      if (inter.mode === "drawing" || inter.mode === "resizing") {
        interactionRef.current = { ...inter, isSquare: false };
        scheduleDraw();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [scheduleDraw]);

  return (
    <div
      ref={containerRef}
      className="flex-1 min-h-0 border border-base-300 rounded-lg overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className={`w-full h-full touch-none ${cursorClass}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      />
    </div>
  );
}
