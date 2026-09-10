import { useReducer } from "react";
import type { CanvasAction, CanvasState } from "~/types/canvas";

const MAX_HISTORY = 50;

interface HistoryStore {
  past: CanvasState[];
  present: CanvasState;
  future: CanvasState[];
}

function canvasReducer(state: CanvasState, action: CanvasAction): CanvasState {
  switch (action.type) {
    case "ADD_POINT":
      return { ...state, shapes: [...state.shapes, action.shape] };
    case "ADD_RECT":
      return { ...state, shapes: [...state.shapes, action.shape] };
    case "DELETE_SHAPE":
      return {
        ...state,
        shapes: state.shapes.filter((s) => s.id !== action.id),
        selectedId: state.selectedId === action.id ? null : state.selectedId,
      };
    case "MOVE_SHAPE":
      return {
        ...state,
        shapes: state.shapes.map((s) =>
          s.id === action.id ? { ...s, x: action.x, y: action.y } : s,
        ),
      };
    case "RESIZE_SHAPE":
      return {
        ...state,
        shapes: state.shapes.map((s) => {
          if (s.id !== action.id || s.type === "point") return s;
          const w = Math.abs(action.width);
          const h = Math.abs(action.height);
          return {
            ...s,
            x: action.x,
            y: action.y,
            width: w,
            height: h,
            isSquare: w === h && w > 0,
          };
        }),
      };
    case "SELECT_SHAPE":
      if (state.selectedId === action.id) return state;
      return { ...state, selectedId: action.id };
    case "RESET":
      return { shapes: [], selectedId: null };
    case "RESTORE":
      return action.state;
    default:
      return state;
  }
}

function historyReducer(
  store: HistoryStore,
  action: CanvasAction,
): HistoryStore {
  if (action.type === "UNDO") {
    if (store.past.length === 0) return store;
    const previous = store.past[store.past.length - 1];
    return {
      past: store.past.slice(0, -1),
      present: previous,
      future: [store.present, ...store.future],
    };
  }

  if (action.type === "REDO") {
    if (store.future.length === 0) return store;
    const next = store.future[0];
    return {
      past: [...store.past, store.present],
      present: next,
      future: store.future.slice(1),
    };
  }

  const nextPresent = canvasReducer(store.present, action);
  if (nextPresent === store.present) return store;

  if (action.type === "RESTORE") {
    return {
      past: action.past ?? [],
      present: nextPresent,
      future: action.future ?? [],
    };
  }

  if (action.type === "SELECT_SHAPE") {
    return { ...store, present: nextPresent };
  }

  return {
    past: [...store.past.slice(-(MAX_HISTORY - 1)), store.present],
    present: nextPresent,
    future: [],
  };
}

export function useCanvasHistory(
  initialState: CanvasState,
  initialPast?: CanvasState[],
  initialFuture?: CanvasState[],
) {
  const [store, dispatch] = useReducer(historyReducer, {
    past: initialPast ?? [],
    present: initialState,
    future: initialFuture ?? [],
  });

  return {
    state: store.present,
    dispatch,
    canUndo: store.past.length > 0,
    canRedo: store.future.length > 0,
    past: store.past,
    future: store.future,
  };
}
