import type { CanvasState, Point, Rectangle } from "~/models/canvas";
import { getResizeHandles, isSquare } from "./geometry";

const COLORS = {
  POINT: '#3b82f6', // blue-500
  RECTANGLE: '#10b981', // emerald-500
  SQUARE: '#8b5cf6', // violet-500
  SELECTED: '#f59e0b', // amber-500
  TEXT_BG: 'rgba(0, 0, 0, 0.75)',
  TEXT_COLOR: '#ffffff',
  GUIDE_LINE: 'rgba(59, 130, 246, 0.5)',
};

export function clearCanvas(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.clearRect(0, 0, width, height);
}

export function drawPoint(ctx: CanvasRenderingContext2D, point: Point, isSelected: boolean) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
  ctx.fillStyle = isSelected ? COLORS.SELECTED : COLORS.POINT;
  ctx.fill();
  
  if (isSelected) {
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    
    // Selection indicator ring
    ctx.beginPath();
    ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
    ctx.strokeStyle = COLORS.SELECTED;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  ctx.restore();
}

export function drawRectangle(ctx: CanvasRenderingContext2D, rect: Rectangle, isSelected: boolean) {
  ctx.save();
  
  const square = isSquare(rect.width, rect.height);
  ctx.fillStyle = square ? COLORS.SQUARE : COLORS.RECTANGLE;
  ctx.globalAlpha = 0.2;
  ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  
  ctx.globalAlpha = 1.0;
  ctx.strokeStyle = isSelected ? COLORS.SELECTED : (square ? COLORS.SQUARE : COLORS.RECTANGLE);
  ctx.lineWidth = isSelected ? 2 : 1;
  ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
  
  if (isSelected) {
    drawResizeHandles(ctx, rect);
  }
  
  ctx.restore();
}

function drawResizeHandles(ctx: CanvasRenderingContext2D, rect: Rectangle) {
  const handles = getResizeHandles(rect);
  const size = 6;
  
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = COLORS.SELECTED;
  ctx.lineWidth = 1;
  
  const drawHandle = (x: number, y: number) => {
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  };
  
  drawHandle(handles.tl.x, handles.tl.y);
  drawHandle(handles.tr.x, handles.tr.y);
  drawHandle(handles.bl.x, handles.bl.y);
  drawHandle(handles.br.x, handles.br.y);
}

export function drawLabel(ctx: CanvasRenderingContext2D, text: string, x: number, y: number) {
  ctx.save();
  ctx.font = '12px Inter, system-ui, sans-serif';
  const padding = 4;
  const metrics = ctx.measureText(text);
  const width = metrics.width + padding * 2;
  const height = 20;
  
  ctx.fillStyle = COLORS.TEXT_BG;
  ctx.beginPath();
  ctx.roundRect(x, y - height - 4, width, height, 4);
  ctx.fill();
  
  ctx.fillStyle = COLORS.TEXT_COLOR;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + padding, y - height / 2 - 4);
  ctx.restore();
}

export function renderCanvas(
  ctx: CanvasRenderingContext2D, 
  state: CanvasState,
  width: number,
  height: number
) {
  clearCanvas(ctx, width, height);
  
  // Render shapes (sorted by Z-index in component, but just in case iterate carefully)
  // Assuming shapes passed here are already sorted for rendering (Base -> Top)
  state.shapes.forEach(shape => {
    const isSelected = shape.id === state.selectedId;
    
    if (shape.type === 'point') {
      drawPoint(ctx, shape as Point, isSelected);
    } else if (shape.type === 'rectangle') {
      drawRectangle(ctx, shape as Rectangle, isSelected);
    }
  });
  
  // Draw labels for selected or hovered items
  // This logic might need refinement based on exact reqs, but for now:
  if (state.selectedId) {
    const selected = state.shapes.find(s => s.id === state.selectedId);
    if (selected) {
      if (selected.type === 'point') {
        const p = selected as Point;
        drawLabel(ctx, `x: ${Math.round(p.x)}, y: ${Math.round(p.y)}`, p.x + 10, p.y);
      } else {
        const r = selected as Rectangle;
        const area = Math.abs(r.width * r.height);
        const w = Math.round(Math.abs(r.width));
        const h = Math.round(Math.abs(r.height));
        // Draw label near the bottom-right of the rect
        const lx = r.width >= 0 ? r.x + r.width : r.x;
        const ly = r.height >= 0 ? r.y + r.height : r.y;
        
        drawLabel(ctx, `${w} × ${h} (Area: ${Math.round(area)})`, lx + 5, ly);
      }
    }
  }
}
