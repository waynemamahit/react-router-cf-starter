import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Canvas from "./canvas";

describe("Requirement: Canvas Route", () => {
  it("Scenario: Navigate to canvas page - displays canvas page with clickable area", () => {
    render(<Canvas />);

    const canvasArea = screen.getByTestId("canvas-area");
    expect(canvasArea).toBeInTheDocument();
    expect(screen.getByText("Interactive Canvas")).toBeInTheDocument();
    expect(
      screen.getByText(/Click to place points, drag to draw rectangles/i),
    ).toBeInTheDocument();
  });
});

describe("Requirement: Visual Point Markers", () => {
  it("Scenario: Click creates point marker - renders point at click location", () => {
    render(<Canvas />);

    const canvasArea = screen.getByTestId("canvas-area");
    const rect = canvasArea.getBoundingClientRect();

    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 100,
      clientY: rect.top + 150,
    });

    fireEvent.mouseUp(canvasArea, {
      clientX: rect.left + 100,
      clientY: rect.top + 150,
    });

    const pointMarkers = screen.getAllByTestId("point-marker");
    expect(pointMarkers).toHaveLength(1);
    expect(pointMarkers[0]).toBeInTheDocument();
    expect(pointMarkers[0]).toHaveClass("bg-red-500", "rounded-full");
  });

  it("Scenario: Multiple points are displayed - all points remain visible", () => {
    render(<Canvas />);

    const canvasArea = screen.getByTestId("canvas-area");
    const rect = canvasArea.getBoundingClientRect();

    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 50,
      clientY: rect.top + 75,
    });
    fireEvent.mouseUp(canvasArea, {
      clientX: rect.left + 50,
      clientY: rect.top + 75,
    });

    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 200,
      clientY: rect.top + 300,
    });
    fireEvent.mouseUp(canvasArea, {
      clientX: rect.left + 200,
      clientY: rect.top + 300,
    });

    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 350,
      clientY: rect.top + 100,
    });
    fireEvent.mouseUp(canvasArea, {
      clientX: rect.left + 350,
      clientY: rect.top + 100,
    });

    const pointMarkers = screen.getAllByTestId("point-marker");
    expect(pointMarkers).toHaveLength(3);

    expect(screen.getByText(/Points: 3/)).toBeInTheDocument();
  });

  it("displays message when no points are placed", () => {
    render(<Canvas />);

    expect(
      screen.getByText(/Click to place points or drag to draw rectangles/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Points: 0/)).toBeInTheDocument();
  });
});

describe("Requirement: Coordinate Labels", () => {
  it("Scenario: Point shows coordinate label - label displays near point with correct format", () => {
    render(<Canvas />);

    const canvasArea = screen.getByTestId("canvas-area");
    const rect = canvasArea.getBoundingClientRect();

    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 120,
      clientY: rect.top + 180,
    });

    fireEvent.mouseUp(canvasArea, {
      clientX: rect.left + 120,
      clientY: rect.top + 180,
    });

    const coordinateLabels = screen.getAllByTestId("coordinate-label");
    expect(coordinateLabels).toHaveLength(1);
    expect(coordinateLabels[0]).toHaveTextContent("X: 120, Y: 180");
  });

  it("Scenario: Multiple labels are visible - each point has its own label", () => {
    render(<Canvas />);

    const canvasArea = screen.getByTestId("canvas-area");
    const rect = canvasArea.getBoundingClientRect();

    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 50,
      clientY: rect.top + 60,
    });
    fireEvent.mouseUp(canvasArea, {
      clientX: rect.left + 50,
      clientY: rect.top + 60,
    });

    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 150,
      clientY: rect.top + 200,
    });
    fireEvent.mouseUp(canvasArea, {
      clientX: rect.left + 150,
      clientY: rect.top + 200,
    });

    const coordinateLabels = screen.getAllByTestId("coordinate-label");
    expect(coordinateLabels).toHaveLength(2);

    expect(coordinateLabels[0]).toHaveTextContent("X: 50, Y: 60");
    expect(coordinateLabels[1]).toHaveTextContent("X: 150, Y: 200");

    const pointMarkers = screen.getAllByTestId("point-marker");
    expect(pointMarkers).toHaveLength(2);
  });

  it("coordinate labels use correct format 'X: {x}, Y: {y}'", () => {
    render(<Canvas />);

    const canvasArea = screen.getByTestId("canvas-area");
    const rect = canvasArea.getBoundingClientRect();

    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 250,
      clientY: rect.top + 300,
    });

    fireEvent.mouseUp(canvasArea, {
      clientX: rect.left + 250,
      clientY: rect.top + 300,
    });

    const label = screen.getByTestId("coordinate-label");
    expect(label.textContent).toMatch(/^X: \d+, Y: \d+$/);
  });
});

