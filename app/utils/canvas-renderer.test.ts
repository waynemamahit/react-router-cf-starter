import { describe, expect, it } from "vitest";
import type { CanvasRect, CanvasShape } from "~/types/canvas";
import {
  computeResize,
  getCornerHandle,
  getStats,
  hitTest,
} from "./canvas-renderer";

describe("hitTest", () => {
  const shapes: CanvasShape[] = [
    { id: "p1", type: "point", x: 100, y: 200 },
    {
      id: "r1",
      type: "rect",
      x: 50,
      y: 50,
      width: 100,
      height: 80,
      isSquare: false,
      color: "#3b82f6",
    },
    {
      id: "s1",
      type: "rect",
      x: 200,
      y: 200,
      width: 60,
      height: 60,
      isSquare: true,
      color: "#3b82f6",
    },
  ];

  it("returns null when no shapes match", () => {
    expect(hitTest(0, 0, shapes)).toBeNull();
  });

  it("hits a point within threshold", () => {
    const hit = hitTest(103, 198, shapes);
    expect(hit).not.toBeNull();
    expect(hit?.id).toBe("p1");
  });

  it("misses a point outside threshold", () => {
    expect(hitTest(120, 220, shapes)).toBeNull();
  });

  it("hits a rectangle inside its bounds", () => {
    const hit = hitTest(80, 70, shapes);
    expect(hit).not.toBeNull();
    expect(hit?.id).toBe("r1");
  });

  it("misses a rectangle outside its bounds", () => {
    expect(
      hitTest(200, 200, [
        {
          id: "r2",
          type: "rect",
          x: 0,
          y: 0,
          width: 50,
          height: 50,
          isSquare: false,
          color: "#3b82f6",
        },
      ]),
    ).toBeNull();
  });

  it("returns the last shape when overlapping (z-order)", () => {
    const overlapping: CanvasShape[] = [
      { id: "back", type: "point", x: 50, y: 50 },
      {
        id: "front",
        type: "rect",
        x: 40,
        y: 40,
        width: 100,
        height: 100,
        isSquare: false,
        color: "#3b82f6",
      },
    ];
    const hit = hitTest(50, 50, overlapping);
    expect(hit?.id).toBe("front");
  });
});

describe("getCornerHandle", () => {
  const rect: CanvasRect = {
    id: "r1",
    type: "rect",
    x: 100,
    y: 100,
    width: 200,
    height: 150,
    isSquare: false,
    color: "#3b82f6",
  };

  it("returns nw for top-left corner", () => {
    expect(getCornerHandle(100, 100, rect)).toBe("nw");
  });

  it("returns ne for top-right corner", () => {
    expect(getCornerHandle(300, 100, rect)).toBe("ne");
  });

  it("returns sw for bottom-left corner", () => {
    expect(getCornerHandle(100, 250, rect)).toBe("sw");
  });

  it("returns se for bottom-right corner", () => {
    expect(getCornerHandle(300, 250, rect)).toBe("se");
  });

  it("returns null away from corners", () => {
    expect(getCornerHandle(200, 175, rect)).toBeNull();
  });
});

