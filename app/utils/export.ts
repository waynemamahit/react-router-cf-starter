import type { CanvasShape } from "~/types/canvas";

export function exportToPNG(shapes: CanvasShape[]): string {
  try {
    const { dataUrl } = renderToOffscreen(shapes, "image/png");
    return dataUrl;
  } catch (e) {
    console.error("Failed to export PNG:", e);
    return "";
  }
}

export function exportToJPG(shapes: CanvasShape[]): string {
  try {
    const { dataUrl } = renderToOffscreen(shapes, "image/jpeg");
    return dataUrl;
  } catch (e) {
    console.error("Failed to export JPG:", e);
    return "";
  }
}

export function exportToSVG(shapes: CanvasShape[]): string {
  try {
    const { width, height } = getCanvasDimensions(shapes);
    const margin = 20;
    const svgW = width + margin * 2;
    const svgH = height + margin * 2;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgW} ${svgH}" width="${svgW}" height="${svgH}">`;
    svg += `<rect width="100%" height="100%" fill="#f9fafb"/>`;

    const rects = shapes.filter(
      (
        s,
      ): s is CanvasShape & {
        type: "rect";
        width: number;
        height: number;
        color: string;
      } => s.type === "rect",
    );
    for (const r of rects) {
      const rx = r.x + margin;
      const ry = r.y + margin;
      svg += `<rect x="${rx}" y="${ry}" width="${r.width}" height="${r.height}" fill="rgba(59,130,246,0.15)" stroke="#3b82f6" stroke-width="2"/>`;
    }

    const points = shapes.filter(
      (s): s is CanvasShape & { type: "point" } => s.type === "point",
    );
    for (const p of points) {
      const cx = p.x + margin;
      const cy = p.y + margin;
      svg += `<circle cx="${cx}" cy="${cy}" r="4" fill="#1f2937"/>`;
    }

    svg += "</svg>";
    return svg;
  } catch (e) {
    console.error("Failed to export SVG:", e);
    return "";
  }
}

function renderToOffscreen(
  shapes: CanvasShape[],
  mimeType: "image/png" | "image/jpeg" = "image/png",
): {
  dataUrl: string;
  width: number;
  height: number;
} {
  const { width, height } = getCanvasDimensions(shapes);
  const margin = 20;
  const totalW = width + margin * 2 || 200;
  const totalH = height + margin * 2 || 200;

  try {
    const offscreen = document.createElement("canvas");
    offscreen.width = totalW;
    offscreen.height = totalH;
    const ctx = offscreen.getContext("2d");
    if (!ctx) return { dataUrl: "", width: totalW, height: totalH };
    ctx.fillStyle = "#f9fafb";
    ctx.fillRect(0, 0, totalW, totalH);

    const rects = shapes.filter(
      (
        s,
      ): s is CanvasShape & {
        type: "rect";
        width: number;
        height: number;
        color: string;
      } => s.type === "rect",
    );
    for (const r of rects) {
      ctx.fillStyle = "rgba(59,130,246,0.15)";
      ctx.fillRect(r.x + margin, r.y + margin, r.width, r.height);
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 2;
      ctx.strokeRect(r.x + margin, r.y + margin, r.width, r.height);
    }

    const points = shapes.filter(
      (s): s is CanvasShape & { type: "point" } => s.type === "point",
    );
    for (const p of points) {
      ctx.beginPath();
      ctx.arc(p.x + margin, p.y + margin, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#1f2937";
      ctx.fill();
    }

    return {
      dataUrl: offscreen.toDataURL(mimeType),
      width: totalW,
      height: totalH,
    };
  } catch (e) {
    console.error("Failed to render offscreen canvas:", e);
    return { dataUrl: "", width: totalW, height: totalH };
  }
}

function getCanvasDimensions(shapes: CanvasShape[]): {
  width: number;
  height: number;
} {
  let maxX = 0;
  let maxY = 0;
  for (const s of shapes) {
    if (s.type === "point") {
      maxX = Math.max(maxX, s.x);
      maxY = Math.max(maxY, s.y);
    } else {
      maxX = Math.max(maxX, s.x + s.width);
      maxY = Math.max(maxY, s.y + s.height);
    }
  }
  return { width: Math.max(maxX, 100), height: Math.max(maxY, 100) };
}

function downloadBlob(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
}

export function downloadExport(
  shapes: CanvasShape[],
  format: "png" | "jpg" | "svg",
): boolean {
  if (shapes.length === 0) return false;

  try {
    switch (format) {
      case "png": {
        const pngData = exportToPNG(shapes);
        if (!pngData) return false;
        downloadBlob(pngData, `canvas-export-${Date.now()}.png`);
        break;
      }
      case "jpg": {
        const jpgData = exportToJPG(shapes);
        if (!jpgData) return false;
        downloadBlob(jpgData, `canvas-export-${Date.now()}.jpg`);
        break;
      }
      case "svg": {
        const svg = exportToSVG(shapes);
        if (!svg) return false;
        const blob = new Blob([svg], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        downloadBlob(url, `canvas-export-${Date.now()}.svg`);
        URL.revokeObjectURL(url);
        break;
      }
    }
    return true;
  } catch (e) {
    console.error("Failed to export canvas:", e);
    return false;
  }
}
