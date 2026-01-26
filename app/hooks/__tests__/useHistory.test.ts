import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useHistory } from '../useHistory';

describe('useHistory', () => {
  it('initializes with default state', () => {
    const { result } = renderHook(() => useHistory(1));
    expect(result.current.state).toBe(1);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('updates state and adds to history', () => {
    const { result } = renderHook(() => useHistory(1));

    act(() => {
      result.current.set(2);
    });

    expect(result.current.state).toBe(2);
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
  });

  it('undos state', () => {
    const { result } = renderHook(() => useHistory(1));

    act(() => {
      result.current.set(2);
    });

    act(() => {
      result.current.undo();
    });

    expect(result.current.state).toBe(1);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);
  });

  it('redos state', () => {
    const { result } = renderHook(() => useHistory(1));

    act(() => {
      result.current.set(2);
    });

    act(() => {
      result.current.undo();
    });

    act(() => {
      result.current.redo();
    });

    expect(result.current.state).toBe(2);
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
  });

  it('clears future on new change after undo', () => {
    const { result } = renderHook(() => useHistory(1));

    // 1 -> 2
    act(() => { result.current.set(2); });
    // Undo back to 1 (future is [2])
    act(() => { result.current.undo(); });

    // 1 -> 3
    act(() => { result.current.set(3); });

    expect(result.current.state).toBe(3);
    expect(result.current.canRedo).toBe(false); // Future should be cleared (cannot redo to 2)
  });

  it('supports transient updates without history', () => {
    const { result } = renderHook(() => useHistory(1));

    act(() => {
      result.current.updateTransient(2);
    });

    expect(result.current.state).toBe(2);
    expect(result.current.canUndo).toBe(false); // Should NOT add to history
  });
});