describe("Requirement: Visual Canvas Area", () => {
  it("Scenario: Canvas is visually distinct - renders with visible boundaries and minimum dimensions", () => {
    render(<Canvas />);

    const canvasArea = screen.getByTestId("canvas-area");
    expect(canvasArea).toBeInTheDocument();

    expect(canvasArea.style.minHeight).toBe("400px");
    expect(canvasArea.style.minWidth).toBe("400px");

    expect(canvasArea).toHaveClass("border-4", "border-blue-500");
  });

  it("canvas is a button element for accessibility", () => {
    render(<Canvas />);

    const canvasArea = screen.getByTestId("canvas-area");
    expect(canvasArea.tagName).toBe("BUTTON");
    expect(canvasArea).toHaveAttribute("type", "button");
  });

  it("canvas has proper styling for interaction", () => {
    render(<Canvas />);

    const canvasArea = screen.getByTestId("canvas-area");
    expect(canvasArea).toHaveClass("h-[600px]");
    expect(canvasArea).toHaveClass("hover:border-blue-600");
  });
});

describe("Requirement: Rectangle Drawing", () => {
  it("Scenario: Draw rectangle with drag - creates rectangle on mousedown+move+up", () => {
    render(<Canvas />);

    const canvasArea = screen.getByTestId("canvas-area");
    const rect = canvasArea.getBoundingClientRect();

    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 100,
      clientY: rect.top + 100,
    });

    fireEvent.mouseMove(canvasArea, {
      clientX: rect.left + 200,
      clientY: rect.top + 150,
    });

    fireEvent.mouseUp(canvasArea, {
      clientX: rect.left + 200,
      clientY: rect.top + 150,
    });

    const rectangles = screen.getAllByTestId(/^rectangle-\d+$/);
    expect(rectangles).toHaveLength(1);
    expect(rectangles[0]).toHaveStyle({
      left: "100px",
      top: "100px",
      width: "100px",
      height: "50px",
    });
  });

  it("Scenario: Complete rectangle drawing - rectangle remains visible with dimensions", () => {
    render(<Canvas />);

    const canvasArea = screen.getByTestId("canvas-area");
    const rect = canvasArea.getBoundingClientRect();

    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 50,
      clientY: rect.top + 50,
    });

    fireEvent.mouseMove(canvasArea, {
      clientX: rect.left + 150,
      clientY: rect.top + 100,
    });

    fireEvent.mouseUp(canvasArea, {
      clientX: rect.left + 150,
      clientY: rect.top + 100,
    });

    const dimensionLabels = screen.getAllByTestId("dimension-label");
    expect(dimensionLabels).toHaveLength(1);
    expect(dimensionLabels[0]).toHaveTextContent("W: 100, H: 50, Area: 5000");
  });

  it("handles negative dimensions when dragging in opposite directions", () => {
    render(<Canvas />);

    const canvasArea = screen.getByTestId("canvas-area");
    const rect = canvasArea.getBoundingClientRect();

    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 200,
      clientY: rect.top + 200,
    });

    fireEvent.mouseMove(canvasArea, {
      clientX: rect.left + 100,
      clientY: rect.top + 100,
    });

    fireEvent.mouseUp(canvasArea, {
      clientX: rect.left + 100,
      clientY: rect.top + 100,
    });

    const rectangles = screen.getAllByTestId(/^rectangle-\d+$/);
    expect(rectangles).toHaveLength(1);
    expect(rectangles[0]).toHaveStyle({
      left: "100px",
      top: "100px",
      width: "100px",
      height: "100px",
    });
  });
});

