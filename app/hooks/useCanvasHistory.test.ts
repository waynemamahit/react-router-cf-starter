import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { CanvasState } from "~/types/canvas";
import { useCanvasHistory } from "./useCanvasHistory";

function emptyState(): CanvasState {
  return { shapes: [], selectedId: null };
}

describe("useCanvasHistory", () => {
  it("initializes with provided state", () => {
    const initial = emptyState();
    const { result } = renderHook(() => useCanvasHistory(initial));

    expect(result.current.state).toEqual(initial);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it("initializes with past and future history", () => {
    const pastState: CanvasState = {
      shapes: [{ id: "p1", type: "point", x: 0, y: 0 }],
      selectedId: null,
    };
    const present: CanvasState = {
      shapes: [{ id: "p2", type: "point", x: 10, y: 10 }],
      selectedId: null,
    };
    const futureState: CanvasState = {
      shapes: [{ id: "p3", type: "point", x: 20, y: 20 }],
      selectedId: null,
    };

    const { result } = renderHook(() =>
      useCanvasHistory(present, [pastState], [futureState]),
    );

    expect(result.current.state).toEqual(present);
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(true);
  });

  it("adds a point and enables undo", () => {
    const { result } = renderHook(() => useCanvasHistory(emptyState()));

    act(() => {
      result.current.dispatch({
        type: "ADD_POINT",
        shape: { id: "p1", type: "point", x: 50, y: 100 },
      });
    });

    expect(result.current.state.shapes).toHaveLength(1);
    expect(result.current.state.shapes[0]).toEqual({
      id: "p1",
      type: "point",
      x: 50,
      y: 100,
    });
    expect(result.current.canUndo).toBe(true);
  });

  it("adds a rectangle and enables undo", () => {
    const { result } = renderHook(() => useCanvasHistory(emptyState()));

    act(() => {
      result.current.dispatch({
        type: "ADD_RECT",
        shape: {
          id: "r1",
          type: "rect",
          x: 10,
          y: 10,
          width: 200,
          height: 100,
          isSquare: false,
          color: "#3b82f6",
        },
      });
    });

    expect(result.current.state.shapes).toHaveLength(1);
    expect(result.current.state.shapes[0].type).toBe("rect");
    expect(result.current.canUndo).toBe(true);
  });

  it("undoes an action", () => {
    const { result } = renderHook(() => useCanvasHistory(emptyState()));

    act(() => {
      result.current.dispatch({
        type: "ADD_POINT",
        shape: { id: "p1", type: "point", x: 50, y: 100 },
      });
    });

    act(() => {
      result.current.dispatch({ type: "UNDO" });
    });

    expect(result.current.state.shapes).toHaveLength(0);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);
  });

  it("redoes an undone action", () => {
    const { result } = renderHook(() => useCanvasHistory(emptyState()));

    act(() => {
      result.current.dispatch({
        type: "ADD_POINT",
        shape: { id: "p1", type: "point", x: 50, y: 100 },
      });
    });

    act(() => {
      result.current.dispatch({ type: "UNDO" });
    });

    act(() => {
      result.current.dispatch({ type: "REDO" });
    });

    expect(result.current.state.shapes).toHaveLength(1);
    expect(result.current.state.shapes[0].id).toBe("p1");
    expect(result.current.canRedo).toBe(false);
  });

  it("undo does nothing when no past", () => {
    const { result } = renderHook(() => useCanvasHistory(emptyState()));
    act(() => {
      result.current.dispatch({ type: "UNDO" });
    });
    expect(result.current.state.shapes).toHaveLength(0);
    expect(result.current.canUndo).toBe(false);
  });

  it("redo does nothing when no future", () => {
    const { result } = renderHook(() => useCanvasHistory(emptyState()));
    act(() => {
      result.current.dispatch({ type: "REDO" });
    });
    expect(result.current.state.shapes).toHaveLength(0);
    expect(result.current.canRedo).toBe(false);
  });

  it("clears future when new action is dispatched after undo", () => {
    const { result } = renderHook(() => useCanvasHistory(emptyState()));

    act(() => {
      result.current.dispatch({
        type: "ADD_POINT",
        shape: { id: "p1", type: "point", x: 0, y: 0 },
      });
    });
    act(() => {
      result.current.dispatch({ type: "UNDO" });
    });

    expect(result.current.canRedo).toBe(true);

    act(() => {
      result.current.dispatch({
        type: "ADD_POINT",
        shape: { id: "p2", type: "point", x: 10, y: 10 },
      });
    });

    expect(result.current.canRedo).toBe(false);
    expect(result.current.state.shapes).toHaveLength(1);
    expect(result.current.state.shapes[0].id).toBe("p2");
  });

  it("deletes a shape", () => {
    const { result } = renderHook(() => useCanvasHistory(emptyState()));

    act(() => {
      result.current.dispatch({
        type: "ADD_RECT",
        shape: {
          id: "r1",
          type: "rect",
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          isSquare: true,
          color: "#3b82f6",
        },
      });
    });

    act(() => {
      result.current.dispatch({ type: "DELETE_SHAPE", id: "r1" });
    });

    expect(result.current.state.shapes).toHaveLength(0);
  });

  it("clears selectedId when deleting the selected shape", () => {
    const { result } = renderHook(() =>
      useCanvasHistory({
        shapes: [{ id: "p1", type: "point", x: 0, y: 0 }],
        selectedId: "p1",
      }),
    );

    act(() => {
      result.current.dispatch({ type: "DELETE_SHAPE", id: "p1" });
    });

    expect(result.current.state.selectedId).toBeNull();
  });

  it("keeps selectedId when deleting a different shape", () => {
    const { result } = renderHook(() =>
      useCanvasHistory({
        shapes: [
          { id: "p1", type: "point", x: 0, y: 0 },
          { id: "p2", type: "point", x: 10, y: 10 },
        ],
        selectedId: "p1",
      }),
    );

    act(() => {
      result.current.dispatch({ type: "DELETE_SHAPE", id: "p2" });
    });

    expect(result.current.state.selectedId).toBe("p1");
  });

  it("moves a shape", () => {
    const { result } = renderHook(() =>
      useCanvasHistory({
        shapes: [
          {
            id: "r1",
            type: "rect",
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            isSquare: true,
            color: "#3b82f6",
          },
        ],
        selectedId: null,
      }),
    );

    act(() => {
      result.current.dispatch({ type: "MOVE_SHAPE", id: "r1", x: 50, y: 75 });
    });

    const moved = result.current.state.shapes[0] as { x: number; y: number };
    expect(moved.x).toBe(50);
    expect(moved.y).toBe(75);
  });

  it("resizes a shape and detects square", () => {
    const { result } = renderHook(() =>
      useCanvasHistory({
        shapes: [
          {
            id: "r1",
            type: "rect",
            x: 0,
            y: 0,
            width: 100,
            height: 50,
            isSquare: false,
            color: "#3b82f6",
          },
        ],
        selectedId: null,
      }),
    );

    act(() => {
      result.current.dispatch({
        type: "RESIZE_SHAPE",
        id: "r1",
        x: 10,
        y: 10,
        width: 80,
        height: 80,
      });
    });

    const resized = result.current.state.shapes[0] as {
      x: number;
      y: number;
      width: number;
      height: number;
      isSquare: boolean;
    };
    expect(resized.x).toBe(10);
    expect(resized.y).toBe(10);
    expect(resized.width).toBe(80);
    expect(resized.height).toBe(80);
    expect(resized.isSquare).toBe(true);
  });

  it("resizes a shape and detects non-square", () => {
    const { result } = renderHook(() =>
      useCanvasHistory({
        shapes: [
          {
            id: "r1",
            type: "rect",
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            isSquare: true,
            color: "#3b82f6",
          },
        ],
        selectedId: null,
      }),
    );

    act(() => {
      result.current.dispatch({
        type: "RESIZE_SHAPE",
        id: "r1",
        x: 10,
        y: 10,
        width: 100,
        height: 50,
      });
    });

    const resized = result.current.state.shapes[0] as { isSquare: boolean };
    expect(resized.isSquare).toBe(false);
  });

  it("selects and deselects a shape", () => {
    const { result } = renderHook(() =>
      useCanvasHistory({
        shapes: [{ id: "p1", type: "point", x: 0, y: 0 }],
        selectedId: null,
      }),
    );

    act(() => {
      result.current.dispatch({ type: "SELECT_SHAPE", id: "p1" });
    });
    expect(result.current.state.selectedId).toBe("p1");

    act(() => {
      result.current.dispatch({ type: "SELECT_SHAPE", id: null });
    });
    expect(result.current.state.selectedId).toBeNull();
  });

  it("select does not create undo entry", () => {
    const { result } = renderHook(() =>
      useCanvasHistory({
        shapes: [{ id: "p1", type: "point", x: 0, y: 0 }],
        selectedId: null,
      }),
    );

    act(() => {
      result.current.dispatch({ type: "SELECT_SHAPE", id: "p1" });
    });
    expect(result.current.canUndo).toBe(false);
  });

  it("resets to empty state", () => {
    const { result } = renderHook(() =>
      useCanvasHistory({
        shapes: [{ id: "p1", type: "point", x: 0, y: 0 }],
        selectedId: "p1",
      }),
    );

    act(() => {
      result.current.dispatch({ type: "RESET" });
    });

    expect(result.current.state.shapes).toHaveLength(0);
    expect(result.current.state.selectedId).toBeNull();
  });

  it("restores state from RESTORE action", () => {
    const { result } = renderHook(() => useCanvasHistory(emptyState()));

    const newState: CanvasState = {
      shapes: [
        {
          id: "r1",
          type: "rect",
          x: 0,
          y: 0,
          width: 50,
          height: 50,
          isSquare: true,
          color: "#3b82f6",
        },
      ],
      selectedId: "r1",
    };

    act(() => {
      result.current.dispatch({ type: "RESTORE", state: newState });
    });

    expect(result.current.state).toEqual(newState);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it("restores state with past and future history", () => {
    const pastState: CanvasState = {
      shapes: [{ id: "p1", type: "point", x: 0, y: 0 }],
      selectedId: null,
    };
    const present: CanvasState = {
      shapes: [{ id: "p2", type: "point", x: 10, y: 10 }],
      selectedId: null,
    };
    const futureState: CanvasState = {
      shapes: [{ id: "p3", type: "point", x: 20, y: 20 }],
      selectedId: null,
    };

    const { result } = renderHook(() => useCanvasHistory(emptyState(), [], []));

    act(() => {
      result.current.dispatch({
        type: "RESTORE",
        state: present,
        past: [pastState],
        future: [futureState],
      });
    });

    expect(result.current.state).toEqual(present);
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(true);

    act(() => {
      result.current.dispatch({ type: "UNDO" });
    });
    expect(result.current.state).toEqual(pastState);

    act(() => {
      result.current.dispatch({ type: "REDO" });
    });
    expect(result.current.state).toEqual(present);

    act(() => {
      result.current.dispatch({ type: "REDO" });
    });
    expect(result.current.state).toEqual(futureState);
  });

  it("limits history to 50 entries", () => {
    const { result } = renderHook(() => useCanvasHistory(emptyState()));

    act(() => {
      for (let i = 0; i < 60; i++) {
        result.current.dispatch({
          type: "ADD_POINT",
          shape: { id: `p${i}`, type: "point", x: i, y: i },
        });
      }
    });

    expect(result.current.state.shapes).toHaveLength(60);
    expect(result.current.past.length).toBeLessThanOrEqual(50);
  });
});
