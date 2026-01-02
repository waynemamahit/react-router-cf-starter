import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono/tiny";
import { z } from "zod";
import type {
  DrawingSummary,
  DrawingsResponse,
  SavedDrawing,
} from "../../../app/routes/canvas.models";

const DRAWINGS_INDEX_KEY = "drawings:index";
const DRAWING_KEY_PREFIX = "drawing:";

const PointSchema = z.object({
  id: z.number(),
  x: z.number(),
  y: z.number(),
});

const RectangleSchema = z.object({
  id: z.number(),
  startX: z.number(),
  startY: z.number(),
  width: z.number(),
  height: z.number(),
});

const CreateDrawingSchema = z.object({
  name: z.string().min(1).max(200),
  points: z.array(PointSchema),
  rectangles: z.array(RectangleSchema),
});

const drawings = new Hono<{ Bindings: Env }>();

function generateUUID(): string {
  return crypto.randomUUID();
}

async function getDrawing(
  kv: KVNamespace,
  id: string,
): Promise<SavedDrawing | null> {
  const key = `${DRAWING_KEY_PREFIX}${id}`;
  const value = await kv.get(key, "json");
  if (!value) {
    return null;
  }

  const drawing = value as SavedDrawing;

  const validation = CreateDrawingSchema.safeParse({
    name: drawing.name,
    points: drawing.points,
    rectangles: drawing.rectangles,
  });

  if (!validation.success) {
    console.error(`Invalid drawing data for ${id}:`, validation.error);
    return null;
  }

  return drawing;
}

async function saveDrawing(
  kv: KVNamespace,
  drawing: SavedDrawing,
): Promise<void> {
  const key = `${DRAWING_KEY_PREFIX}${drawing.id}`;
  await kv.put(key, JSON.stringify(drawing));

  const indexValue = await kv.get(DRAWINGS_INDEX_KEY, "json");
  const index = (indexValue as string[]) || [];

  if (!index.includes(drawing.id)) {
    index.push(drawing.id);
    await kv.put(DRAWINGS_INDEX_KEY, JSON.stringify(index));
  }
}

async function listDrawings(kv: KVNamespace): Promise<DrawingSummary[]> {
  const indexValue = await kv.get(DRAWINGS_INDEX_KEY, "json");
  const index = (indexValue as string[]) || [];

  const summaries: DrawingSummary[] = [];
  for (const id of index) {
    try {
      const drawing = await getDrawing(kv, id);
      if (drawing) {
        summaries.push({
          id: drawing.id,
          name: drawing.name,
          createdAt: drawing.createdAt,
        });
      }
    } catch (error) {
      console.error(`Error reading drawing ${id}:`, error);
    }
  }

  summaries.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return summaries;
}

drawings.get("/", async (c) => {
  try {
    const kv = c.env.KV;
    const drawingsList = await listDrawings(kv);
    const response: DrawingsResponse = {
      drawings: drawingsList,
    };
    return c.json(response);
  } catch (error) {
    console.error("Error listing drawings:", error);
    return c.json({ error: "Failed to list drawings" }, 500);
  }
});

drawings.get("/:id", async (c) => {
  const id = c.req.param("id");

  if (!id || id.trim() === "" || id.includes(" ")) {
    return c.json({ error: "Invalid drawing ID" }, 400);
  }

  try {
    const kv = c.env.KV;
    const drawing = await getDrawing(kv, id.trim());
    if (!drawing) {
      return c.json({ error: "Drawing not found" }, 404);
    }
    return c.json(drawing);
  } catch (error) {
    console.error(`Error reading drawing ${id}:`, error);
    return c.json({ error: "Failed to read drawing" }, 500);
  }
});

drawings.post(
  "/",
  zValidator("json", CreateDrawingSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          error: "Invalid drawing data",
          details: result.error.issues,
        },
        400,
      );
    }
  }),
  async (c) => {
    try {
      const data = c.req.valid("json");
      const kv = c.env.KV;

      const drawing: SavedDrawing = {
        id: generateUUID(),
        name: data.name,
        createdAt: new Date().toISOString(),
        points: data.points,
        rectangles: data.rectangles,
      };

      await saveDrawing(kv, drawing);

      return c.json(drawing, 201);
    } catch (error) {
      console.error("Error saving drawing:", error);
      return c.json({ error: "Failed to save drawing" }, 500);
    }
  },
);

export default drawings;
