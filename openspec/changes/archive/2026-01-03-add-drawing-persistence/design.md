# Design: Drawing Persistence System

## Context
The canvas application currently supports creating, manipulating, and displaying points and rectangles, but all data exists only in React component state. Users lose their work when the page refreshes or they navigate away. This design adds a full persistence layer using Hono API endpoints and Cloudflare KV storage.

**Stakeholders**: End users creating and managing drawings
**Constraints**:
- Must use Hono for backend API (already in use)
- Must work with Cloudflare Workers (serverless environment)
- Must maintain existing canvas functionality
- Cloudflare Workers have read-only filesystem - using KV storage instead

## Goals / Non-Goals

**Goals:**
- Persist drawing state (points and rectangles) to server storage
- Allow users to save drawings with custom names
- Display list of all saved drawings with metadata
- Load saved drawings back into canvas on demand
- Provide RESTful API endpoints for CRUD operations on drawings

**Non-Goals:**
- Real-time collaboration or multi-user editing
- Drawing versioning or history tracking
- User authentication/authorization (all drawings are public for now)
- Image export/import functionality

## Decisions

### Decision 1: Cloudflare KV Storage
**What**: Store each drawing in Cloudflare KV with UUID-based keys
**Why**:
- Works in both development and production Cloudflare Workers environments
- Simple key-value interface matching our needs
- Already configured in `wrangler.jsonc`
- No filesystem dependency
- Production-ready without migration

**Alternatives considered:**
- JSON file storage: Would not work in Cloudflare Workers (read-only filesystem)
- SQLite database: Not available in Workers environment
- R2 object storage: Overkill for small JSON documents

**Trade-off**: KV has eventual consistency, but acceptable for this use case

### Decision 2: API Endpoint Structure
**What**: Create RESTful endpoints under `/api/v1/drawings`:
- `GET /api/v1/drawings` - List all drawings (returns DrawingSummary[])
- `GET /api/v1/drawings/:id` - Get specific drawing with full data
- `POST /api/v1/drawings` - Create new drawing

**Why**:
- Follows REST conventions
- Aligns with existing API structure (`/api/v1/`)
- Clear separation of concerns
- Easy to extend later

### Decision 3: KV Key Strategy
**What**: Use two types of keys:
- `drawing:{uuid}` for individual drawings
- `drawings:index` for list of all drawing IDs

**Why**:
- Efficient lookup by ID
- Index allows fast listing without scanning all keys
- UUID guarantees uniqueness
- Clear namespace separation

### Decision 4: Frontend State Management
**What**: Keep existing React useState for canvas state, add separate state for saved drawings list
**Why**:
- Minimal changes to existing working code
- Clear separation between active drawing and saved drawings
- No state management library needed for this scope

## Risks / Trade-offs

### Risk 1: KV Eventual Consistency
**Risk**: Newly saved drawing might not appear immediately in list
**Mitigation**:
- Optimistically update UI after save
- Acceptable delay for this use case (typically <1 second)
- Clear user feedback about save status

### Risk 2: No Drawing Size Limits
**Risk**: Users could create enormous drawings filling KV storage
**Mitigation**:
- Zod validation enforces data structure
- Reasonable limits implicit in browser/canvas constraints
- Can add explicit limits if needed

### Risk 3: No Concurrent Write Protection
**Risk**: Simultaneous saves with same ID could cause issues
**Mitigation**:
- Each save generates new UUID, avoiding conflicts
- KV handles concurrent writes to different keys
- Same-key writes are last-write-wins (acceptable)

## Migration Plan

### Development to Production
Cloudflare KV works identically in development (local) and production:
1. Development uses local KV namespace (configured in `wrangler.jsonc`)
2. Production uses production KV namespace (same binding name)
3. No code changes required between environments

## Open Questions

1. **Should we implement drawing name uniqueness validation?**
   - Current decision: No, allow duplicate names (UUIDs handle uniqueness)
   - Can revisit if users request this feature

2. **How to handle malformed KV data?**
   - Current decision: Zod validation, return 500 error on parse failure
   - Log issues for debugging

3. **Should load replace or merge with current canvas?**
   - Decision: Replace (destructive)
   - Future enhancement: Confirmation dialog if canvas has unsaved changes
