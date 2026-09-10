import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { CanvasState } from "~/types/canvas";
import {
  clearCanvasState,
  loadCanvasHistory,
  loadCanvasState,
  saveCanvasHistory,
  saveCanvasState,
} from "./persistence";

const STORAGE_KEY = "interactive-canvas-state";
const BACKUP_KEY = "interactive-canvas-state-backup";
const HISTORY_KEY = "interactive-canvas-history";

function createEmptyState(): CanvasState {
  return { shapes: [], selectedId: null };
}

function createStateWithShapes(): CanvasState {
  return {
    shapes: [
      { id: "p1", type: "point", x: 100, y: 200 },
      {
        id: "r1",
        type: "rect",
        x: 50,
        y: 50,
        width: 100,
        height: 80,
        isSquare: false,
        color: "#3b82f6",
      },
    ],
    selectedId: "p1",
  };
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe("saveCanvasState / loadCanvasState", () => {
  it("saves and loads state roundtrip", () => {
    const state = createStateWithShapes();
    const ok = saveCanvasState(state);
    expect(ok).toBe(true);

    const loaded = loadCanvasState();
    expect(loaded).toEqual(state);
  });

  it("returns null when no state is saved", () => {
    expect(loadCanvasState()).toBeNull();
  });

  it("validates state shape on load", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state: { invalid: true }, timestamp: Date.now() }),
    );
    expect(loadCanvasState()).toBeNull();
  });

  it("falls back to backup when primary is invalid", () => {
    const state = createEmptyState();
    localStorage.setItem(
      BACKUP_KEY,
      JSON.stringify({ state, timestamp: Date.now() }),
    );
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state: { invalid: true }, timestamp: Date.now() }),
    );

    const loaded = loadCanvasState();
    expect(loaded).toEqual(state);
  });

  it("returns null when both primary and backup are invalid", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state: { invalid: true }, timestamp: Date.now() }),
    );
    localStorage.setItem(
      BACKUP_KEY,
      JSON.stringify({ state: { invalid: true }, timestamp: Date.now() }),
    );
    expect(loadCanvasState()).toBeNull();
  });

  it("handles corrupted JSON gracefully", () => {
    localStorage.setItem(STORAGE_KEY, "not-valid-json{{{");
    expect(loadCanvasState()).toBeNull();
  });
});

describe("saveCanvasHistory / loadCanvasHistory", () => {
  it("saves and loads history roundtrip", () => {
    const past = [createEmptyState()];
    const present = createStateWithShapes();
    const future = [createEmptyState()];

    const ok = saveCanvasHistory(past, present, future);
    expect(ok).toBe(true);

    const loaded = loadCanvasHistory();
    expect(loaded).toEqual({ past, present, future });
  });

  it("returns null when no history is saved", () => {
    expect(loadCanvasHistory()).toBeNull();
  });

  it("validates present state on load", () => {
    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify({
        past: [],
        present: { invalid: true },
        future: [],
        timestamp: Date.now(),
      }),
    );
    expect(loadCanvasHistory()).toBeNull();
  });

  it("validates past array on load", () => {
    const present = createEmptyState();
    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify({
        past: "not-an-array",
        present,
        future: [],
        timestamp: Date.now(),
      }),
    );
    expect(loadCanvasHistory()).toBeNull();
  });

  it("validates future array on load", () => {
    const present = createEmptyState();
    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify({
        past: [],
        present,
        future: "not-an-array",
        timestamp: Date.now(),
      }),
    );
    expect(loadCanvasHistory()).toBeNull();
  });

  it("rejects history with invalid state in past", () => {
    const present = createEmptyState();
    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify({
        past: [{ invalid: true }],
        present,
        future: [],
        timestamp: Date.now(),
      }),
    );
    expect(loadCanvasHistory()).toBeNull();
  });

  it("handles corrupted JSON gracefully", () => {
    localStorage.setItem(HISTORY_KEY, "corrupted{{{");
    expect(loadCanvasHistory()).toBeNull();
  });
});

describe("clearCanvasState", () => {
  it("removes all canvas keys from localStorage", () => {
    localStorage.setItem(STORAGE_KEY, "data");
    localStorage.setItem(BACKUP_KEY, "backup");
    localStorage.setItem(HISTORY_KEY, "history");

    clearCanvasState();

    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(BACKUP_KEY)).toBeNull();
    expect(localStorage.getItem(HISTORY_KEY)).toBeNull();
  });

  it("does not throw when no keys exist", () => {
    expect(() => clearCanvasState()).not.toThrow();
  });
});
