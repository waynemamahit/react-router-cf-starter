import { describe, expect, it } from 'vitest';
import type { Shape } from '~/models/canvas';
import {
  getDistance,
  hitTestShape,
  isPointInCircle,
  isPointInRect,
  isSquare,
  sortShapesForRendering
} from '../geometry';

describe('Geometry Utils', () => {
  describe('getDistance', () => {
    it('calculates distance between points correctly', () => {
      expect(getDistance(0, 0, 3, 4)).toBe(5); // 3-4-5 triangle
      expect(getDistance(10, 10, 10, 20)).toBe(10);
    });
  });

  describe('isPointInCircle', () => {
    it('returns true when point is inside circle', () => {
      expect(isPointInCircle(5, 5, 0, 0, 10)).toBe(true);
    });

    it('returns false when point is outside circle', () => {
      expect(isPointInCircle(15, 15, 0, 0, 10)).toBe(false);
    });
  });

  describe('isPointInRect', () => {
    it('returns true when point is inside rectangle', () => {
      expect(isPointInRect(15, 15, 10, 10, 20, 20)).toBe(true);
    });

    it('returns false when point is outside rectangle', () => {
        expect(isPointInRect(5, 5, 10, 10, 20, 20)).toBe(false);
    });

    it('handles negative width/height correctly', () => {
        // Rect from (10,10) with width -5 (goes to 5)
        // Effectively x: 5, width: 5
        expect(isPointInRect(7, 10, 10, 10, -5, 10)).toBe(true);
    });
  });

  describe('isSquare', () => {
    it('returns true for equal dimensions', () => {
      expect(isSquare(10, 10)).toBe(true);
      expect(isSquare(10, -10)).toBe(true);
    });

    it('returns false for different dimensions', () => {
      expect(isSquare(10, 20)).toBe(false);
    });

    it('respects visual rounding', () => {
      // 10.4 rounds to 10, matches 10
      expect(isSquare(10, 10.4)).toBe(true); 
      // 10.6 rounds to 11, does not match 10
      expect(isSquare(10, 10.6)).toBe(false);
      // 25.6 rounds to 26, 26.4 rounds to 26 -> Match
      expect(isSquare(25.6, 26.4)).toBe(true);
    });
  });
  
  describe('hitTestShape', () => {
      it('tests point hit', () => {
          const point: Shape = { id: '1', type: 'point', x: 10, y: 10, createdAt: 1 };
          expect(hitTestShape(point, 12, 12)).toBe(true); // Within radius 10
          expect(hitTestShape(point, 30, 30)).toBe(false);
      });
      
      it('tests rectangle hit', () => {
          const rect: Shape = { id: '2', type: 'rectangle', x: 10, y: 10, width: 20, height: 20, createdAt: 1 };
          expect(hitTestShape(rect, 15, 15)).toBe(true);
          expect(hitTestShape(rect, 5, 5)).toBe(false);
      });
  });
  
  describe('sortShapesForRendering', () => {
      it('puts points on top of rectangles', () => {
          const rect: Shape = { id: '1', type: 'rectangle', x:0, y:0, width:10, height:10, createdAt: 100 };
          const point: Shape = { id: '2', type: 'point', x:0, y:0, createdAt: 1 }; // Older point
          
          const sorted = sortShapesForRendering([rect, point]);
          expect(sorted[1].type).toBe('point'); // Last one rendered is top
      });
      
      it('sorts same types by creation time', () => {
          const r1: Shape = { id: '1', type: 'rectangle', x:0, y:0, width:10, height:10, createdAt: 100 };
          const r2: Shape = { id: '2', type: 'rectangle', x:0, y:0, width:10, height:10, createdAt: 200 };
          
          const sorted = sortShapesForRendering([r2, r1]);
          expect(sorted[0].id).toBe('1'); // Older first
          expect(sorted[1].id).toBe('2'); // Newer last (top)
      });
  });
});