describe("Requirement: Square Drawing with Shift Modifier", () => {
  it("Scenario: Draw square with Shift key - constrains shape to 1:1 aspect ratio", () => {
    render(<Canvas />);

    const canvasArea = screen.getByTestId("canvas-area");
    const rect = canvasArea.getBoundingClientRect();

    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 100,
      clientY: rect.top + 100,
    });

    fireEvent.keyDown(window, { key: "Shift" });

    fireEvent.mouseMove(canvasArea, {
      clientX: rect.left + 200,
      clientY: rect.top + 180,
    });

    fireEvent.mouseUp(canvasArea, {
      clientX: rect.left + 200,
      clientY: rect.top + 180,
    });

    fireEvent.keyUp(window, { key: "Shift" });

    const rectangles = screen.getAllByTestId(/^rectangle-\d+$/);
    expect(rectangles).toHaveLength(1);
    expect(rectangles[0]).toHaveStyle({
      left: "100px",
      top: "100px",
      width: "80px",
      height: "80px",
    });
  });

  it("Scenario: Press Shift during drag - transitions from rectangle to square mode", () => {
    render(<Canvas />);

    const canvasArea = screen.getByTestId("canvas-area");
    const rect = canvasArea.getBoundingClientRect();

    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 50,
      clientY: rect.top + 50,
    });

    fireEvent.mouseMove(canvasArea, {
      clientX: rect.left + 150,
      clientY: rect.top + 100,
    });

    let currentRect = screen.queryByTestId("current-rectangle");
    expect(currentRect).toHaveStyle({
      width: "100px",
      height: "50px",
    });

    fireEvent.keyDown(window, { key: "Shift" });

    fireEvent.mouseMove(canvasArea, {
      clientX: rect.left + 150,
      clientY: rect.top + 100,
    });

    currentRect = screen.queryByTestId("current-rectangle");
    expect(currentRect).toHaveStyle({
      width: "50px",
      height: "50px",
    });

    fireEvent.keyUp(window, { key: "Shift" });
  });
});

describe("Requirement: Shape Dimension Display", () => {
  it("Scenario: Show dimensions during drawing - displays current width and height", () => {
    render(<Canvas />);

    const canvasArea = screen.getByTestId("canvas-area");
    const rect = canvasArea.getBoundingClientRect();

    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 100,
      clientY: rect.top + 100,
    });

    fireEvent.mouseMove(canvasArea, {
      clientX: rect.left + 250,
      clientY: rect.top + 200,
    });

    const currentDimensionLabel = screen.getByTestId("current-dimension-label");
    expect(currentDimensionLabel).toBeInTheDocument();
    expect(currentDimensionLabel).toHaveTextContent(
      "W: 150, H: 100, Area: 15000",
    );

    fireEvent.mouseUp(canvasArea, {
      clientX: rect.left + 250,
      clientY: rect.top + 200,
    });
  });

  it("Scenario: Show dimensions for completed shapes - dimensions remain visible", () => {
    render(<Canvas />);

    const canvasArea = screen.getByTestId("canvas-area");
    const rect = canvasArea.getBoundingClientRect();

    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 50,
      clientY: rect.top + 50,
    });

    fireEvent.mouseMove(canvasArea, {
      clientX: rect.left + 150,
      clientY: rect.top + 120,
    });

    fireEvent.mouseUp(canvasArea, {
      clientX: rect.left + 150,
      clientY: rect.top + 120,
    });

    const dimensionLabels = screen.getAllByTestId("dimension-label");
    expect(dimensionLabels).toHaveLength(1);
    expect(dimensionLabels[0]).toHaveTextContent("W: 100, H: 70, Area: 7000");
    expect(dimensionLabels[0].textContent).toMatch(
      /^W: \d+, H: \d+, Area: \d+$/,
    );
  });
});

