import { Hono } from "hono";
import type { CreateDrawingRequest, DrawingMetadata, ListDrawingsResponse, StoredDrawing } from "../../../app/models/drawing";

const drawings = new Hono<{ Bindings: Env }>();

const getDrawingKey = (name: string) => `drawing:${name}`;

drawings.post("/", async (c) => {
  try {
    const body = await c.req.json<CreateDrawingRequest>();
    const { name, shapes } = body;

    if (!name || !name.trim()) {
      return c.json({ error: "Name is required" }, 400);
    }

    const key = getDrawingKey(name);
    const existing = await c.env.KV.get(key);

    if (existing) {
      return c.json({ error: "Drawing with this name already exists" }, 409);
    }

    const now = new Date().toISOString();
    const drawing: StoredDrawing = {
      name,
      shapes,
      createdAt: now,
      updatedAt: now,
    };

    await c.env.KV.put(key, JSON.stringify(drawing));
    
    return c.json(drawing, 201);
  } catch (e) {
    return c.json({ error: "Invalid request body" }, 400);
  }
});

drawings.get("/", async (c) => {
  const cursor = c.req.query("cursor");
  const limit = 10;
  
  const list = await c.env.KV.list({
    prefix: "drawing:",
    limit,
    cursor: cursor || undefined,
  });

  const drawings = await Promise.all(
    list.keys.map(async (key) => {
      const value = await c.env.KV.get<StoredDrawing>(key.name, "json");
      if (!value) return null;
      const { shapes, ...metadata } = value;
      return metadata;
    })
  );

  const validDrawings = drawings
    .filter((d): d is DrawingMetadata => d !== null)
    .sort((a: DrawingMetadata, b: DrawingMetadata) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const response: ListDrawingsResponse = {
    drawings: validDrawings,
    nextCursor: list.list_complete ? null : list.cursor,
    hasMore: !list.list_complete,
  };

  return c.json(response);
});

drawings.get("/:name", async (c) => {
  const name = c.req.param("name");
  const key = getDrawingKey(name);
  const drawing = await c.env.KV.get<StoredDrawing>(key, "json");

  if (!drawing) {
    return c.json({ error: "Drawing not found" }, 404);
  }

  return c.json(drawing);
});

drawings.delete("/:name", async (c) => {
  const name = c.req.param("name");
  const key = getDrawingKey(name);
  const existing = await c.env.KV.get(key);

  if (!existing) {
    return c.json({ error: "Drawing not found" }, 404);
  }

  await c.env.KV.delete(key);
  return c.body(null, 204);
});

export default drawings;
