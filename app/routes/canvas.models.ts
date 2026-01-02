export interface Point {
  id: number;
  x: number;
  y: number;
}

export interface Rectangle {
  id: number;
  startX: number;
  startY: number;
  width: number;
  height: number;
}

export interface SavedDrawing {
  id: string;
  name: string;
  createdAt: string;
  points: Point[];
  rectangles: Rectangle[];
}

export interface DrawingSummary {
  id: string;
  name: string;
  createdAt: string;
}

export interface DrawingsResponse {
  drawings: DrawingSummary[];
}

export type ResizeCorner =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";