describe("Requirement: Mixed Interaction Modes", () => {
  it("Scenario: Simple click creates point - no rectangle created for small movements", () => {
    render(<Canvas />);

    const canvasArea = screen.getByTestId("canvas-area");
    const rect = canvasArea.getBoundingClientRect();

    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 100,
      clientY: rect.top + 100,
    });

    fireEvent.mouseMove(canvasArea, {
      clientX: rect.left + 102,
      clientY: rect.top + 101,
    });

    fireEvent.mouseUp(canvasArea, {
      clientX: rect.left + 102,
      clientY: rect.top + 101,
    });

    const pointMarkers = screen.getAllByTestId("point-marker");
    expect(pointMarkers).toHaveLength(1);

    const rectangles = screen.queryAllByTestId(/^rectangle-\d+$/);
    expect(rectangles).toHaveLength(0);
  });

  it("Scenario: Click and drag creates shape - drag beyond threshold creates rectangle", () => {
    render(<Canvas />);

    const canvasArea = screen.getByTestId("canvas-area");
    const rect = canvasArea.getBoundingClientRect();

    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 100,
      clientY: rect.top + 100,
    });

    fireEvent.mouseMove(canvasArea, {
      clientX: rect.left + 120,
      clientY: rect.top + 120,
    });

    fireEvent.mouseUp(canvasArea, {
      clientX: rect.left + 120,
      clientY: rect.top + 120,
    });

    const rectangles = screen.getAllByTestId(/^rectangle-\d+$/);
    expect(rectangles).toHaveLength(1);

    const pointMarkers = screen.queryAllByTestId("point-marker");
    expect(pointMarkers).toHaveLength(0);
  });

  it("multiple rectangles and points coexist", () => {
    render(<Canvas />);

    const canvasArea = screen.getByTestId("canvas-area");
    const rect = canvasArea.getBoundingClientRect();

    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 50,
      clientY: rect.top + 50,
    });
    fireEvent.mouseMove(canvasArea, {
      clientX: rect.left + 100,
      clientY: rect.top + 100,
    });
    fireEvent.mouseUp(canvasArea, {
      clientX: rect.left + 100,
      clientY: rect.top + 100,
    });

    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 200,
      clientY: rect.top + 200,
    });
    fireEvent.mouseUp(canvasArea, {
      clientX: rect.left + 200,
      clientY: rect.top + 200,
    });

    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 150,
      clientY: rect.top + 150,
    });
    fireEvent.mouseMove(canvasArea, {
      clientX: rect.left + 250,
      clientY: rect.top + 200,
    });
    fireEvent.mouseUp(canvasArea, {
      clientX: rect.left + 250,
      clientY: rect.top + 200,
    });

    const rectangles = screen.getAllByTestId(/^rectangle-\d+$/);
    expect(rectangles).toHaveLength(2);

    const pointMarkers = screen.getAllByTestId("point-marker");
    expect(pointMarkers).toHaveLength(1);

    expect(screen.getByText(/Points: 1/)).toBeInTheDocument();
    expect(screen.getByText(/Rectangles: 2/)).toBeInTheDocument();
  });
});

