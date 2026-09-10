export interface CanvasPoint {
  id: string;
  type: "point";
  x: number;
  y: number;
}

export interface CanvasRect {
  id: string;
  type: "rect";
  x: number;
  y: number;
  width: number;
  height: number;
  isSquare: boolean;
  color: string;
}

export type CanvasShape = CanvasPoint | CanvasRect;

export interface CanvasState {
  shapes: CanvasShape[];
  selectedId: string | null;
}

export type CanvasAction =
  | { type: "ADD_POINT"; shape: CanvasPoint }
  | { type: "ADD_RECT"; shape: CanvasRect }
  | { type: "DELETE_SHAPE"; id: string }
  | { type: "MOVE_SHAPE"; id: string; x: number; y: number }
  | {
      type: "RESIZE_SHAPE";
      id: string;
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | { type: "SELECT_SHAPE"; id: string | null }
  | { type: "RESET" }
  | {
      type: "RESTORE";
      state: CanvasState;
      past?: CanvasState[];
      future?: CanvasState[];
    }
  | { type: "UNDO" }
  | { type: "REDO" };

export interface InteractionState {
  mode: "idle" | "drawing" | "moving" | "resizing";
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  shapeId: string | null;
  handle: "nw" | "ne" | "sw" | "se" | null;
  origX: number;
  origY: number;
  origW: number;
  origH: number;
  isSquare: boolean;
}

export interface CanvasStats {
  points: number;
  rectangles: number;
  squares: number;
}
