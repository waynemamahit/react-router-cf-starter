import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import CanvasToolbar from "./CanvasToolbar";

const defaultProps = {
  canUndo: false,
  canRedo: false,
  hasSelection: false,
  onUndo: vi.fn(),
  onRedo: vi.fn(),
  onDelete: vi.fn(),
  onExport: vi.fn(),
  onReset: vi.fn(),
  onHelp: vi.fn(),
};

describe("CanvasToolbar", () => {
  it("renders all buttons", () => {
    render(<CanvasToolbar {...defaultProps} />);

    expect(screen.getByTitle("Undo (Ctrl+Z)")).toBeInTheDocument();
    expect(screen.getByTitle("Redo (Ctrl+Shift+Z)")).toBeInTheDocument();
    expect(screen.getByTitle("Delete (Delete key)")).toBeInTheDocument();
    expect(screen.getByTitle("Export canvas")).toBeInTheDocument();
    expect(screen.getByTitle("Clear canvas")).toBeInTheDocument();
    expect(screen.getByTitle("User Guide")).toBeInTheDocument();
  });

  it("disables undo when canUndo is false", () => {
    render(<CanvasToolbar {...defaultProps} canUndo={false} />);
    expect(screen.getByTitle("Undo (Ctrl+Z)")).toBeDisabled();
  });

  it("enables undo when canUndo is true", () => {
    render(<CanvasToolbar {...defaultProps} canUndo={true} />);
    expect(screen.getByTitle("Undo (Ctrl+Z)")).toBeEnabled();
  });

  it("disables redo when canRedo is false", () => {
    render(<CanvasToolbar {...defaultProps} canRedo={false} />);
    expect(screen.getByTitle("Redo (Ctrl+Shift+Z)")).toBeDisabled();
  });

  it("enables redo when canRedo is true", () => {
    render(<CanvasToolbar {...defaultProps} canRedo={true} />);
    expect(screen.getByTitle("Redo (Ctrl+Shift+Z)")).toBeEnabled();
  });

  it("disables delete when hasSelection is false", () => {
    render(<CanvasToolbar {...defaultProps} hasSelection={false} />);
    expect(screen.getByTitle("Delete (Delete key)")).toBeDisabled();
  });

  it("enables delete when hasSelection is true", () => {
    render(<CanvasToolbar {...defaultProps} hasSelection={true} />);
    expect(screen.getByTitle("Delete (Delete key)")).toBeEnabled();
  });

  it("calls onUndo when undo button is clicked", async () => {
    const onUndo = vi.fn();
    const user = userEvent.setup();
    render(<CanvasToolbar {...defaultProps} canUndo={true} onUndo={onUndo} />);

    await user.click(screen.getByTitle("Undo (Ctrl+Z)"));
    expect(onUndo).toHaveBeenCalledOnce();
  });

  it("calls onRedo when redo button is clicked", async () => {
    const onRedo = vi.fn();
    const user = userEvent.setup();
    render(<CanvasToolbar {...defaultProps} canRedo={true} onRedo={onRedo} />);

    await user.click(screen.getByTitle("Redo (Ctrl+Shift+Z)"));
    expect(onRedo).toHaveBeenCalledOnce();
  });

  it("calls onDelete when delete button is clicked", async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    render(
      <CanvasToolbar
        {...defaultProps}
        hasSelection={true}
        onDelete={onDelete}
      />,
    );

    await user.click(screen.getByTitle("Delete (Delete key)"));
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it("calls onExport with png when PNG option is selected", async () => {
    const onExport = vi.fn();
    const user = userEvent.setup();
    render(<CanvasToolbar {...defaultProps} onExport={onExport} />);

    await user.click(screen.getByTitle("Export canvas"));
    await user.click(screen.getByText("Export as PNG"));

    expect(onExport).toHaveBeenCalledWith("png");
  });

  it("calls onExport with jpg when JPG option is selected", async () => {
    const onExport = vi.fn();
    const user = userEvent.setup();
    render(<CanvasToolbar {...defaultProps} onExport={onExport} />);

    await user.click(screen.getByTitle("Export canvas"));
    await user.click(screen.getByText("Export as JPG"));

    expect(onExport).toHaveBeenCalledWith("jpg");
  });

  it("calls onExport with svg when SVG option is selected", async () => {
    const onExport = vi.fn();
    const user = userEvent.setup();
    render(<CanvasToolbar {...defaultProps} onExport={onExport} />);

    await user.click(screen.getByTitle("Export canvas"));
    await user.click(screen.getByText("Export as SVG"));

    expect(onExport).toHaveBeenCalledWith("svg");
  });

  it("calls onReset when reset button is clicked", async () => {
    const onReset = vi.fn();
    const user = userEvent.setup();
    render(<CanvasToolbar {...defaultProps} onReset={onReset} />);

    await user.click(screen.getByTitle("Clear canvas"));
    expect(onReset).toHaveBeenCalledOnce();
  });

  it("calls onHelp when help button is clicked", async () => {
    const onHelp = vi.fn();
    const user = userEvent.setup();
    render(<CanvasToolbar {...defaultProps} onHelp={onHelp} />);

    await user.click(screen.getByTitle("User Guide"));
    expect(onHelp).toHaveBeenCalledOnce();
  });
});
