import type { Corner, Rectangle, Shape } from "~/models/canvas";

export const POINT_HIT_RADIUS = 10;
export const RESIZE_HANDLE_SIZE = 8;

/**
 * Calculate distance between two points
 */
export function getDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

/**
 * Check if a point is within a hit region
 */
export function isPointInCircle(px: number, py: number, cx: number, cy: number, radius: number): boolean {
  return getDistance(px, py, cx, cy) <= radius;
}

/**
 * Check if a point is within a rectangle
 */
export function isPointInRect(px: number, py: number, rx: number, ry: number, rw: number, rh: number): boolean {
  // Normalize rect coordinates just in case width/height are negative
  const x = rw >= 0 ? rx : rx + rw;
  const y = rh >= 0 ? ry : ry + rh;
  const w = Math.abs(rw);
  const h = Math.abs(rh);
  
  return px >= x && px <= x + w && py >= y && py <= y + h;
}

/**
 * Check if a shape is hit by coordinates
 */
export function hitTestShape(shape: Shape, x: number, y: number): boolean {
  if (shape.type === 'point') {
    return isPointInCircle(x, y, shape.x, shape.y, POINT_HIT_RADIUS);
  }
  
  if (shape.type === 'rectangle') {
    return isPointInRect(x, y, shape.x, shape.y, shape.width, shape.height);
  }
  
  return false;
}

/**
 * Sort shapes by z-index (creation time) for rendering
 * Points should always be on top of rectangles regardless of creation time
 */
export function sortShapesForRendering(shapes: Shape[]): Shape[] {
  return [...shapes].sort((a, b) => {
    // If one is point and other is rectangle, point wins
    if (a.type === 'point' && b.type === 'rectangle') return 1;
    if (a.type === 'rectangle' && b.type === 'point') return -1;
    
    // Otherwise sort by creation time
    return a.createdAt - b.createdAt;
  });
}

/**
 * Sort shapes for hit testing (topmost first)
 * Points are checked first, then newer rectangles
 */
export function sortShapesForHitTest(shapes: Shape[]): Shape[] {
  return [...shapes].sort((a, b) => {
    if (a.type === 'point' && b.type === 'rectangle') return -1; // Point comes first (check first)
    if (a.type === 'rectangle' && b.type === 'point') return 1;
    
    return b.createdAt - a.createdAt; // Newer comes first
  });
}

/**
 * Check if a rectangle is a square (within tolerance)
 */
export function isSquare(width: number, height: number): boolean {
  return Math.round(Math.abs(width)) === Math.round(Math.abs(height));
}

/**
 * Get resize handle positions for a rectangle
 */
export function getResizeHandles(rect: Rectangle) {
  const { x, y, width, height } = rect;
  // Handle negative dimensions for normalization
  const normX = width >= 0 ? x : x + width;
  const normY = height >= 0 ? y : y + height;
  const w = Math.abs(width);
  const h = Math.abs(height);
  
  return {
    tl: { x: normX, y: normY },
    tr: { x: normX + w, y: normY },
    bl: { x: normX, y: normY + h },
    br: { x: normX + w, y: normY + h },
  };
}

/**
 * Check if point hits a resize handle
 */
export function hitTestResizeHandle(rect: Rectangle, x: number, y: number): Corner | null {
  const handles = getResizeHandles(rect);
  const radius = RESIZE_HANDLE_SIZE; // Use slightly larger hit area for handles
  
  if (isPointInCircle(x, y, handles.tl.x, handles.tl.y, radius)) return 'tl';
  if (isPointInCircle(x, y, handles.tr.x, handles.tr.y, radius)) return 'tr';
  if (isPointInCircle(x, y, handles.bl.x, handles.bl.y, radius)) return 'bl';
  if (isPointInCircle(x, y, handles.br.x, handles.br.y, radius)) return 'br';
  
  return null;
}
