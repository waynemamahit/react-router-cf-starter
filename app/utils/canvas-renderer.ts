import type {
  CanvasPoint,
  CanvasRect,
  CanvasShape,
  CanvasState,
  InteractionState,
} from "~/types/canvas";

const GRID_SIZE = 20;
const GRID_COLOR = "#e5e7eb";
const BG_COLOR = "#f9fafb";
const POINT_RADIUS = 4;
const POINT_COLOR = "#1f2937";
const RECT_FILL = "rgba(59, 130, 246, 0.15)";
const RECT_STROKE = "#3b82f6";
const RECT_STROKE_WIDTH = 2;
const SELECTION_STROKE = "#f59e0b";
const SELECTION_DASH = [6, 3];
const CORNER_SIZE = 8;
const CORNER_FILL = "#ffffff";
const CORNER_STROKE = "#f59e0b";
const LABEL_BG = "rgba(0,0,0,0.75)";
const LABEL_COLOR = "#ffffff";
const LABEL_FONT = "12px Inter, sans-serif";
const HIT_THRESHOLD = 8;

function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = GRID_COLOR;
  ctx.lineWidth = 1;
  for (let x = 0; x <= width; x += GRID_SIZE) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y <= height; y += GRID_SIZE) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

function drawPoint(ctx: CanvasRenderingContext2D, shape: CanvasPoint) {
  ctx.beginPath();
  ctx.arc(shape.x, shape.y, POINT_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = POINT_COLOR;
  ctx.fill();
}

function drawRect(ctx: CanvasRenderingContext2D, shape: CanvasRect) {
  ctx.fillStyle = RECT_FILL;
  ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
  ctx.strokeStyle = RECT_STROKE;
  ctx.lineWidth = RECT_STROKE_WIDTH;
  ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
}

function drawSelectionHighlight(
  ctx: CanvasRenderingContext2D,
  shape: CanvasShape,
) {
  ctx.strokeStyle = SELECTION_STROKE;
  ctx.lineWidth = 2;
  ctx.setLineDash(SELECTION_DASH);

  if (shape.type === "point") {
    ctx.beginPath();
    ctx.arc(shape.x, shape.y, POINT_RADIUS + 4, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    ctx.strokeRect(shape.x - 2, shape.y - 2, shape.width + 4, shape.height + 4);
  }

  ctx.setLineDash([]);
}

function drawCornerHandles(ctx: CanvasRenderingContext2D, shape: CanvasRect) {
  const handles = [
    { x: shape.x, y: shape.y },
    { x: shape.x + shape.width, y: shape.y },
    { x: shape.x, y: shape.y + shape.height },
    { x: shape.x + shape.width, y: shape.y + shape.height },
  ];

  const half = CORNER_SIZE / 2;
  for (const h of handles) {
    ctx.fillStyle = CORNER_FILL;
    ctx.fillRect(h.x - half, h.y - half, CORNER_SIZE, CORNER_SIZE);
    ctx.strokeStyle = CORNER_STROKE;
    ctx.lineWidth = 2;
    ctx.strokeRect(h.x - half, h.y - half, CORNER_SIZE, CORNER_SIZE);
  }
}

function drawLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  offsetX = 10,
  offsetY = -10,
) {
  ctx.font = LABEL_FONT;
  const metrics = ctx.measureText(text);
  const pad = 4;
  const lx = x + offsetX;
  const ly = y + offsetY;
  ctx.fillStyle = LABEL_BG;
  ctx.fillRect(
    lx - pad,
    ly - metrics.fontBoundingBoxAscent - pad,
    metrics.width + pad * 2,
    metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent + pad * 2,
  );
  ctx.fillStyle = LABEL_COLOR;
  ctx.fillText(text, lx, ly);
}

function drawPreview(ctx: CanvasRenderingContext2D, inter: InteractionState) {
  if (inter.mode !== "drawing") return;

  const x = Math.min(inter.startX, inter.currentX);
  const y = Math.min(inter.startY, inter.currentY);
  const w = Math.abs(inter.currentX - inter.startX);
  const h = inter.isSquare ? w : Math.abs(inter.currentY - inter.startY);

  ctx.fillStyle = "rgba(59, 130, 246, 0.1)";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = RECT_STROKE;
  ctx.lineWidth = RECT_STROKE_WIDTH;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(x, y, w, h);
  ctx.setLineDash([]);

  const label = `${Math.round(w)} x ${Math.round(h)} (area: ${Math.round(w * h)})`;
  drawLabel(ctx, label, x + w / 2, y - 8, -ctx.measureText(label).width / 2, 0);
}

function drawResizeLabel(
  ctx: CanvasRenderingContext2D,
  inter: InteractionState,
) {
  if (inter.mode !== "resizing" || !inter.shapeId || !inter.handle) return;

  let x = inter.origX;
  let y = inter.origY;
  let w = inter.origW;
  let h = inter.origH;
  const dx = inter.currentX - inter.startX;
  const dy = inter.currentY - inter.startY;

  switch (inter.handle) {
    case "se":
      w = inter.origW + dx;
      h = inter.origH + dy;
      break;
    case "sw":
      x = inter.origX + dx;
      w = inter.origW - dx;
      h = inter.origH + dy;
      break;
    case "ne":
      y = inter.origY + dy;
      w = inter.origW + dx;
      h = inter.origH - dy;
      break;
    case "nw":
      x = inter.origX + dx;
      y = inter.origY + dy;
      w = inter.origW - dx;
      h = inter.origH - dy;
      break;
  }

  if (w < 0) {
    x = x + w;
    w = -w;
  }
  if (h < 0) {
    y = y + h;
    h = -h;
  }

  if (inter.isSquare) {
    const size = Math.max(w, h);
    switch (inter.handle) {
      case "nw":
        x = x + w - size;
        y = y + h - size;
        break;
      case "ne":
        y = y + h - size;
        break;
      case "sw":
        x = x + w - size;
        break;
      case "se":
        break;
    }
    w = size;
    h = size;
  }

  const label = `${Math.round(w)} x ${Math.round(h)} (area: ${Math.round(w * h)})`;
  drawLabel(ctx, label, x + w / 2, y - 8, -ctx.measureText(label).width / 2, 0);
}

export function renderCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: CanvasState,
  hoveredShapeId: string | null,
  interaction: InteractionState,
) {
  if (width < 1 || height < 1) return;

  const dpr = window.devicePixelRatio || 1;
  const canvas = ctx.canvas;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  drawGrid(ctx, width, height);

  const rects = state.shapes.filter((s): s is CanvasRect => s.type === "rect");
  for (const shape of rects) {
    drawRect(ctx, shape);
  }

  const points = state.shapes.filter(
    (s): s is CanvasPoint => s.type === "point",
  );
  for (const shape of points) {
    drawPoint(ctx, shape);
  }

  if (state.selectedId) {
    const selected = state.shapes.find((s) => s.id === state.selectedId);
    if (selected) {
      drawSelectionHighlight(ctx, selected);
      if (selected.type === "rect") {
        drawCornerHandles(ctx, selected);
      }
    }
  }

  if (hoveredShapeId) {
    const hovered = state.shapes.find((s) => s.id === hoveredShapeId);
    if (hovered) {
      if (hovered.type === "point") {
        drawLabel(
          ctx,
          `(${Math.round(hovered.x)}, ${Math.round(hovered.y)})`,
          hovered.x,
          hovered.y,
        );
      } else {
        const label = `${Math.round(hovered.width)} x ${Math.round(hovered.height)} (area: ${Math.round(hovered.width * hovered.height)})`;
        drawLabel(
          ctx,
          label,
          hovered.x + hovered.width / 2,
          hovered.y - 8,
          -ctx.measureText(label).width / 2,
          0,
        );
      }
    }
  }

  drawPreview(ctx, interaction);
  drawResizeLabel(ctx, interaction);
}

