import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CanvasStats from "./CanvasStats";

describe("CanvasStats", () => {
  it("renders all stat counters at zero", () => {
    render(<CanvasStats stats={{ points: 0, rectangles: 0, squares: 0 }} />);

    expect(screen.getByText("Points")).toBeInTheDocument();
    expect(screen.getByText("Rectangles")).toBeInTheDocument();
    expect(screen.getByText("Squares")).toBeInTheDocument();
    expect(screen.getAllByText("0")).toHaveLength(3);
  });

  it("displays correct counts", () => {
    render(<CanvasStats stats={{ points: 5, rectangles: 3, squares: 2 }} />);

    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});
