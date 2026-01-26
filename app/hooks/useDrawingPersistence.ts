import { useCallback, useEffect, useState } from 'react';
import type { Shape } from '~/models/canvas';
import type { DrawingMetadata, StoredDrawing } from '~/models/drawing';
import * as api from '~/utils/drawings-api';

interface UseDrawingPersistenceResult {
  // List state
  drawings: DrawingMetadata[];
  isLoadingList: boolean;
  listError: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refreshList: () => void;

  // Save state
  isSaving: boolean;
  saveError: string | null;
  saveDrawing: (name: string, shapes: Shape[]) => Promise<boolean>;

  // Load state
  isLoadingDrawing: boolean;
  loadError: string | null;
  loadDrawing: (name: string) => Promise<StoredDrawing | null>;

  // Delete state
  isDeleting: boolean;
  deleteError: string | null;
  deleteDrawing: (name: string) => Promise<boolean>;
}

export function useDrawingPersistence(): UseDrawingPersistenceResult {
  // List state
  const [drawings, setDrawings] = useState<DrawingMetadata[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  // Operation states
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  const [isLoadingDrawing, setIsLoadingDrawing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchDrawings = useCallback(async (cursor: string | null = null, append = false) => {
    setIsLoadingList(true);
    setListError(null);
    try {
      const response = await api.listDrawings(cursor);
      setDrawings(prev => append ? [...prev, ...response.drawings] : response.drawings);
      setNextCursor(response.nextCursor);
      setHasMore(response.hasMore);
    } catch (err) {
      setListError(err instanceof Error ? err.message : 'Failed to load drawings');
    } finally {
      setIsLoadingList(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchDrawings();
  }, [fetchDrawings]);

  const loadMore = useCallback(() => {
    if (hasMore && nextCursor && !isLoadingList) {
      fetchDrawings(nextCursor, true);
    }
  }, [hasMore, nextCursor, isLoadingList, fetchDrawings]);

  const refreshList = useCallback(() => {
    fetchDrawings();
  }, [fetchDrawings]);

  const saveDrawing = useCallback(async (name: string, shapes: Shape[]) => {
    setIsSaving(true);
    setSaveError(null);
    try {
      await api.saveDrawing(name, shapes);
      // Refresh list after successful save to show new drawing
      // We don't await this to keep UI responsive, but in a real app we might want to optimistic update
      fetchDrawings();
      return true;
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save drawing');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [fetchDrawings]);

  const loadDrawing = useCallback(async (name: string) => {
    setIsLoadingDrawing(true);
    setLoadError(null);
    try {
      const drawing = await api.loadDrawing(name);
      return drawing;
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load drawing');
      return null;
    } finally {
      setIsLoadingDrawing(false);
    }
  }, []);

  const deleteDrawing = useCallback(async (name: string) => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await api.deleteDrawing(name);
      // Remove from local list immediately
      setDrawings(prev => prev.filter(d => d.name !== name));
      return true;
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete drawing');
      // If delete fails, refresh list to ensure consistency
      fetchDrawings();
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [fetchDrawings]);

  return {
    drawings,
    isLoadingList,
    listError,
    hasMore,
    loadMore,
    refreshList,
    isSaving,
    saveError,
    saveDrawing,
    isLoadingDrawing,
    loadError,
    loadDrawing,
    isDeleting,
    deleteError,
    deleteDrawing,
  };
}