describe("computeResize", () => {
  it("resizes se handle", () => {
    const result = computeResize(
      "se",
      100,
      100,
      150,
      150,
      50,
      50,
      200,
      100,
      false,
    );
    expect(result).toEqual({ x: 50, y: 50, width: 250, height: 150 });
  });

  it("resizes nw handle", () => {
    const result = computeResize(
      "nw",
      100,
      100,
      150,
      150,
      50,
      50,
      200,
      100,
      false,
    );
    expect(result).toEqual({ x: 100, y: 100, width: 150, height: 50 });
  });

  it("resizes ne handle", () => {
    const result = computeResize(
      "ne",
      100,
      100,
      150,
      150,
      50,
      50,
      200,
      100,
      false,
    );
    expect(result).toEqual({ x: 50, y: 100, width: 250, height: 50 });
  });

  it("resizes sw handle", () => {
    const result = computeResize(
      "sw",
      100,
      100,
      150,
      150,
      50,
      50,
      200,
      100,
      false,
    );
    expect(result).toEqual({ x: 100, y: 50, width: 150, height: 150 });
  });

  it("constrains to square when isSquare is true", () => {
    const result = computeResize(
      "se",
      100,
      100,
      200,
      120,
      50,
      50,
      100,
      100,
      true,
    );
    expect(result.width).toBe(result.height);
    expect(result.width).toBe(200);
  });

  it("nw square keeps SE corner fixed when drag past opposite corner", () => {
    // Original rect at (50,50) size 200x100 → SE corner at (250,150)
    // Drag NW from (100,100) to (300,200) → past the SE corner
    const result = computeResize(
      "nw",
      100,
      100,
      300,
      200,
      50,
      50,
      200,
      100,
      true,
    );
    // SE corner should stay at (250, 150)
    expect(result.x + result.width).toBe(250);
    expect(result.y + result.height).toBe(150);
    expect(result.width).toBe(result.height);
  });

  it("nw square constrains size to max dimension", () => {
    // Original rect at (50,50) size 200x100
    // Drag NW from (100,100) to (180,130) → dx=80, dy=30
    // After switch: x=130, y=80, w=120, h=70
    // Square: size=max(120,70)=120, SE corner fixed at (250,150)
    const result = computeResize(
      "nw",
      100,
      100,
      180,
      130,
      50,
      50,
      200,
      100,
      true,
    );
    expect(result.width).toBe(result.height);
    expect(result.width).toBe(120);
    expect(result.x + result.width).toBe(250);
    expect(result.y + result.height).toBe(150);
  });

  it("ne square keeps SW corner fixed", () => {
    // Original rect at (50,50) size 200x100 → SW corner at (50,150)
    // Drag NE from (300,100) to (350,80)
    const result = computeResize(
      "ne",
      300,
      100,
      350,
      80,
      50,
      50,
      200,
      100,
      true,
    );
    // SW corner should stay at (50, 150)
    expect(result.x).toBe(50);
    expect(result.y + result.height).toBe(150);
    expect(result.width).toBe(result.height);
  });

  it("sw square keeps NE corner fixed", () => {
    // Original rect at (50,50) size 200x100 → NE corner at (250,50)
    // Drag SW from (100,150) to (80,200)
    const result = computeResize(
      "sw",
      100,
      150,
      80,
      200,
      50,
      50,
      200,
      100,
      true,
    );
    // NE corner should stay at (250, 50)
    expect(result.x + result.width).toBe(250);
    expect(result.y).toBe(50);
    expect(result.width).toBe(result.height);
  });

  it("se square keeps NW corner fixed", () => {
    // Original rect at (50,50) size 100x100
    // Drag SE from (150,150) to (250,200)
    const result = computeResize(
      "se",
      150,
      150,
      250,
      200,
      50,
      50,
      100,
      100,
      true,
    );
    // NW corner should stay at (50, 50)
    expect(result.x).toBe(50);
    expect(result.y).toBe(50);
    expect(result.width).toBe(result.height);
    expect(result.width).toBe(200);
  });

  it("normalizes negative dimensions for non-square", () => {
    const result = computeResize(
      "nw",
      100,
      100,
      160,
      160,
      50,
      50,
      100,
      100,
      false,
    );
    expect(result.width).toBe(40);
    expect(result.height).toBe(40);
  });
});

describe("getStats", () => {
  it("counts points, rectangles, and squares", () => {
    const shapes: CanvasShape[] = [
      { id: "p1", type: "point", x: 0, y: 0 },
      { id: "p2", type: "point", x: 10, y: 10 },
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
      {
        id: "s1",
        type: "rect",
        x: 0,
        y: 0,
        width: 80,
        height: 80,
        isSquare: true,
        color: "#3b82f6",
      },
      {
        id: "s2",
        type: "rect",
        x: 0,
        y: 0,
        width: 60,
        height: 60,
        isSquare: true,
        color: "#3b82f6",
      },
    ];
    expect(getStats(shapes)).toEqual({ points: 2, rectangles: 1, squares: 2 });
  });

  it("returns zeros for empty array", () => {
    expect(getStats([])).toEqual({ points: 0, rectangles: 0, squares: 0 });
  });
});
