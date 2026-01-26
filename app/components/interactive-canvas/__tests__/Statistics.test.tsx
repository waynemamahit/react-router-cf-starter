import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { Shape } from '~/models/canvas';
import { Statistics } from '../Statistics';

describe('Statistics', () => {
  afterEach(() => {
    cleanup();
  });

  it('displays counts correctly', () => {
    const shapes: Shape[] = [
      { id: '1', type: 'point', x:0, y:0, createdAt: 1 },
      { id: '2', type: 'point', x:0, y:0, createdAt: 2 },
      { id: '3', type: 'rectangle', x:0, y:0, width:100, height:100, createdAt: 3 }, // Square
      { id: '4', type: 'rectangle', x:0, y:0, width:100, height:50, createdAt: 4 }, // Rectangle
    ];
    
    render(<Statistics shapes={shapes} />);
    
    // Points: 2
    // Rectangles: 1
    // Squares: 1
    // Total: 4
    
    // Using text content checks
    const pointRow = screen.getByText('Points:').parentElement;
    expect(pointRow).toHaveTextContent('2');
    
    const rectRow = screen.getByText('Rectangles:').parentElement;
    expect(rectRow).toHaveTextContent('1');
    
    const squareRow = screen.getByText('Squares:').parentElement;
    expect(squareRow).toHaveTextContent('1');
    
    const totalRow = screen.getByText('Total:').parentElement;
    expect(totalRow).toHaveTextContent('4');
  });
});
