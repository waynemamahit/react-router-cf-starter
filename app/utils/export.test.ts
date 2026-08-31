import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CanvasPoint, CanvasRect, CanvasShape } from "~/types/canvas";
import {
  downloadExport,
  exportToJPG,
  exportToPNG,
  exportToSVG,
} from "./export";

const point = (id: string, x: number, y: number): CanvasPoint => ({
  id,
  type: "point",
  x,
  y,
});

const rect = (
  id: string,
  x: number,
  y: number,
  w: number,
  h: number,
): CanvasRect => ({
  id,
  type: "rect",
  x,
  y,
  width: w,
  height: h,
  isSquare: w === h,
  color: "#3b82f6",
});

beforeEach(() => {
  const mockCtx = {
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 0,
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
  } as unknown as CanvasRenderingContext2D;

  const mockCanvas = {
    width: 0,
    height: 0,
    getContext: vi.fn(() => mockCtx),
    toDataURL: vi.fn(() => "data:image/png;base64,mockdata"),
  } as unknown as HTMLCanvasElement;

  const proto = Object.getPrototypeOf(document);
  const origCreateElement = proto.createElement.bind(document);
  vi.spyOn(document, "createElement").mockImplementation(
    (tag: string, options?: ElementCreationOptions) => {
      if (tag === "canvas") return mockCanvas as unknown as HTMLElement;
      return origCreateElement(tag, options);
    },
  );

  vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock");
  vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
});

describe("exportToPNG", () => {
  it("returns a data URL string", () => {
    const shapes: CanvasShape[] = [point("p1", 10, 10)];
    const result = exportToPNG(shapes);
    expect(result).toContain("data:image/png;base64,");
  });

  it("handles empty shapes", () => {
    const result = exportToPNG([]);
    expect(typeof result).toBe("string");
  });
});

describe("exportToJPG", () => {
  it("returns a data URL string", () => {
    const shapes: CanvasShape[] = [rect("r1", 0, 0, 100, 80)];
    const result = exportToJPG(shapes);
    expect(result).toContain("data:image/png;base64,");
  });
});

describe("exportToSVG", () => {
  it("returns valid SVG markup", () => {
    const shapes: CanvasShape[] = [
      point("p1", 50, 50),
      rect("r1", 20, 20, 100, 80),
    ];
    const svg = exportToSVG(shapes);
    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
    expect(svg).toContain('fill="#1f2937"');
    expect(svg).toContain('fill="rgba(59,130,246,0.15)"');
  });

  it("handles empty shapes", () => {
    const svg = exportToSVG([]);
    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
  });
});

describe("downloadExport", () => {
  it("returns false for empty shapes (guard)", () => {
    const result = downloadExport([], "png");
    expect(result).toBe(false);
  });

  it("returns true when export succeeds", () => {
    const shapes: CanvasShape[] = [point("p1", 10, 10)];
    const result = downloadExport(shapes, "png");
    expect(result).toBe(true);
  });

  it("returns true for jpg format", () => {
    const shapes: CanvasShape[] = [point("p1", 10, 10)];
    const result = downloadExport(shapes, "jpg");
    expect(result).toBe(true);
  });

  it("returns true for svg format", () => {
    const shapes: CanvasShape[] = [point("p1", 10, 10)];
    const result = downloadExport(shapes, "svg");
    expect(result).toBe(true);
  });
});