describe("Integration", () => {
  it("point markers and labels are positioned correctly", () => {
    render(<Canvas />);

    const canvasArea = screen.getByTestId("canvas-area");
    const rect = canvasArea.getBoundingClientRect();

    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 100,
      clientY: rect.top + 200,
    });

    fireEvent.mouseUp(canvasArea, {
      clientX: rect.left + 100,
      clientY: rect.top + 200,
    });

    const pointContainer = screen.getByTestId(/^point-\d+$/);
    expect(pointContainer).toHaveStyle({
      left: "100px",
      top: "200px",
    });
  });

  it("handles multiple clicks with unique IDs", () => {
    render(<Canvas />);

    const canvasArea = screen.getByTestId("canvas-area");
    const rect = canvasArea.getBoundingClientRect();

    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 10,
      clientY: rect.top + 10,
    });
    fireEvent.mouseUp(canvasArea, {
      clientX: rect.left + 10,
      clientY: rect.top + 10,
    });

    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 20,
      clientY: rect.top + 20,
    });
    fireEvent.mouseUp(canvasArea, {
      clientX: rect.left + 20,
      clientY: rect.top + 20,
    });

    const points = screen.getAllByTestId(/^point-\d+$/);
    expect(points).toHaveLength(2);

    const point1Id = points[0].getAttribute("data-testid");
    const point2Id = points[1].getAttribute("data-testid");
    expect(point1Id).not.toBe(point2Id);
  });

  it("current rectangle preview disappears after completion", () => {
    render(<Canvas />);

    const canvasArea = screen.getByTestId("canvas-area");
    const rect = canvasArea.getBoundingClientRect();

    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 100,
      clientY: rect.top + 100,
    });

    fireEvent.mouseMove(canvasArea, {
      clientX: rect.left + 200,
      clientY: rect.top + 150,
    });

    expect(screen.getByTestId("current-rectangle")).toBeInTheDocument();
    expect(screen.getByTestId("current-dimension-label")).toBeInTheDocument();

    fireEvent.mouseUp(canvasArea, {
      clientX: rect.left + 200,
      clientY: rect.top + 150,
    });

    expect(screen.queryByTestId("current-rectangle")).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("current-dimension-label"),
    ).not.toBeInTheDocument();
  });
});

describe("Requirement: Shape Selection", () => {
  it("Scenario: Click shape to select - shape is selected with visual feedback", () => {
    render(<Canvas />);

    const canvasArea = screen.getByTestId("canvas-area");
    const rect = canvasArea.getBoundingClientRect();

    // Create a rectangle
    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 100,
      clientY: rect.top + 100,
    });
    fireEvent.mouseMove(canvasArea, {
      clientX: rect.left + 200,
      clientY: rect.top + 150,
    });
    fireEvent.mouseUp(canvasArea, {
      clientX: rect.left + 200,
      clientY: rect.top + 150,
    });

    const rectangle = screen.getByTestId(/^rectangle-\d+$/);

    // Click on the rectangle to select it
    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 150,
      clientY: rect.top + 125,
    });

    // Verify selection visual feedback (blue border)
    expect(rectangle).toHaveClass("border-blue-600");
    expect(rectangle).toHaveClass("bg-blue-200");
  });

  it("Scenario: Deselect shape - clicking canvas background deselects shape", () => {
    render(<Canvas />);

    const canvasArea = screen.getByTestId("canvas-area");
    const rect = canvasArea.getBoundingClientRect();

    // Create a rectangle
    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 100,
      clientY: rect.top + 100,
    });
    fireEvent.mouseMove(canvasArea, {
      clientX: rect.left + 200,
      clientY: rect.top + 150,
    });
    fireEvent.mouseUp(canvasArea, {
      clientX: rect.left + 200,
      clientY: rect.top + 150,
    });

    // Select the rectangle
    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 150,
      clientY: rect.top + 125,
    });
    fireEvent.mouseUp(canvasArea, {
      clientX: rect.left + 150,
      clientY: rect.top + 125,
    });

    const rectangle = screen.getByTestId(/^rectangle-\d+$/);
    expect(rectangle).toHaveClass("border-blue-600");

    // Click on canvas background
    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 300,
      clientY: rect.top + 300,
    });

    // Shape should be deselected (green border)
    expect(rectangle).toHaveClass("border-green-500");
    expect(rectangle).not.toHaveClass("border-blue-600");
  });

  it("displays resize handles when shape is selected", () => {
    render(<Canvas />);

    const canvasArea = screen.getByTestId("canvas-area");
    const rect = canvasArea.getBoundingClientRect();

    // Create a rectangle
    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 100,
      clientY: rect.top + 100,
    });
    fireEvent.mouseMove(canvasArea, {
      clientX: rect.left + 200,
      clientY: rect.top + 150,
    });
    fireEvent.mouseUp(canvasArea, {
      clientX: rect.left + 200,
      clientY: rect.top + 150,
    });

    // Resize handles should not be visible initially
    expect(
      screen.queryByTestId("resize-handle-top-left"),
    ).not.toBeInTheDocument();

    // Select the rectangle
    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 150,
      clientY: rect.top + 125,
    });

    // Resize handles should now be visible
    expect(screen.getByTestId("resize-handle-top-left")).toBeInTheDocument();
    expect(screen.getByTestId("resize-handle-top-right")).toBeInTheDocument();
    expect(screen.getByTestId("resize-handle-bottom-left")).toBeInTheDocument();
    expect(
      screen.getByTestId("resize-handle-bottom-right"),
    ).toBeInTheDocument();
  });
});

