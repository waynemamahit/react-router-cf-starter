import type { Shape } from './canvas';

export interface DrawingMetadata {
  name: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface StoredDrawing extends DrawingMetadata {
  shapes: Shape[];
}

export interface ListDrawingsResponse {
  drawings: DrawingMetadata[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface CreateDrawingRequest {
  name: string;
  shapes: Shape[];
}
