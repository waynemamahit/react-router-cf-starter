import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SavedDrawingsList } from '../SavedDrawingsList';
import type { DrawingMetadata } from '~/models/drawing';

const mockDrawings: DrawingMetadata[] = [
  { name: 'Drawing 1', createdAt: '2023-01-01T10:00:00Z', updatedAt: '2023-01-01T10:00:00Z' },
  { name: 'Drawing 2', createdAt: '2023-01-02T15:30:00Z', updatedAt: '2023-01-02T15:30:00Z' },
];

describe('SavedDrawingsList', () => {
  const defaultProps = {
    drawings: [],
    isLoading: false,
    error: null,
    hasMore: false,
    onLoadMore: vi.fn(),
    onRetry: vi.fn(),
    onLoadDrawing: vi.fn(),
    onDeleteDrawing: vi.fn(),
    isDeleting: false,
  };

  it('renders empty state when no drawings and not loading', () => {
    render(<SavedDrawingsList {...defaultProps} />);
    expect(screen.getByText('No saved drawings yet.')).toBeInTheDocument();
  });

  it('renders list of drawings', () => {
    render(<SavedDrawingsList {...defaultProps} drawings={mockDrawings} />);
    
    expect(screen.getByText('Saved Drawings')).toBeInTheDocument();
    expect(screen.getByText('Drawing 1')).toBeInTheDocument();
    expect(screen.getByText('Drawing 2')).toBeInTheDocument();
  });

  it('calls onLoadDrawing when clicking a drawing', () => {
    const onLoadDrawing = vi.fn();
    render(<SavedDrawingsList {...defaultProps} drawings={mockDrawings} onLoadDrawing={onLoadDrawing} />);
    
    fireEvent.click(screen.getByText('Drawing 1'));
    expect(onLoadDrawing).toHaveBeenCalledWith('Drawing 1');
  });

  it('calls onDeleteDrawing when clicking delete button', () => {
    const onDeleteDrawing = vi.fn();
    // Mock confirm dialog
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    
    render(<SavedDrawingsList {...defaultProps} drawings={mockDrawings} onDeleteDrawing={onDeleteDrawing} />);
    
    const deleteButtons = screen.getAllByTitle('Delete drawing');
    fireEvent.click(deleteButtons[0]);
    
    expect(window.confirm).toHaveBeenCalled();
    expect(onDeleteDrawing).toHaveBeenCalledWith('Drawing 1');
  });

  it('does not delete if confirm is cancelled', () => {
    const onDeleteDrawing = vi.fn();
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    
    render(<SavedDrawingsList {...defaultProps} drawings={mockDrawings} onDeleteDrawing={onDeleteDrawing} />);
    
    const deleteButtons = screen.getAllByTitle('Delete drawing');
    fireEvent.click(deleteButtons[0]);
    
    expect(onDeleteDrawing).not.toHaveBeenCalled();
  });

  it('shows error state and retry button', () => {
    const onRetry = vi.fn();
    render(<SavedDrawingsList {...defaultProps} error="Failed to load" onRetry={onRetry} />);
    
    expect(screen.getByText('Failed to load')).toBeInTheDocument();
    const retryButton = screen.getByText('Retry');
    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalled();
  });

  it('shows loading state for list', () => {
    render(<SavedDrawingsList {...defaultProps} isLoading={true} drawings={mockDrawings} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows load more button when hasMore is true', () => {
    const onLoadMore = vi.fn();
    render(<SavedDrawingsList {...defaultProps} drawings={mockDrawings} hasMore={true} onLoadMore={onLoadMore} />);
    
    const loadMoreButton = screen.getByText('Load more');
    fireEvent.click(loadMoreButton);
    expect(onLoadMore).toHaveBeenCalled();
  });

  it('disables delete buttons when isDeleting is true', () => {
    render(<SavedDrawingsList {...defaultProps} drawings={mockDrawings} isDeleting={true} />);
    
    const deleteButtons = screen.getAllByTitle('Delete drawing');
    expect(deleteButtons[0]).toBeDisabled();
  });
});
