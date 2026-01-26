import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as api from '~/utils/drawings-api';
import { useDrawingPersistence } from '../useDrawingPersistence';

// Mock the API module
vi.mock('~/utils/drawings-api', () => ({
  listDrawings: vi.fn(),
  saveDrawing: vi.fn(),
  loadDrawing: vi.fn(),
  deleteDrawing: vi.fn(),
}));

describe('useDrawingPersistence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads drawings on mount', async () => {
    const mockDrawings = {
      drawings: [{ name: 'test', createdAt: '2023-01-01', updatedAt: '2023-01-01' }],
      nextCursor: null,
      hasMore: false,
    };
    (api.listDrawings as any).mockResolvedValue(mockDrawings);

    const { result } = renderHook(() => useDrawingPersistence());

    // Initial state
    expect(result.current.isLoadingList).toBe(true);

    // Wait for load
    await waitFor(() => {
      expect(result.current.isLoadingList).toBe(false);
    });

    expect(result.current.drawings).toEqual(mockDrawings.drawings);
    expect(result.current.listError).toBe(null);
  });

  it('handles list error', async () => {
    (api.listDrawings as any).mockRejectedValue(new Error('Fetch failed'));

    const { result } = renderHook(() => useDrawingPersistence());

    await waitFor(() => {
      expect(result.current.isLoadingList).toBe(false);
    });

    expect(result.current.listError).toBe('Fetch failed');
    expect(result.current.drawings).toEqual([]);
  });

  it('saves a drawing and refreshes list', async () => {
    const mockDrawings = {
      drawings: [{ name: 'test', createdAt: '2023-01-01', updatedAt: '2023-01-01' }],
      nextCursor: null,
      hasMore: false,
    };
    (api.listDrawings as any).mockResolvedValue(mockDrawings);
    (api.saveDrawing as any).mockResolvedValue({ ...mockDrawings.drawings[0], shapes: [] });

    const { result } = renderHook(() => useDrawingPersistence());

    await waitFor(() => {
      expect(result.current.isLoadingList).toBe(false);
    });

    await act(async () => {
      const success = await result.current.saveDrawing('test', []);
      expect(success).toBe(true);
    });

    expect(api.saveDrawing).toHaveBeenCalledWith('test', []);
    // Should refresh list
    expect(api.listDrawings).toHaveBeenCalledTimes(2); // Mount + Save
  });

  it('deletes a drawing and removes from list', async () => {
    const mockDrawings = {
      drawings: [{ name: 'test', createdAt: '2023-01-01', updatedAt: '2023-01-01' }],
      nextCursor: null,
      hasMore: false,
    };
    (api.listDrawings as any).mockResolvedValue(mockDrawings);
    (api.deleteDrawing as any).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDrawingPersistence());

    await waitFor(() => {
      expect(result.current.drawings).toHaveLength(1);
    });

    await act(async () => {
      const success = await result.current.deleteDrawing('test');
      expect(success).toBe(true);
    });

    expect(api.deleteDrawing).toHaveBeenCalledWith('test');
    expect(result.current.drawings).toHaveLength(0);
  });
});
