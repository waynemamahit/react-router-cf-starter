import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Toolbar } from '../Toolbar';

describe('Toolbar', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders all buttons', () => {
    render(
      <Toolbar
        canUndo={false} canRedo={false} canDelete={false}
        onUndo={() => { }} onRedo={() => { }} onDelete={() => { }} onReset={() => { }} onExport={() => { }}
      />
    );

    expect(screen.getByText('Undo')).toBeDefined();
    expect(screen.getByText('Redo')).toBeDefined();
    expect(screen.getByText('Delete')).toBeDefined();
    expect(screen.getByText('Reset')).toBeDefined();
  });

  it('disables undo/redo/delete based on props', () => {
    render(
      <Toolbar
        canUndo={false} canRedo={false} canDelete={false}
        onUndo={() => { }} onRedo={() => { }} onDelete={() => { }} onReset={() => { }} onExport={() => { }}
      />
    );

    expect(screen.getByText('Undo')).toBeDisabled();
    expect(screen.getByText('Redo')).toBeDisabled();
    expect(screen.getByText('Delete')).toBeDisabled();
  });

  it('enables buttons when allowed', () => {
    render(
      <Toolbar
        canUndo={true} canRedo={true} canDelete={true}
        onUndo={() => { }} onRedo={() => { }} onDelete={() => { }} onReset={() => { }} onExport={() => { }}
      />
    );

    expect(screen.getByText('Undo')).not.toBeDisabled();
    expect(screen.getByText('Redo')).not.toBeDisabled();
    expect(screen.getByText('Delete')).not.toBeDisabled();
  });

  it('calls handlers on click', () => {
    const handleUndo = vi.fn();
    const handleRedo = vi.fn();
    const handleDelete = vi.fn();

    render(
      <Toolbar
        canUndo={true} canRedo={true} canDelete={true}
        onUndo={handleUndo} onRedo={handleRedo} onDelete={handleDelete} onReset={() => { }} onExport={() => { }}
      />
    );

    fireEvent.click(screen.getByText('Undo'));
    expect(handleUndo).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Redo'));
    expect(handleRedo).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Delete'));
    expect(handleDelete).toHaveBeenCalled();
  });

  it('calls export with selected format', () => {
    const handleExport = vi.fn();

    render(
      <Toolbar
        canUndo={false} canRedo={false} canDelete={false}
        onUndo={() => { }} onRedo={() => { }} onDelete={() => { }} onReset={() => { }}
        onExport={handleExport}
      />
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'png' } });

    expect(handleExport).toHaveBeenCalledWith('png');
  });
});
