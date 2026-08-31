import { useEffect, useRef } from "react";
import type { CanvasState } from "~/types/canvas";
import { loadCanvasHistory, saveCanvasHistory } from "~/utils/persistence";

const THROTTLE_MS = 500;

export function useCanvasPersistence(
  past: CanvasState[],
  present: CanvasState,
  future: CanvasState[],
  enabled: boolean,
): void {
  const lastSaveRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const now = Date.now();
    const elapsed = now - lastSaveRef.current;

    if (elapsed >= THROTTLE_MS) {
      saveCanvasHistory(past, present, future);
      lastSaveRef.current = now;
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        saveCanvasHistory(past, present, future);
        lastSaveRef.current = Date.now();
      }, THROTTLE_MS - elapsed);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [past, present, future, enabled]);
}

export function restoreCanvasHistory(): {
  past: CanvasState[];
  present: CanvasState;
  future: CanvasState[];
} | null {
  return loadCanvasHistory();
}
