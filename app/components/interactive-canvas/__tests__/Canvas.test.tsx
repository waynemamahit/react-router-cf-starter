import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeAll, describe, it, vi } from 'vitest';
import { Canvas } from '../Canvas';

// Mock ResizeObserver
beforeAll(() => {
  vi.stubGlobal('ResizeObserver', class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
  });
});

describe('Canvas', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders without crashing', () => {
    render(
      <Canvas
        shapes={[]}
        onShapesChange={() => { }}
        selectedId={null}
        onSelect={() => { }}
      />
    );
    // If it throws, test fails. Implicit passing.
  });
});
