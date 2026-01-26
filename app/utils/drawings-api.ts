import type { Shape } from "~/models/canvas";
import type {
  CreateDrawingRequest,
  ListDrawingsResponse,
  StoredDrawing
} from "~/models/drawing";

const API_BASE = "/api/v1/drawings";

export class DrawingApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = "DrawingApiError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = "An error occurred";
    try {
      const errorData = await response.json() as { error?: string };
      if (errorData.error) {
        message = errorData.error;
      }
    } catch (e) {
      // Fallback to status text if JSON parse fails
      message = response.statusText;
    }
    throw new DrawingApiError(message, response.status);
  }
  
  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
}

export async function saveDrawing(name: string, shapes: Shape[]): Promise<StoredDrawing> {
  const payload: CreateDrawingRequest = { name, shapes };
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return handleResponse<StoredDrawing>(response);
}

export async function listDrawings(cursor?: string | null): Promise<ListDrawingsResponse> {
  const url = new URL(API_BASE, window.location.origin);
  if (cursor) {
    url.searchParams.set("cursor", cursor);
  }
  
  const response = await fetch(url.toString());
  return handleResponse<ListDrawingsResponse>(response);
}

export async function loadDrawing(name: string): Promise<StoredDrawing> {
  const response = await fetch(`${API_BASE}/${encodeURIComponent(name)}`);
  return handleResponse<StoredDrawing>(response);
}

export async function deleteDrawing(name: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${encodeURIComponent(name)}`, {
    method: "DELETE",
  });
  return handleResponse<void>(response);
}
