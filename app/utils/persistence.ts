import type { CanvasState } from "~/types/canvas";

const STORAGE_KEY = "interactive-canvas-state";
const BACKUP_KEY = "interactive-canvas-state-backup";
const HISTORY_KEY = "interactive-canvas-history";

interface PersistedData {
  state: CanvasState;
  timestamp: number;
}

interface PersistedHistoryData {
  past: CanvasState[];
  present: CanvasState;
  future: CanvasState[];
  timestamp: number;
}

export function saveCanvasState(state: CanvasState): boolean {
  try {
    const data: PersistedData = { state, timestamp: Date.now() };
    const raw = JSON.stringify(data);
    if (raw.length > 4_000_000) {
      console.warn("Canvas state too large, saving to backup");
      window.localStorage.setItem(BACKUP_KEY, raw);
    }
    window.localStorage.setItem(STORAGE_KEY, raw);
    return true;
  } catch (e) {
    console.error("Failed to save canvas state:", e);
    return false;
  }
}

export function loadCanvasState(): CanvasState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed: PersistedData = JSON.parse(raw);
    if (!isValidState(parsed.state)) {
      const backup = window.localStorage.getItem(BACKUP_KEY);
      if (backup) {
        const backupParsed: PersistedData = JSON.parse(backup);
        if (isValidState(backupParsed.state)) {
          return backupParsed.state;
        }
      }
      return null;
    }

    return parsed.state;
  } catch (e) {
    console.error("Failed to load canvas state:", e);
    return null;
  }
}

export function saveCanvasHistory(
  past: CanvasState[],
  present: CanvasState,
  future: CanvasState[],
): boolean {
  try {
    const data: PersistedHistoryData = {
      past,
      present,
      future,
      timestamp: Date.now(),
    };
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error("Failed to save canvas history:", e);
    return false;
  }
}

export function loadCanvasHistory(): {
  past: CanvasState[];
  present: CanvasState;
  future: CanvasState[];
} | null {
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return null;

    const parsed: PersistedHistoryData = JSON.parse(raw);
    if (
      !isValidState(parsed.present) ||
      !Array.isArray(parsed.past) ||
      !Array.isArray(parsed.future)
    ) {
      return null;
    }

    for (const s of [...parsed.past, ...parsed.future]) {
      if (!isValidState(s)) return null;
    }

    return {
      past: parsed.past,
      present: parsed.present,
      future: parsed.future,
    };
  } catch (e) {
    console.error("Failed to load canvas history:", e);
    return null;
  }
}

export function clearCanvasState() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(BACKUP_KEY);
    window.localStorage.removeItem(HISTORY_KEY);
  } catch {}
}

function isValidState(state: unknown): state is CanvasState {
  if (!state || typeof state !== "object") return false;
  const s = state as Record<string, unknown>;
  if (!Array.isArray(s.shapes)) return false;
  for (const shape of s.shapes) {
    if (!shape || typeof shape !== "object") return false;
    const sh = shape as Record<string, unknown>;
    if (typeof sh.id !== "string") return false;
    if (sh.type !== "point" && sh.type !== "rect") return false;
    if (typeof sh.x !== "number" || typeof sh.y !== "number") return false;
  }
  return true;
}