describe("Requirement: Shape Dragging", () => {
  it("Scenario: Drag shape to new position - shape follows mouse and updates position", () => {
    render(<Canvas />);

    const canvasArea = screen.getByTestId("canvas-area");
    const rect = canvasArea.getBoundingClientRect();

    // Create a rectangle
    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 100,
      clientY: rect.top + 100,
    });
    fireEvent.mouseMove(canvasArea, {
      clientX: rect.left + 200,
      clientY: rect.top + 150,
    });
    fireEvent.mouseUp(canvasArea, {
      clientX: rect.left + 200,
      clientY: rect.top + 150,
    });

    const rectangle = screen.getByTestId(/^rectangle-\d+$/);
    expect(rectangle).toHaveStyle({ left: "100px", top: "100px" });

    // Click and drag the rectangle
    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 150,
      clientY: rect.top + 125,
    });

    fireEvent.mouseMove(canvasArea, {
      clientX: rect.left + 250,
      clientY: rect.top + 225,
    });

    // Shape should have moved
    expect(rectangle).toHaveStyle({ left: "200px", top: "200px" });
  });

  it("Scenario: Complete drag operation - shape remains at new position after mouse release", () => {
    render(<Canvas />);

    const canvasArea = screen.getByTestId("canvas-area");
    const rect = canvasArea.getBoundingClientRect();

    // Create a rectangle
    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 50,
      clientY: rect.top + 50,
    });
    fireEvent.mouseMove(canvasArea, {
      clientX: rect.left + 150,
      clientY: rect.top + 100,
    });
    fireEvent.mouseUp(canvasArea, {
      clientX: rect.left + 150,
      clientY: rect.top + 100,
    });

    // Drag the rectangle
    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 100,
      clientY: rect.top + 75,
    });
    fireEvent.mouseMove(canvasArea, {
      clientX: rect.left + 200,
      clientY: rect.top + 175,
    });
    fireEvent.mouseUp(canvasArea, {
      clientX: rect.left + 200,
      clientY: rect.top + 175,
    });

    const rectangle = screen.getByTestId(/^rectangle-\d+$/);
    expect(rectangle).toHaveStyle({ left: "150px", top: "150px" });
  });

  it("Scenario: Drag updates dimensions in real-time - dimension labels move with shape", () => {
    render(<Canvas />);

    const canvasArea = screen.getByTestId("canvas-area");
    const rect = canvasArea.getBoundingClientRect();

    // Create a rectangle
    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 100,
      clientY: rect.top + 100,
    });
    fireEvent.mouseMove(canvasArea, {
      clientX: rect.left + 200,
      clientY: rect.top + 150,
    });
    fireEvent.mouseUp(canvasArea, {
      clientX: rect.left + 200,
      clientY: rect.top + 150,
    });

    const dimensionLabel = screen.getByTestId("dimension-label");
    expect(dimensionLabel).toHaveTextContent("W: 100, H: 50, Area: 5000");

    // Drag the rectangle
    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 150,
      clientY: rect.top + 125,
    });
    fireEvent.mouseMove(canvasArea, {
      clientX: rect.left + 250,
      clientY: rect.top + 225,
    });

    // Dimension label should still be present and showing same dimensions
    expect(dimensionLabel).toHaveTextContent("W: 100, H: 50, Area: 5000");
  });
});

