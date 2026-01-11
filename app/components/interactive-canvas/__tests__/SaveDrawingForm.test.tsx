import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SaveDrawingForm } from '../SaveDrawingForm';

describe('SaveDrawingForm', () => {
  it('renders input and save button', () => {
    render(
      <SaveDrawingForm 
        onSave={vi.fn()} 
        isSaving={false} 
        error={null} 
      />
    );

    expect(screen.getByPlaceholderText('Drawing name')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('disables button when input is empty', () => {
    render(
      <SaveDrawingForm 
        onSave={vi.fn()} 
        isSaving={false} 
        error={null} 
      />
    );

    const button = screen.getByRole('button', { name: /save/i });
    expect(button).toBeDisabled();
  });

  it('enables button when input has text', () => {
    render(
      <SaveDrawingForm 
        onSave={vi.fn()} 
        isSaving={false} 
        error={null} 
      />
    );

    const input = screen.getByPlaceholderText('Drawing name');
    fireEvent.change(input, { target: { value: 'My Drawing' } });

    const button = screen.getByRole('button', { name: /save/i });
    expect(button).toBeEnabled();
  });

  it('calls onSave with input value when form is submitted', async () => {
    // Return false to prevent state update (setName('')) which causes act() warning
    // since we don't await the state update in this specific test.
    const onSave = vi.fn().mockResolvedValue(false);
    render(
      <SaveDrawingForm 
        onSave={onSave} 
        isSaving={false} 
        error={null} 
      />
    );

    const input = screen.getByPlaceholderText('Drawing name');
    fireEvent.change(input, { target: { value: 'My Drawing' } });

    const button = screen.getByRole('button', { name: /save/i });
    fireEvent.click(button);

    expect(onSave).toHaveBeenCalledWith('My Drawing');
  });

  it('clears input on successful save', async () => {
    const onSave = vi.fn().mockResolvedValue(true);
    render(
      <SaveDrawingForm 
        onSave={onSave} 
        isSaving={false} 
        error={null} 
      />
    );

    const input = screen.getByPlaceholderText('Drawing name');
    fireEvent.change(input, { target: { value: 'My Drawing' } });
    
    const button = screen.getByRole('button', { name: /save/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });

  it('does not clear input on failed save', async () => {
    const onSave = vi.fn().mockResolvedValue(false);
    render(
      <SaveDrawingForm 
        onSave={onSave} 
        isSaving={false} 
        error={null} 
      />
    );

    const input = screen.getByPlaceholderText('Drawing name');
    fireEvent.change(input, { target: { value: 'My Drawing' } });
    
    const button = screen.getByRole('button', { name: /save/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(input).toHaveValue('My Drawing');
    });
  });

  it('displays error message when provided', () => {
    render(
      <SaveDrawingForm 
        onSave={vi.fn()} 
        isSaving={false} 
        error="Name already exists" 
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Name already exists');
  });

  it('shows loading state when saving', () => {
    render(
      <SaveDrawingForm 
        onSave={vi.fn()} 
        isSaving={true} 
        error={null} 
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Saving...');
    expect(button).toBeDisabled();
    expect(screen.getByPlaceholderText('Drawing name')).toBeDisabled();
  });
});
