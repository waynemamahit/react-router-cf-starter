export type ShapeType = 'point' | 'rectangle';

export interface BaseShape {
  id: string;
  type: ShapeType;
  createdAt: number;
}

export interface Point extends BaseShape {
  type: 'point';
  x: number;
  y: number;
}

export interface Rectangle extends BaseShape {
  type: 'rectangle';
  x: number;
  y: number;
  width: number;
  height: number;
}

export type Shape = Point | Rectangle;

export type Corner = 'tl' | 'tr' | 'bl' | 'br';

export interface CanvasState {
  shapes: Shape[];
  selectedId: string | null;
  // UI state not necessarily persisted but needed for runtime
  hoveredShapeId?: string | null;
  isDragging?: boolean;
  isResizing?: boolean;
  resizeCorner?: Corner | null;
  dragStartX?: number;
  dragStartY?: number;
}

export interface HistoryState {
  past: CanvasState[];
  present: CanvasState;
  future: CanvasState[];
}