describe("Requirement: Shape Corner Resizing", () => {
  it("Scenario: Resize shape from corner - shape resizes dynamically", () => {
    render(<Canvas />);

    const canvasArea = screen.getByTestId("canvas-area");
    const rect = canvasArea.getBoundingClientRect();

    // Create a rectangle
    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 100,
      clientY: rect.top + 100,
    });
    fireEvent.mouseMove(canvasArea, {
      clientX: rect.left + 200,
      clientY: rect.top + 150,
    });
    fireEvent.mouseUp(canvasArea, {
      clientX: rect.left + 200,
      clientY: rect.top + 150,
    });

    const rectangle = screen.getByTestId(/^rectangle-\d+$/);
    expect(rectangle).toHaveStyle({ width: "100px", height: "50px" });

    // Select the rectangle to show resize handles
    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 150,
      clientY: rect.top + 125,
    });
    fireEvent.mouseUp(canvasArea, {
      clientX: rect.left + 150,
      clientY: rect.top + 125,
    });

    // Click and drag bottom-right corner handle (at 200, 150)
    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 200,
      clientY: rect.top + 150,
    });

    fireEvent.mouseMove(canvasArea, {
      clientX: rect.left + 250,
      clientY: rect.top + 200,
    });

    // Shape should be resized
    expect(rectangle).toHaveStyle({ width: "150px", height: "100px" });
  });

  it("Scenario: Complete resize operation - shape maintains new dimensions", () => {
    render(<Canvas />);

    const canvasArea = screen.getByTestId("canvas-area");
    const rect = canvasArea.getBoundingClientRect();

    // Create a rectangle
    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 100,
      clientY: rect.top + 100,
    });
    fireEvent.mouseMove(canvasArea, {
      clientX: rect.left + 200,
      clientY: rect.top + 150,
    });
    fireEvent.mouseUp(canvasArea, {
      clientX: rect.left + 200,
      clientY: rect.top + 150,
    });

    // Select the rectangle
    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 150,
      clientY: rect.top + 125,
    });
    fireEvent.mouseUp(canvasArea, {
      clientX: rect.left + 150,
      clientY: rect.top + 125,
    });

    // Resize from bottom-right corner
    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 200,
      clientY: rect.top + 150,
    });
    fireEvent.mouseMove(canvasArea, {
      clientX: rect.left + 300,
      clientY: rect.top + 250,
    });
    fireEvent.mouseUp(canvasArea, {
      clientX: rect.left + 300,
      clientY: rect.top + 250,
    });

    const rectangle = screen.getByTestId(/^rectangle-\d+$/);
    expect(rectangle).toHaveStyle({ width: "200px", height: "150px" });
  });

  it("Scenario: Resize square with Shift maintains aspect ratio", () => {
    render(<Canvas />);

    const canvasArea = screen.getByTestId("canvas-area");
    const rect = canvasArea.getBoundingClientRect();

    // Create a square with Shift
    fireEvent.keyDown(window, { key: "Shift" });
    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 100,
      clientY: rect.top + 100,
    });
    fireEvent.mouseMove(canvasArea, {
      clientX: rect.left + 200,
      clientY: rect.top + 250,
    });
    fireEvent.mouseUp(canvasArea, {
      clientX: rect.left + 200,
      clientY: rect.top + 250,
    });
    fireEvent.keyUp(window, { key: "Shift" });

    const rectangle = screen.getByTestId(/^rectangle-\d+$/);
    expect(rectangle).toHaveStyle({ width: "100px", height: "100px" });

    // Select the shape
    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 150,
      clientY: rect.top + 150,
    });
    fireEvent.mouseUp(canvasArea, {
      clientX: rect.left + 150,
      clientY: rect.top + 150,
    });

    // Resize with Shift held - should maintain 1:1 aspect ratio
    fireEvent.keyDown(window, { key: "Shift" });
    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 200,
      clientY: rect.top + 200,
    });
    fireEvent.mouseMove(canvasArea, {
      clientX: rect.left + 300,
      clientY: rect.top + 250,
    });

    // Should maintain square aspect ratio (larger dimension wins)
    expect(rectangle).toHaveStyle({ width: "200px", height: "200px" });

    fireEvent.keyUp(window, { key: "Shift" });
  });

  it("Scenario: Resize rectangle with Shift creates square", () => {
    render(<Canvas />);

    const canvasArea = screen.getByTestId("canvas-area");
    const rect = canvasArea.getBoundingClientRect();

    // Create a rectangle (not square)
    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 100,
      clientY: rect.top + 100,
    });
    fireEvent.mouseMove(canvasArea, {
      clientX: rect.left + 200,
      clientY: rect.top + 150,
    });
    fireEvent.mouseUp(canvasArea, {
      clientX: rect.left + 200,
      clientY: rect.top + 150,
    });

    const rectangle = screen.getByTestId(/^rectangle-\d+$/);
    expect(rectangle).toHaveStyle({ width: "100px", height: "50px" });

    // Select the shape
    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 150,
      clientY: rect.top + 125,
    });
    fireEvent.mouseUp(canvasArea, {
      clientX: rect.left + 150,
      clientY: rect.top + 125,
    });

    // Resize with Shift held - should become square
    fireEvent.keyDown(window, { key: "Shift" });
    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 200,
      clientY: rect.top + 150,
    });
    fireEvent.mouseMove(canvasArea, {
      clientX: rect.left + 250,
      clientY: rect.top + 180,
    });

    // Should be constrained to square (larger dimension = 150)
    expect(rectangle).toHaveStyle({ width: "150px", height: "150px" });

    fireEvent.keyUp(window, { key: "Shift" });
  });
});

