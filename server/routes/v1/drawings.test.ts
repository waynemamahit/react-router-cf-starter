import { Hono } from "hono/tiny";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SavedDrawing } from "../../../app/routes/canvas.models";
import drawings from "./drawings";

const mockKV = {
  get: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  list: vi.fn(),
};

const createTestApp = () => {
  const app = new Hono<{ Bindings: Env }>();
  app.route("/drawings", drawings);
  return app;
};

const createTestRequest = (url: string, options: RequestInit = {}): Request => {
  return new Request(`http://localhost${url}`, options);
};

const createMockEnv = (): Env => {
  return {
    KV: mockKV as unknown as KVNamespace,
  } as Env;
};

describe("Drawings API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /drawings", () => {
    it("should return empty array when no drawings exist", async () => {
      mockKV.get.mockImplementation(async (_: string, __?: string) => {
        return null;
      });

      const app = createTestApp();
      const req = createTestRequest("/drawings");
      const res = await app.fetch(req, createMockEnv());

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({ drawings: [] });
    });

    it("should return list of drawing summaries", async () => {
      const drawingIds = ["id-1", "id-2"];
      mockKV.get.mockImplementation(async (key: string, type?: string) => {
        if (key === "drawings:index") {
          return type === "json" ? drawingIds : JSON.stringify(drawingIds);
        }
        if (key === "drawing:id-1") {
          const drawing = {
            id: "id-1",
            name: "Drawing 1",
            createdAt: "2025-01-01T00:00:00.000Z",
            points: [],
            rectangles: [],
          };
          return type === "json" ? drawing : JSON.stringify(drawing);
        }
        if (key === "drawing:id-2") {
          const drawing = {
            id: "id-2",
            name: "Drawing 2",
            createdAt: "2025-01-02T00:00:00.000Z",
            points: [],
            rectangles: [],
          };
          return type === "json" ? drawing : JSON.stringify(drawing);
        }
        return null;
      });

      const app = createTestApp();
      const req = createTestRequest("/drawings");
      const res = await app.fetch(req, createMockEnv());

      expect(res.status).toBe(200);
      const data = (await res.json()) as {
        drawings: Array<{ id: string; name: string; createdAt: string }>;
      };
      expect(data.drawings).toHaveLength(2);
      expect(data.drawings[0]).toEqual({
        id: "id-2",
        name: "Drawing 2",
        createdAt: "2025-01-02T00:00:00.000Z",
      });
    });
  });

  describe("GET /drawings/:id", () => {
    it("should return 400 for invalid ID", async () => {
      const app = createTestApp();
      const req = createTestRequest("/drawings/%20");
      const res = await app.fetch(req, createMockEnv());

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data).toEqual({ error: "Invalid drawing ID" });
    });

    it("should return 404 when drawing not found", async () => {
      mockKV.get.mockImplementation(async () => {
        return null;
      });

      const app = createTestApp();
      const req = createTestRequest("/drawings/nonexistent");
      const res = await app.fetch(req, createMockEnv());

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data).toEqual({ error: "Drawing not found" });
    });

    it("should return drawing when found", async () => {
      const drawing: SavedDrawing = {
        id: "test-id",
        name: "Test Drawing",
        createdAt: "2025-01-01T00:00:00.000Z",
        points: [{ id: 1, x: 10, y: 20 }],
        rectangles: [{ id: 2, startX: 0, startY: 0, width: 100, height: 100 }],
      };

      mockKV.get.mockImplementation(async (key: string, type?: string) => {
        if (key === "drawing:test-id") {
          return type === "json" ? drawing : JSON.stringify(drawing);
        }
        return null;
      });

      const app = createTestApp();
      const req = createTestRequest("/drawings/test-id");
      const res = await app.fetch(req, createMockEnv());

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual(drawing);
    });
  });

  describe("POST /drawings", () => {
    it("should return 400 for invalid data", async () => {
      const app = createTestApp();
      const req = createTestRequest("/drawings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invalid: "data" }),
      });
      const res = await app.fetch(req, createMockEnv());

      expect(res.status).toBe(400);
      const data = (await res.json()) as { error: string };
      expect(data.error).toBe("Invalid drawing data");
    });

    it("should return 400 for missing name", async () => {
      const app = createTestApp();
      const req = createTestRequest("/drawings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "",
          points: [],
          rectangles: [],
        }),
      });
      const res = await app.fetch(req, createMockEnv());

      expect(res.status).toBe(400);
    });

    it("should return 400 for name exceeding max length", async () => {
      const app = createTestApp();
      const req = createTestRequest("/drawings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "a".repeat(201),
          points: [],
          rectangles: [],
        }),
      });
      const res = await app.fetch(req, createMockEnv());

      expect(res.status).toBe(400);
    });

    it("should return 400 for invalid point coordinates", async () => {
      const app = createTestApp();
      const req = createTestRequest("/drawings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test",
          points: [{ id: 1, x: Number.POSITIVE_INFINITY, y: 10 }],
          rectangles: [],
        }),
      });
      const res = await app.fetch(req, createMockEnv());

      expect(res.status).toBe(400);
    });

    it("should create and return new drawing", async () => {
      mockKV.get.mockImplementation(async () => {
        return null;
      });
      mockKV.put.mockResolvedValue(undefined);

      const app = createTestApp();
      const req = createTestRequest("/drawings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "New Drawing",
          points: [{ id: 1, x: 10, y: 20 }],
          rectangles: [],
        }),
      });
      const res = await app.fetch(req, createMockEnv());

      expect(res.status).toBe(201);
      const data = (await res.json()) as SavedDrawing;
      expect(data.name).toBe("New Drawing");
      expect(data.id).toBeDefined();
      expect(data.createdAt).toBeDefined();
      expect(data.points).toEqual([{ id: 1, x: 10, y: 20 }]);
      expect(mockKV.put).toHaveBeenCalledTimes(2);
    });
  });

  describe("DELETE /drawings/:id", () => {
    it("should return 400 for invalid ID format", async () => {
      const app = createTestApp();
      const req = createTestRequest("/drawings/%20", { method: "DELETE" });
      const res = await app.fetch(req, createMockEnv());

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data).toEqual({ error: "Invalid drawing ID" });
    });

    it("should return 404 when drawing not found", async () => {
      mockKV.get.mockImplementation(async () => {
        return null;
      });

      const app = createTestApp();
      const req = createTestRequest("/drawings/nonexistent", { method: "DELETE" });
      const res = await app.fetch(req, createMockEnv());

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data).toEqual({ error: "Drawing not found" });
    });

    it("should return 204 on successful deletion", async () => {
      const drawing: SavedDrawing = {
        id: "test-id",
        name: "Test Drawing",
        createdAt: "2025-01-01T00:00:00.000Z",
        points: [],
        rectangles: [],
      };

      mockKV.get.mockImplementation(async (key: string, type?: string) => {
        if (key === "drawing:test-id") {
          return type === "json" ? drawing : JSON.stringify(drawing);
        }
        if (key === "drawings:index") {
          return type === "json" ? ["test-id"] : JSON.stringify(["test-id"]);
        }
        return null;
      });
      mockKV.delete.mockResolvedValue(undefined);
      mockKV.put.mockResolvedValue(undefined);

      const app = createTestApp();
      const req = createTestRequest("/drawings/test-id", { method: "DELETE" });
      const res = await app.fetch(req, createMockEnv());

      expect(res.status).toBe(204);
      expect(mockKV.delete).toHaveBeenCalledWith("drawing:test-id");
    });

    it("should remove drawing from index when deleted", async () => {
      const drawing: SavedDrawing = {
        id: "test-id",
        name: "Test Drawing",
        createdAt: "2025-01-01T00:00:00.000Z",
        points: [],
        rectangles: [],
      };

      const drawingIds = ["test-id", "other-id"];
      mockKV.get.mockImplementation(async (key: string, type?: string) => {
        if (key === "drawing:test-id") {
          return type === "json" ? drawing : JSON.stringify(drawing);
        }
        if (key === "drawings:index") {
          return type === "json" ? drawingIds : JSON.stringify(drawingIds);
        }
        return null;
      });
      mockKV.delete.mockResolvedValue(undefined);
      mockKV.put.mockResolvedValue(undefined);

      const app = createTestApp();
      const req = createTestRequest("/drawings/test-id", { method: "DELETE" });
      const res = await app.fetch(req, createMockEnv());

      expect(res.status).toBe(204);
      expect(mockKV.put).toHaveBeenCalledWith(
        "drawings:index",
        JSON.stringify(["other-id"])
      );
    });
  });
});