export function hitTest(
  x: number,
  y: number,
  shapes: CanvasShape[],
): CanvasShape | null {
  for (let i = shapes.length - 1; i >= 0; i--) {
    const shape = shapes[i];
    if (shape.type === "point") {
      const dx = x - shape.x;
      const dy = y - shape.y;
      if (dx * dx + dy * dy <= HIT_THRESHOLD * HIT_THRESHOLD) {
        return shape;
      }
    } else {
      if (
        x >= shape.x &&
        x <= shape.x + shape.width &&
        y >= shape.y &&
        y <= shape.y + shape.height
      ) {
        return shape;
      }
    }
  }
  return null;
}

export function getCornerHandle(
  mx: number,
  my: number,
  shape: CanvasRect,
): "nw" | "ne" | "sw" | "se" | null {
  const half = CORNER_SIZE / 2 + 2;
  const corners: { x: number; y: number; id: "nw" | "ne" | "sw" | "se" }[] = [
    { x: shape.x, y: shape.y, id: "nw" },
    { x: shape.x + shape.width, y: shape.y, id: "ne" },
    { x: shape.x, y: shape.y + shape.height, id: "sw" },
    { x: shape.x + shape.width, y: shape.y + shape.height, id: "se" },
  ];

  for (const c of corners) {
    if (Math.abs(mx - c.x) <= half && Math.abs(my - c.y) <= half) {
      return c.id;
    }
  }
  return null;
}

export function computeResize(
  handle: "nw" | "ne" | "sw" | "se",
  startX: number,
  startY: number,
  currentX: number,
  currentY: number,
  origX: number,
  origY: number,
  origW: number,
  origH: number,
  isSquare: boolean,
): { x: number; y: number; width: number; height: number } {
  let x = origX;
  let y = origY;
  let w = origW;
  let h = origH;
  const dx = currentX - startX;
  const dy = currentY - startY;

  switch (handle) {
    case "se":
      x = origX;
      y = origY;
      w = origW + dx;
      h = origH + dy;
      break;
    case "sw":
      x = origX + dx;
      y = origY;
      w = origW - dx;
      h = origH + dy;
      break;
    case "ne":
      x = origX;
      y = origY + dy;
      w = origW + dx;
      h = origH - dy;
      break;
    case "nw":
      x = origX + dx;
      y = origY + dy;
      w = origW - dx;
      h = origH - dy;
      break;
  }

  if (w < 0) {
    x = x + w;
    w = -w;
  }
  if (h < 0) {
    y = y + h;
    h = -h;
  }

  if (isSquare) {
    const size = Math.max(w, h);
    switch (handle) {
      case "nw":
        x = x + w - size;
        y = y + h - size;
        break;
      case "ne":
        y = y + h - size;
        break;
      case "sw":
        x = x + w - size;
        break;
      case "se":
        break;
    }
    w = size;
    h = size;
  }

  return { x, y, width: w, height: h };
}

export function getStats(shapes: CanvasShape[]): {
  points: number;
  rectangles: number;
  squares: number;
} {
  let points = 0;
  let rectangles = 0;
  let squares = 0;

  for (const s of shapes) {
    if (s.type === "point") {
      points++;
    } else if (s.isSquare) {
      squares++;
    } else {
      rectangles++;
    }
  }

  return { points, rectangles, squares };
}
