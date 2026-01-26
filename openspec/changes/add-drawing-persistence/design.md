# Design: Add Drawing Persistence

## Context
The interactive canvas currently stores shapes in local storage, providing basic session persistence. Users have requested the ability to save multiple named drawings that persist across sessions and devices using server-side storage (Cloudflare KV).

### Stakeholders
- End users who want to save and manage multiple canvas drawings
- Backend system (Cloudflare Workers with KV storage)

### Constraints
- Must use Cloudflare KV for storage (already configured with `KV` binding)
- Pagination required (10 items per page) for list API
- Drawing names must be unique
- UI must fit on same page as canvas
- Separate error handling for save and list operations

## Goals / Non-Goals

### Goals
- Enable users to save canvas drawings with custom names
- Enable users to list, load, and delete saved drawings
- Provide clear error feedback with retry capabilities
- Prevent duplicate drawing names

### Non-Goals
- User authentication (all drawings are accessible to all users)
- Drawing sharing or collaboration features
- Drawing versioning or history
- Offline-first sync capabilities

## Decisions

### Decision: KV Storage Schema
Store drawings using the drawing name as the KV key with a prefix for namespacing.

**Rationale**: Simple and efficient for the current use case. KV list operations support prefix filtering.

**Key Format**: `drawing:<name>` (e.g., `drawing:my-landscape`)

**Value Format** (JSON):
```typescript
interface StoredDrawing {
  name: string;
  shapes: Shape[];
  createdAt: string;  // ISO 8601
  updatedAt: string;  // ISO 8601
}
```

**Alternatives Considered**:
1. Using numeric IDs - Rejected because names are more user-friendly and required for uniqueness check
2. Single JSON file with all drawings - Rejected due to KV value size limits and concurrency issues
3. User-prefixed keys - Rejected since authentication is not in scope (Non-Goal)

### Decision: Pagination Strategy
Use cursor-based pagination via KV's native list cursor support.

**Rationale**: KV list operation returns a cursor for pagination which is efficient and consistent.

**API Response Format**:
```typescript
interface ListDrawingsResponse {
  drawings: DrawingMetadata[];
  nextCursor: string | null;
  hasMore: boolean;
}
```

**Alternatives Considered**:
1. Offset-based pagination - Not natively supported by KV list
2. Loading all and paginating client-side - Inefficient for large datasets

### Decision: UI Layout
Place save controls (input + button) at the top of the canvas area, next to existing toolbar buttons. Place the saved drawings list in the sidebar area below statistics.

**Rationale**: Maximizes canvas space while keeping all controls accessible. Consistent with existing UI patterns.

### Decision: Error Handling Strategy
Maintain separate error states for save and list operations, displayed in their respective UI areas.

**Rationale**: Users should be able to continue using one feature even if another fails. List errors should show retry button; save errors should show inline message near the input.

## Risks / Trade-offs

| Risk | Impact | Mitigation |
|------|--------|------------|
| No authentication - all drawings shared | Medium | Document as known limitation; future enhancement could add user scoping |
| KV eventual consistency | Low | Acceptable for this use case; refresh list after save |
| Name collisions | Medium | Validate uniqueness before save; return clear error if exists |
| Large drawings exceed KV limits | Low | KV supports up to 25 MiB; typical drawings are much smaller |

## Migration Plan
Not applicable - this is a new feature with no existing data.

## Open Questions
None at this time.