describe("Requirement: Real-time Dimension Label Updates", () => {
  it("Scenario: Dimensions update during resize - labels show current dimensions", () => {
    render(<Canvas />);

    const canvasArea = screen.getByTestId("canvas-area");
    const rect = canvasArea.getBoundingClientRect();

    // Create a rectangle
    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 100,
      clientY: rect.top + 100,
    });
    fireEvent.mouseMove(canvasArea, {
      clientX: rect.left + 200,
      clientY: rect.top + 150,
    });
    fireEvent.mouseUp(canvasArea, {
      clientX: rect.left + 200,
      clientY: rect.top + 150,
    });

    const dimensionLabel = screen.getByTestId("dimension-label");
    expect(dimensionLabel).toHaveTextContent("W: 100, H: 50, Area: 5000");

    // Select and resize
    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 150,
      clientY: rect.top + 125,
    });
    fireEvent.mouseUp(canvasArea, {
      clientX: rect.left + 150,
      clientY: rect.top + 125,
    });

    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 200,
      clientY: rect.top + 150,
    });
    fireEvent.mouseMove(canvasArea, {
      clientX: rect.left + 300,
      clientY: rect.top + 250,
    });

    // Dimension label should update in real-time
    expect(dimensionLabel).toHaveTextContent("W: 200, H: 150, Area: 30000");
  });

  it("enforces minimum size constraints during resize", () => {
    render(<Canvas />);

    const canvasArea = screen.getByTestId("canvas-area");
    const rect = canvasArea.getBoundingClientRect();

    // Create a small rectangle
    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 100,
      clientY: rect.top + 100,
    });
    fireEvent.mouseMove(canvasArea, {
      clientX: rect.left + 130,
      clientY: rect.top + 120,
    });
    fireEvent.mouseUp(canvasArea, {
      clientX: rect.left + 130,
      clientY: rect.top + 120,
    });

    // Select the rectangle
    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 115,
      clientY: rect.top + 110,
    });
    fireEvent.mouseUp(canvasArea, {
      clientX: rect.left + 115,
      clientY: rect.top + 110,
    });

    // Try to resize very small (should enforce minimum 10px)
    fireEvent.mouseDown(canvasArea, {
      clientX: rect.left + 130,
      clientY: rect.top + 120,
    });
    fireEvent.mouseMove(canvasArea, {
      clientX: rect.left + 105,
      clientY: rect.top + 105,
    });

    const rectangle = screen.getByTestId(/^rectangle-\d+$/);
    const width = Number.parseInt(rectangle.style.width, 10);
    const height = Number.parseInt(rectangle.style.height, 10);

    // Should enforce minimum size of 10px
    expect(width).toBeGreaterThanOrEqual(10);
    expect(height).toBeGreaterThanOrEqual(10);
  });
});
