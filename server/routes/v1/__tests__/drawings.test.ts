import { beforeEach, describe, expect, it, vi } from 'vitest';
import drawings from '../drawings';

// Mock KV
const mockKV = {
  get: vi.fn(),
  put: vi.fn(),
  list: vi.fn(),
  delete: vi.fn(),
};

const createEnv = () => ({
  KV: mockKV,
} as unknown as Env);

describe('Drawings API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /', () => {
    it('should save a new drawing', async () => {
      mockKV.get.mockResolvedValue(null);
      mockKV.put.mockResolvedValue(undefined);

      const req = new Request('http://localhost/', {
        method: 'POST',
        body: JSON.stringify({ name: 'test', shapes: [] }),
      });

      const res = await drawings.fetch(req, createEnv());
      expect(res.status).toBe(201);
      
      const data = await res.json();
      expect(data).toMatchObject({ name: 'test', shapes: [] });
      expect(data).toHaveProperty('createdAt');
      expect(data).toHaveProperty('updatedAt');
      
      expect(mockKV.get).toHaveBeenCalledWith('drawing:test');
      expect(mockKV.put).toHaveBeenCalledWith('drawing:test', expect.any(String));
    });

    it('should reject duplicate name', async () => {
      mockKV.get.mockResolvedValue({ name: 'test' });

      const req = new Request('http://localhost/', {
        method: 'POST',
        body: JSON.stringify({ name: 'test', shapes: [] }),
      });

      const res = await drawings.fetch(req, createEnv());
      expect(res.status).toBe(409);
      expect(mockKV.put).not.toHaveBeenCalled();
    });

    it('should reject empty name', async () => {
      const req = new Request('http://localhost/', {
        method: 'POST',
        body: JSON.stringify({ name: '   ', shapes: [] }),
      });

      const res = await drawings.fetch(req, createEnv());
      expect(res.status).toBe(400);
      expect(mockKV.put).not.toHaveBeenCalled();
    });
  });

  describe('GET /', () => {
    it('should list drawings', async () => {
      const mockDrawings = [
        { name: 'd1', createdAt: '2023-01-02T00:00:00Z', shapes: [] },
        { name: 'd2', createdAt: '2023-01-01T00:00:00Z', shapes: [] },
      ];

      mockKV.list.mockResolvedValue({
        keys: [{ name: 'drawing:d1' }, { name: 'drawing:d2' }],
        list_complete: true,
        cursor: null,
      });

      mockKV.get.mockImplementation((key) => {
        const d = mockDrawings.find(d => `drawing:${d.name}` === key);
        return Promise.resolve(d);
      });

      const req = new Request('http://localhost/', {
        method: 'GET',
      });

      const res = await drawings.fetch(req, createEnv());
      expect(res.status).toBe(200);
      
      const data = await res.json() as { drawings: any[]; hasMore: boolean };
      expect(data.drawings).toHaveLength(2);
      expect(data.drawings[0].name).toBe('d1');
      expect(data.hasMore).toBe(false);
    });

    it('should handle pagination', async () => {
      mockKV.list.mockResolvedValue({
        keys: [],
        list_complete: false,
        cursor: 'next-cursor',
      });

      const req = new Request('http://localhost/?cursor=abc', {
        method: 'GET',
      });

      await drawings.fetch(req, createEnv());
      
      expect(mockKV.list).toHaveBeenCalledWith({
        prefix: 'drawing:',
        limit: 10,
        cursor: 'abc',
      });
    });
  });

  describe('GET /:name', () => {
    it('should get drawing by name', async () => {
      const mockDrawing = { name: 'test', shapes: [] };
      mockKV.get.mockResolvedValue(mockDrawing);

      const req = new Request('http://localhost/test', {
        method: 'GET',
      });

      const res = await drawings.fetch(req, createEnv());
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual(mockDrawing);
    });

    it('should return 404 for non-existent drawing', async () => {
      mockKV.get.mockResolvedValue(null);

      const req = new Request('http://localhost/unknown', {
        method: 'GET',
      });

      const res = await drawings.fetch(req, createEnv());
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /:name', () => {
    it('should delete drawing', async () => {
      mockKV.get.mockResolvedValue({ name: 'test' });
      mockKV.delete.mockResolvedValue(undefined);

      const req = new Request('http://localhost/test', {
        method: 'DELETE',
      });

      const res = await drawings.fetch(req, createEnv());
      expect(res.status).toBe(204);
      expect(mockKV.delete).toHaveBeenCalledWith('drawing:test');
    });

    it('should return 404 for non-existent drawing', async () => {
      mockKV.get.mockResolvedValue(null);

      const req = new Request('http://localhost/unknown', {
        method: 'DELETE',
      });

      const res = await drawings.fetch(req, createEnv());
      expect(res.status).toBe(404);
      expect(mockKV.delete).not.toHaveBeenCalled();
    });
  });
});
