import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import UserGuide from "./UserGuide";

describe("UserGuide", () => {
  it("does not render when isOpen is false", () => {
    render(<UserGuide isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByText("Canvas Guide")).not.toBeInTheDocument();
  });

  it("renders when isOpen is true", () => {
    render(<UserGuide isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText("Canvas Guide")).toBeInTheDocument();
  });

  it("shows all guide sections", () => {
    render(<UserGuide isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText("Creating Shapes")).toBeInTheDocument();
    expect(screen.getByText("Selecting")).toBeInTheDocument();
    expect(screen.getByText("Modifying")).toBeInTheDocument();
    expect(screen.getByText("Undo / Redo")).toBeInTheDocument();
    expect(screen.getByText("Export")).toBeInTheDocument();
    expect(screen.getByText("Persistence")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<UserGuide isOpen={true} onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: "Close guide" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when backdrop overlay is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<UserGuide isOpen={true} onClose={onClose} />);

    await new Promise((resolve) => setTimeout(resolve, 250));
    await user.click(
      screen.getByRole("button", { name: "Dismiss canvas guide" }),
    );
    expect(onClose).toHaveBeenCalledOnce();
  });
});
