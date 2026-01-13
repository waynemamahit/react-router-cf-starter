# Project Context

## Purpose

Create a full-stack React application with React Router framework mode, deployed on Cloudflare Workers with comprehensive Cloudflare services integration. The project emphasizes clean architecture, maintainability, and high test coverage.

## Tech Stack

### Core

- **Runtime**: Node.js 24 LTS
- **Frontend Framework**: React 19 with React Router v7 (Framework Mode)
- **Backend Framework**: Hono (latest) for API routing
- **Language**: TypeScript 5 (latest) with strict type checking
- **Package Manager**: PNPM

### Styling & UI

- **CSS Framework**: TailwindCSS 4 (latest modern practices)
- **UI Components**: DaisyUI (latest version) with customized built-in themes
- **Design Principles**: Responsive, accessible, semantic HTML, SEO-optimized

### Code Quality

- **Linting & Formatting**: Biome.js
- **Schema Validation**: Zod (frontend & backend)
- **ORM**: Drizzle ORM (type-safe database access with migrations)

### Testing

- **Test Runner**: Vitest
- **Component Testing**: React Testing Library
- **Coverage Target**: Minimum 90%

### Cloudflare Services

- **Compute**: Cloudflare Workers
- **Database**: D1 (SQLite) + Hyperdrive (PostgreSQL connection pooling)
- **Storage**: R2 (object storage for static files)
- **Caching**: KV (key-value store)
- **Real-time & Messaging**: Durable Objects + KV (WebSockets, queues, PubSub)
- **AI/ML**: Workers AI + Vectorize (vector database for ML models)

### Local Development

- **Database**: Docker Compose for PostgreSQL (Hyperdrive local)
- **Cloudflare Emulation**: Wrangler with miniflare
- **Migrations**: Drizzle Kit for schema migrations

---

## Project Conventions

### Code Style

- Use TypeScript for type safety with strict mode enabled
- Never use `any` types - define proper interfaces and types
- Use Biome.js for consistent formatting and linting
- Use TailwindCSS with DaisyUI for styling
- Follow React Router framework mode conventions
- Use Zod for runtime schema validation

### Naming Conventions

- **Files/Folders**: kebab-case (e.g., `user-profile.tsx`)
- **Components**: PascalCase (e.g., `UserProfile`)
- **Functions/Variables**: camelCase (e.g., `getUserById`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `MAX_RETRY_COUNT`)
- **Types/Interfaces**: PascalCase with descriptive names (e.g., `UserProfileData`)

---

## Architecture Patterns

### Clean Architecture with Domain-Driven Design

Implement a layered architecture that separates concerns and enables easy migration:

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  (React Components, Routes, UI Logic)                        │
├─────────────────────────────────────────────────────────────┤
│                    Application Layer                         │
│  (Facades/Engines - Business Logic Orchestration)            │
├─────────────────────────────────────────────────────────────┤
│                      Domain Layer                            │
│  (Entities, Value Objects, Domain Services, Interfaces)      │
├─────────────────────────────────────────────────────────────┤
│                   Infrastructure Layer                       │
│  (Services: API, DB, External Services, Cloudflare Bindings) │
└─────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

#### Presentation Layer (`app/`)

- React components and routes
- UI state management
- Form handling and validation display
- User interaction handling

#### Application Layer (`app/core/application/` & `server/application/`)

- **Facades/Engines**: Orchestrate multiple services to fulfill use cases
- Business logic coordination
- Transaction management
- Cross-cutting concerns (logging, caching decisions)

```typescript
// Example: UserFacade orchestrates multiple services
export class UserFacade {
  constructor(
    private readonly userService: UserService,
    private readonly cacheService: CacheService,
    private readonly notificationService: NotificationService
  ) {}

  async createUserWithNotification(data: CreateUserInput): Promise<User> {
    const user = await this.userService.create(data);
    await this.cacheService.invalidate(`users:*`);
    await this.notificationService.sendWelcome(user);
    return user;
  }
}
```

#### Domain Layer (`app/core/domain/` & `server/domain/`)

- **Entities**: Core business objects with identity
- **Value Objects**: Immutable objects without identity
- **Domain Services**: Business logic that doesn't fit in entities
- **Interfaces/Ports**: Contracts for infrastructure implementations

```typescript
// Domain entities and interfaces - no infrastructure dependencies
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<User>;
}

export class User {
  constructor(
    public readonly id: string,
    public readonly email: Email,
    public readonly profile: UserProfile
  ) {}
}
```

#### Infrastructure Layer (`server/infrastructure/`)

- **Services**: Direct integrations with external systems
- API clients, database access, Cloudflare bindings
- Implementation of domain interfaces

```typescript
// Infrastructure service implementing domain interface
export class D1UserRepository implements UserRepository {
  constructor(private readonly db: D1Database) {}

  async findById(id: string): Promise<User | null> {
    const result = await this.db
      .prepare("SELECT * FROM users WHERE id = ?")
      .bind(id)
      .first();
    return result ? this.toDomain(result) : null;
  }
}
```

### SOLID Principles Implementation

#### Single Responsibility (S)

- Each class/module has one reason to change
- Separate concerns into distinct files

#### Open/Closed (O)

- Use interfaces and dependency injection
- Extend behavior through composition, not modification

#### Liskov Substitution (L)

- Ensure subtypes are substitutable for their base types
- Use TypeScript interfaces to enforce contracts

#### Interface Segregation (I)

- Create focused, specific interfaces
- Avoid fat interfaces with unused methods

#### Dependency Inversion (D)

- High-level modules depend on abstractions
- Infrastructure implementations injected at runtime

---

## Project Structure

```
react-router-cf-starter/
├── app/                              # Frontend application
│   ├── components/                   # Reusable UI components
│   │   ├── common/                   # Generic components (Button, Modal, Toast, etc.)
│   │   ├── layout/                   # Layout components (Header, Footer, Sidebar)
│   │   └── features/                 # Feature-specific components
│   ├── core/
│   │   ├── application/              # Frontend facades/engines
│   │   │   └── facades/              # Business logic orchestrators
│   │   ├── domain/                   # Shared domain models
│   │   │   ├── entities/             # Domain entities
│   │   │   ├── value-objects/        # Value objects
│   │   │   └── interfaces/           # Domain interfaces/ports
│   │   └── infrastructure/           # Frontend infrastructure
│   │       └── services/             # API clients, storage adapters
│   ├── hooks/                        # Custom React hooks
│   ├── routes/                       # React Router routes
│   ├── styles/                       # Global styles and themes
│   ├── utils/                        # Utility functions
│   ├── root.tsx                      # Root component
│   ├── routes.ts                     # Route definitions
│   └── entry.server.tsx              # Server entry point
├── database/                         # Drizzle ORM schemas and migrations
│   ├── d1/                           # D1 (SQLite) database
│   │   ├── schema/                   # D1 schema definitions
│   │   │   ├── users.ts              # Users table schema
│   │   │   ├── posts.ts              # Posts table schema
│   │   │   └── index.ts              # Schema exports
│   │   ├── migrations/               # D1 migration files
│   │   └── drizzle.config.ts         # D1 Drizzle configuration
│   ├── hyperdrive/                   # Hyperdrive (PostgreSQL) database
│   │   ├── schema/                   # PostgreSQL schema definitions
│   │   │   ├── analytics.ts          # Analytics table schema
│   │   │   ├── audit-logs.ts         # Audit logs table schema
│   │   │   └── index.ts              # Schema exports
│   │   ├── migrations/               # PostgreSQL migration files
│   │   └── drizzle.config.ts         # Hyperdrive Drizzle configuration
│   └── index.ts                      # Database exports and utilities
├── server/                           # Backend application
│   ├── api/                          # Hono API routes
│   │   ├── routes/                   # Route handlers
│   │   └── middleware/               # API middleware
│   ├── application/                  # Backend facades/engines
│   │   ├── facades/                  # Business logic orchestrators
│   │   └── engines/                  # Complex business processes
│   ├── domain/                       # Backend domain layer
│   │   ├── entities/                 # Domain entities
│   │   ├── value-objects/            # Value objects
│   │   ├── services/                 # Domain services
│   │   └── interfaces/               # Repository interfaces
│   ├── infrastructure/               # Backend infrastructure
│   │   ├── database/                 # D1/Hyperdrive repository implementations
│   │   │   ├── d1/                   # D1 repositories
│   │   │   └── hyperdrive/           # Hyperdrive repositories
│   │   ├── storage/                  # R2 implementations
│   │   ├── cache/                    # KV implementations
│   │   ├── queue/                    # Queue implementations
│   │   ├── ai/                       # Workers AI implementations
│   │   └── realtime/                 # Durable Objects implementations
│   └── durable-objects/              # Durable Object classes
├── shared/                           # Shared code (frontend & backend)
│   ├── schemas/                      # Zod schemas
│   ├── types/                        # Shared TypeScript types
│   └── utils/                        # Shared utilities
├── tests/                            # Test files
│   ├── unit/                         # Unit tests
│   │   ├── components/               # Component tests
│   │   ├── hooks/                    # Hook tests
│   │   ├── api/                      # API route tests
│   │   └── utils/                    # Utility tests
│   ├── integration/                  # Integration tests
│   │   ├── api/                      # API integration tests
│   │   └── features/                 # Feature integration tests
│   └── fixtures/                     # Test fixtures and mocks
├── openspec/                         # OpenSpec documentation
│   ├── project.md                    # Project context (this file)
│   └── AGENTS.md                     # Agent instructions
├── scripts/                          # Build and utility scripts
├── docker-compose.yml                # Local development services
└── wrangler.jsonc                    # Cloudflare Worker configuration
```

---

## Testing Strategy

### Test Types and Coverage Requirements

| Test Type   | Coverage Target | Scope                                   |
| ----------- | --------------- | --------------------------------------- |
| Unit        | 90%+            | Components, hooks, utilities, services  |
| Integration | 90%+            | API endpoints, feature workflows        |
| E2E         | Critical paths  | User journeys (optional, for key flows) |

### Unit Testing Guidelines

```typescript
// Component test example
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { UserProfile } from "./UserProfile";

describe("UserProfile", () => {
  it("displays user information correctly", () => {
    render(<UserProfile user={mockUser} />);

    expect(screen.getByRole("heading", { name: /john doe/i })).toBeInTheDocument();
    expect(screen.getByText(/john@example.com/i)).toBeInTheDocument();
  });

  it("calls onEdit when edit button is clicked", async () => {
    const onEdit = vi.fn();
    render(<UserProfile user={mockUser} onEdit={onEdit} />);

    await userEvent.click(screen.getByRole("button", { name: /edit/i }));

    expect(onEdit).toHaveBeenCalledWith(mockUser.id);
  });
});
```

### API Testing Guidelines

```typescript
// API route test example
import { describe, it, expect, beforeEach } from "vitest";
import { createTestApp } from "../fixtures/test-app";

describe("POST /api/users", () => {
  let app: ReturnType<typeof createTestApp>;

  beforeEach(() => {
    app = createTestApp();
  });

  it("creates a user with valid data", async () => {
    const response = await app.request("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com", name: "Test User" }),
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.user).toMatchObject({
      email: "test@example.com",
      name: "Test User",
    });
  });

  it("rejects invalid email format", async () => {
    const response = await app.request("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "invalid", name: "Test User" }),
    });

    expect(response.status).toBe(400);
  });
});
```

### Integration Testing Guidelines

```typescript
// Feature integration test example
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { setupTestEnvironment, cleanupTestEnvironment } from "../fixtures/test-env";

describe("User Registration Flow", () => {
  beforeAll(async () => {
    await setupTestEnvironment();
  });

  afterAll(async () => {
    await cleanupTestEnvironment();
  });

  it("completes full registration workflow", async () => {
    // 1. Create user via API
    const createResponse = await api.post("/users", { ... });
    expect(createResponse.status).toBe(201);

    // 2. Verify cache was updated
    const cachedUser = await kv.get(`user:${createResponse.data.id}`);
    expect(cachedUser).toBeDefined();

    // 3. Verify welcome notification was queued
    const queuedMessages = await getQueueMessages();
    expect(queuedMessages).toContainEqual(
      expect.objectContaining({ type: "welcome_email" })
    );
  });
});
```

---

## Drizzle ORM Configuration

This project uses Drizzle ORM with **separate schemas** for D1 (SQLite) and Hyperdrive (PostgreSQL) databases. Each database has its own configuration, schema definitions, and migration files.

### Database Selection Guidelines

| Database   | Use Case                                           | Characteristics                          |
| ---------- | -------------------------------------------------- | ---------------------------------------- |
| D1 (SQLite)| User data, sessions, application state             | Edge-native, low latency, ACID compliant |
| Hyperdrive | Analytics, audit logs, complex queries, reporting  | PostgreSQL power, connection pooling     |

### D1 Configuration (SQLite)

```typescript
// database/d1/drizzle.config.ts
import type { Config } from "drizzle-kit";

export default {
  schema: "./database/d1/schema/index.ts",
  out: "./database/d1/migrations",
  dialect: "sqlite",
  driver: "d1-http",
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.D1_DATABASE_ID!,
    token: process.env.CLOUDFLARE_API_TOKEN!,
  },
} satisfies Config;
```

### D1 Schema Example

```typescript
// database/d1/schema/users.ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role", { enum: ["admin", "user", "guest"] }).default("user"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

```typescript
// database/d1/schema/posts.ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { users } from "./users";

export const posts = sqliteTable("posts", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorId: text("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: text("status", { enum: ["draft", "published", "archived"] }).default("draft"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
```

```typescript
// database/d1/schema/index.ts
export * from "./users";
export * from "./posts";
```

### Hyperdrive Configuration (PostgreSQL)

```typescript
// database/hyperdrive/drizzle.config.ts
import type { Config } from "drizzle-kit";

export default {
  schema: "./database/hyperdrive/schema/index.ts",
  out: "./database/hyperdrive/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.HYPERDRIVE_URL || "postgresql://dev:dev@localhost:5432/app_development",
  },
} satisfies Config;
```

### Hyperdrive Schema Example

```typescript
// database/hyperdrive/schema/analytics.ts
import { pgTable, uuid, text, timestamp, jsonb, integer } from "drizzle-orm/pg-core";

export const analyticsEvents = pgTable("analytics_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventType: text("event_type").notNull(),
  userId: text("user_id"),
  sessionId: text("session_id").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  pageUrl: text("page_url"),
  referrer: text("referrer"),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type NewAnalyticsEvent = typeof analyticsEvents.$inferInsert;
```

```typescript
// database/hyperdrive/schema/audit-logs.ts
import { pgTable, uuid, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  userId: text("user_id").notNull(),
  previousData: jsonb("previous_data").$type<Record<string, unknown>>(),
  newData: jsonb("new_data").$type<Record<string, unknown>>(),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
```

```typescript
// database/hyperdrive/schema/index.ts
export * from "./analytics";
export * from "./audit-logs";
```

### Database Client Factory

```typescript
// database/index.ts
import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as d1Schema from "./d1/schema";
import * as hyperdriveSchema from "./hyperdrive/schema";

// D1 Client Factory
export function createD1Client(d1Database: D1Database) {
  return drizzleD1(d1Database, { schema: d1Schema });
}

// Hyperdrive Client Factory
export function createHyperdriveClient(connectionString: string) {
  const client = postgres(connectionString);
  return drizzlePg(client, { schema: hyperdriveSchema });
}

// Type exports
export type D1Client = ReturnType<typeof createD1Client>;
export type HyperdriveClient = ReturnType<typeof createHyperdriveClient>;

// Re-export schemas
export { d1Schema, hyperdriveSchema };
```

### Repository Pattern with Drizzle

```typescript
// server/infrastructure/database/d1/user-repository.ts
import { eq } from "drizzle-orm";
import type { D1Client } from "../../../../database";
import { users, type User, type NewUser } from "../../../../database/d1/schema";
import type { UserRepository } from "../../../domain/interfaces/user-repository";

export class DrizzleUserRepository implements UserRepository {
  constructor(private readonly db: D1Client) {}

  async findById(id: string): Promise<User | null> {
    const result = await this.db.query.users.findFirst({
      where: eq(users.id, id),
    });
    return result ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db.query.users.findFirst({
      where: eq(users.email, email),
    });
    return result ?? null;
  }

  async create(data: NewUser): Promise<User> {
    const [user] = await this.db.insert(users).values(data).returning();
    return user;
  }

  async update(id: string, data: Partial<NewUser>): Promise<User> {
    const [user] = await this.db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(users).where(eq(users.id, id));
  }
}
```

```typescript
// server/infrastructure/database/hyperdrive/analytics-repository.ts
import { eq, and, gte, lte } from "drizzle-orm";
import type { HyperdriveClient } from "../../../../database";
import { analyticsEvents, type AnalyticsEvent, type NewAnalyticsEvent } from "../../../../database/hyperdrive/schema";
import type { AnalyticsRepository } from "../../../domain/interfaces/analytics-repository";

export class DrizzleAnalyticsRepository implements AnalyticsRepository {
  constructor(private readonly db: HyperdriveClient) {}

  async track(event: NewAnalyticsEvent): Promise<AnalyticsEvent> {
    const [result] = await this.db.insert(analyticsEvents).values(event).returning();
    return result;
  }

  async getEventsByUser(userId: string, startDate: Date, endDate: Date): Promise<AnalyticsEvent[]> {
    return this.db.query.analyticsEvents.findMany({
      where: and(
        eq(analyticsEvents.userId, userId),
        gte(analyticsEvents.createdAt, startDate),
        lte(analyticsEvents.createdAt, endDate)
      ),
      orderBy: (events, { desc }) => [desc(events.createdAt)],
    });
  }

  async getEventCountByType(eventType: string): Promise<number> {
    const result = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(analyticsEvents)
      .where(eq(analyticsEvents.eventType, eventType));
    return result[0]?.count ?? 0;
  }
}
```

### Migration Commands

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "db:generate:d1": "drizzle-kit generate --config=database/d1/drizzle.config.ts",
    "db:generate:hyperdrive": "drizzle-kit generate --config=database/hyperdrive/drizzle.config.ts",
    "db:migrate:d1": "wrangler d1 migrations apply DB --local",
    "db:migrate:d1:remote": "wrangler d1 migrations apply DB --remote",
    "db:migrate:hyperdrive": "drizzle-kit migrate --config=database/hyperdrive/drizzle.config.ts",
    "db:push:d1": "drizzle-kit push --config=database/d1/drizzle.config.ts",
    "db:push:hyperdrive": "drizzle-kit push --config=database/hyperdrive/drizzle.config.ts",
    "db:studio:d1": "drizzle-kit studio --config=database/d1/drizzle.config.ts",
    "db:studio:hyperdrive": "drizzle-kit studio --config=database/hyperdrive/drizzle.config.ts"
  }
}
```

### Best Practices

#### Schema Separation Guidelines

| Criteria                        | D1 (SQLite)              | Hyperdrive (PostgreSQL)     |
| ------------------------------- | ------------------------ | --------------------------- |
| Read-heavy, low complexity      | ✅ Preferred             | ❌ Overkill                 |
| Write-heavy, high concurrency   | ⚠️ Limited              | ✅ Preferred                |
| Complex joins and aggregations  | ⚠️ Limited              | ✅ Preferred                |
| Edge access required            | ✅ Native                | ⚠️ Additional latency      |
| Full-text search                | ⚠️ Basic FTS            | ✅ Advanced (pg_trgm, etc.) |
| JSONB operations                | ❌ Limited               | ✅ Full support             |
| Transactional integrity         | ✅ ACID compliant        | ✅ ACID compliant           |

#### Migration Best Practices

1. **Never edit existing migrations** - Always create new migrations
2. **Test migrations locally** before deploying to production
3. **Use semantic migration names** - e.g., `0001_add_users_table.sql`
4. **Separate D1 and Hyperdrive migrations** - They have different SQL dialects
5. **Back up data** before running migrations in production

#### Type Safety Tips

```typescript
// Use inferred types from Drizzle schema
import type { User, NewUser } from "../database/d1/schema";

// Create type-safe insert/update helpers
const createUser = (data: NewUser): Promise<User> => {
  return db.insert(users).values(data).returning();
};

// Use Zod for runtime validation with Drizzle types
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { users } from "../database/d1/schema";

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
```

---

## Cloudflare Services Configuration

### Service Selection Guidelines

| Use Case                  | Service                  | When to Use                                       |
| ------------------------- | ------------------------ | ------------------------------------------------- |
| Relational Data           | D1 + Hyperdrive          | Structured data, complex queries, transactions    |
| Static Files              | R2                       | Images, videos, documents, user uploads           |
| Session/Cache             | KV                       | Fast key-value lookups, caching, sessions         |
| Real-time Features        | Durable Objects          | WebSockets, collaborative features, counters      |
| Queue Processing          | Durable Objects + KV     | Async tasks, job queues, reliable message delivery|
| PubSub Messaging          | Durable Objects + KV     | Event-driven architecture, fan-out messaging      |
| ML/AI Features            | Workers AI               | Text generation, summarization, classification    |
| Semantic Search           | Vectorize                | Similarity search, recommendations, embeddings    |

### Local Development Configuration

All Cloudflare services should be configurable for local testing:

```typescript
// wrangler.jsonc - Development configuration
{
  "name": "react-router-cf-starter",
  "compatibility_date": "2024-01-01",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "app-db",
      "database_id": "local"
    }
  ],
  "kv_namespaces": [
    {
      "binding": "CACHE",
      "id": "local-cache"
    }
  ],
  "r2_buckets": [
    {
      "binding": "STORAGE",
      "bucket_name": "local-storage"
    }
  ],
  "durable_objects": {
    "bindings": [
      {
        "name": "REALTIME",
        "class_name": "RealtimeObject"
      },
      {
        "name": "QUEUE_MANAGER",
        "class_name": "QueueManagerObject"
      },
      {
        "name": "PUBSUB",
        "class_name": "PubSubObject"
      }
    ]
  }
}
```

### Docker Compose for Local PostgreSQL (Hyperdrive)

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
      POSTGRES_DB: app_development
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init.sql:/docker-entrypoint-initdb.d/init.sql

volumes:
  postgres_data:
```

### Durable Objects + KV for Queues and PubSub

This project uses Durable Objects combined with KV for implementing reliable queue processing and PubSub messaging patterns. This approach provides:

- **Strong consistency** within each Durable Object
- **Horizontal scalability** through DO sharding
- **Persistent state** with KV for cross-DO communication
- **Real-time notifications** via WebSocket connections

#### Queue Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Worker Request                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    QueueManagerObject (DO)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Job Queue  │  │  Retry      │  │  Dead       │              │
│  │  (pending)  │  │  Queue      │  │  Letter     │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                              │                                   │
│                    Worker Alarm (Processing)                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       KV (Job Results/State)                     │
│  job:{id}:status  │  job:{id}:result  │  queue:metrics          │
└─────────────────────────────────────────────────────────────────┘
```

#### QueueManagerObject Implementation Pattern

```typescript
// server/durable-objects/queue-manager.ts
import { DurableObject } from "cloudflare:workers";

interface QueueJob<T = unknown> {
  id: string;
  type: string;
  payload: T;
  createdAt: number;
  retryCount: number;
  maxRetries: number;
  scheduledAt?: number;
}

export class QueueManagerObject extends DurableObject<Env> {
  private jobs: Map<string, QueueJob> = new Map();

  async enqueue<T>(job: Omit<QueueJob<T>, "id" | "createdAt" | "retryCount">): Promise<string> {
    const id = crypto.randomUUID();
    const queueJob: QueueJob<T> = {
      ...job,
      id,
      createdAt: Date.now(),
      retryCount: 0,
    };

    this.jobs.set(id, queueJob);
    await this.ctx.storage.put(`job:${id}`, queueJob);

    // Store job reference in KV for cross-worker access
    await this.env.CACHE.put(`queue:job:${id}:status`, "pending", {
      expirationTtl: 86400, // 24 hours
    });

    // Schedule processing if not already scheduled
    const currentAlarm = await this.ctx.storage.getAlarm();
    if (!currentAlarm) {
      await this.ctx.storage.setAlarm(Date.now() + 100);
    }

    return id;
  }

  async alarm(): Promise<void> {
    const jobs = await this.ctx.storage.list<QueueJob>({ prefix: "job:" });

    for (const [key, job] of jobs) {
      if (job.scheduledAt && job.scheduledAt > Date.now()) continue;

      try {
        await this.processJob(job);
        await this.ctx.storage.delete(key);
        await this.env.CACHE.put(`queue:job:${job.id}:status`, "completed");
      } catch (error) {
        await this.handleJobError(job, error);
      }
    }

    // Reschedule if more jobs exist
    const remainingJobs = await this.ctx.storage.list({ prefix: "job:" });
    if (remainingJobs.size > 0) {
      await this.ctx.storage.setAlarm(Date.now() + 1000);
    }
  }

  private async processJob(job: QueueJob): Promise<void> {
    // Dispatch to appropriate handler based on job type
    switch (job.type) {
      case "email":
        await this.handleEmailJob(job);
        break;
      case "notification":
        await this.handleNotificationJob(job);
        break;
      default:
        throw new Error(`Unknown job type: ${job.type}`);
    }
  }

  private async handleJobError(job: QueueJob, error: unknown): Promise<void> {
    job.retryCount++;

    if (job.retryCount >= job.maxRetries) {
      // Move to dead letter queue
      await this.ctx.storage.put(`dlq:${job.id}`, { ...job, error: String(error) });
      await this.ctx.storage.delete(`job:${job.id}`);
      await this.env.CACHE.put(`queue:job:${job.id}:status`, "failed");
    } else {
      // Exponential backoff retry
      job.scheduledAt = Date.now() + Math.pow(2, job.retryCount) * 1000;
      await this.ctx.storage.put(`job:${job.id}`, job);
    }
  }

  private async handleEmailJob(job: QueueJob): Promise<void> {
    // Email sending logic
  }

  private async handleNotificationJob(job: QueueJob): Promise<void> {
    // Notification logic
  }
}
```

#### PubSub Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       Publishers (Workers)                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                    publish(topic, message)
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PubSubObject (DO)                           │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Subscriptions Map                                       │    │
│  │  topic:users → [ws1, ws2, ws3]                          │    │
│  │  topic:orders → [ws2, ws4]                              │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                    Fan-out to WebSockets                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       KV (Message History)                       │
│  pubsub:{topic}:messages  │  pubsub:{topic}:subscribers         │
└─────────────────────────────────────────────────────────────────┘
```

#### PubSubObject Implementation Pattern

```typescript
// server/durable-objects/pubsub.ts
import { DurableObject } from "cloudflare:workers";

interface PubSubMessage<T = unknown> {
  id: string;
  topic: string;
  payload: T;
  timestamp: number;
}

export class PubSubObject extends DurableObject<Env> {
  private subscriptions: Map<string, Set<WebSocket>> = new Map();

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/subscribe") {
      return this.handleWebSocket(request);
    }

    if (url.pathname === "/publish" && request.method === "POST") {
      return this.handlePublish(request);
    }

    return new Response("Not Found", { status: 404 });
  }

  private handleWebSocket(request: Request): Response {
    const upgradeHeader = request.headers.get("Upgrade");
    if (upgradeHeader !== "websocket") {
      return new Response("Expected WebSocket", { status: 426 });
    }

    const { 0: client, 1: server } = new WebSocketPair();
    this.ctx.acceptWebSocket(server);

    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    try {
      const data = JSON.parse(message as string);

      switch (data.action) {
        case "subscribe":
          await this.subscribe(ws, data.topic);
          break;
        case "unsubscribe":
          await this.unsubscribe(ws, data.topic);
          break;
        case "publish":
          await this.publish(data.topic, data.payload);
          break;
      }
    } catch (error) {
      ws.send(JSON.stringify({ error: "Invalid message format" }));
    }
  }

  async webSocketClose(ws: WebSocket): Promise<void> {
    // Remove from all subscriptions
    for (const [topic, subscribers] of this.subscriptions) {
      subscribers.delete(ws);
      if (subscribers.size === 0) {
        this.subscriptions.delete(topic);
      }
    }
  }

  private async subscribe(ws: WebSocket, topic: string): Promise<void> {
    if (!this.subscriptions.has(topic)) {
      this.subscriptions.set(topic, new Set());
    }
    this.subscriptions.get(topic)!.add(ws);

    // Store subscription in KV for persistence
    const key = `pubsub:${topic}:subscribers`;
    const count = this.subscriptions.get(topic)!.size;
    await this.env.CACHE.put(key, String(count));

    ws.send(JSON.stringify({ action: "subscribed", topic }));
  }

  private async unsubscribe(ws: WebSocket, topic: string): Promise<void> {
    this.subscriptions.get(topic)?.delete(ws);
    ws.send(JSON.stringify({ action: "unsubscribed", topic }));
  }

  private async publish<T>(topic: string, payload: T): Promise<void> {
    const message: PubSubMessage<T> = {
      id: crypto.randomUUID(),
      topic,
      payload,
      timestamp: Date.now(),
    };

    // Store message in KV for history
    await this.env.CACHE.put(
      `pubsub:${topic}:message:${message.id}`,
      JSON.stringify(message),
      { expirationTtl: 3600 } // 1 hour retention
    );

    // Fan-out to all subscribers
    const subscribers = this.subscriptions.get(topic);
    if (subscribers) {
      const messageStr = JSON.stringify({ action: "message", ...message });
      for (const ws of subscribers) {
        try {
          ws.send(messageStr);
        } catch {
          subscribers.delete(ws);
        }
      }
    }
  }

  private async handlePublish(request: Request): Promise<Response> {
    const { topic, payload } = await request.json<{ topic: string; payload: unknown }>();
    await this.publish(topic, payload);
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }
}
```

#### Usage in API Routes

```typescript
// server/api/routes/jobs.ts
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const createJobSchema = z.object({
  type: z.enum(["email", "notification"]),
  payload: z.record(z.unknown()),
  maxRetries: z.number().min(1).max(10).default(3),
});

const jobs = new Hono<{ Bindings: Env }>();

jobs.post("/", zValidator("json", createJobSchema), async (c) => {
  const data = c.req.valid("json");

  // Get or create queue manager DO instance
  const id = c.env.QUEUE_MANAGER.idFromName("default");
  const queueManager = c.env.QUEUE_MANAGER.get(id);

  // Enqueue the job
  const response = await queueManager.fetch(
    new Request("http://internal/enqueue", {
      method: "POST",
      body: JSON.stringify(data),
    })
  );

  const result = await response.json<{ jobId: string }>();
  return c.json(result, 201);
});

jobs.get("/:id/status", async (c) => {
  const jobId = c.req.param("id");
  const status = await c.env.CACHE.get(`queue:job:${jobId}:status`);

  if (!status) {
    return c.json({ error: "Job not found" }, 404);
  }

  return c.json({ jobId, status });
});

export { jobs };
```

---

## Accessibility and SEO Standards

### Semantic HTML Requirements

- Use appropriate heading hierarchy (`h1` > `h2` > `h3`...)
- Use semantic elements (`nav`, `main`, `article`, `section`, `aside`, `footer`)
- Use `button` for actions, `a` for navigation
- Use proper form labels and fieldsets
- Structure content logically for screen readers and crawlers

### ARIA Implementation

- Add `aria-label` for icon-only buttons
- Use `aria-live` regions for dynamic content
- Implement `aria-expanded` for collapsible sections
- Use `role` attributes when semantic HTML isn't sufficient

```typescript
// Accessible component example
export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  return (
    <dialog
      open={isOpen}
      aria-modal="true"
      aria-labelledby="modal-title"
      className="modal"
    >
      <div className="modal-box">
        <h2 id="modal-title" className="text-lg font-bold">
          {title}
        </h2>
        <div role="document">{children}</div>
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="btn btn-circle btn-ghost absolute right-2 top-2"
        >
          ✕
        </button>
      </div>
      <div className="modal-backdrop" onClick={onClose} aria-hidden="true" />
    </dialog>
  );
}
```

### SEO Best Practices

#### Meta Tags Configuration

```typescript
// app/components/common/SEO.tsx
import { useLocation } from "react-router";

interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  type?: "website" | "article" | "product";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  noIndex?: boolean;
}

export function SEO({
  title,
  description,
  keywords = [],
  image,
  type = "website",
  publishedTime,
  modifiedTime,
  author,
  noIndex = false,
}: SEOProps) {
  const location = useLocation();
  const siteUrl = "https://example.com";
  const canonicalUrl = `${siteUrl}${location.pathname}`;
  const fullTitle = `${title} | Site Name`;

  return (
    <>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      {keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(", ")} />
      )}
      <link rel="canonical" href={canonicalUrl} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {image && <meta property="og:image" content={image} />}
      <meta property="og:site_name" content="Site Name" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      {image && <meta property="twitter:image" content={image} />}

      {/* Article-specific */}
      {type === "article" && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === "article" && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === "article" && author && (
        <meta property="article:author" content={author} />
      )}
    </>
  );
}
```

#### Structured Data (JSON-LD)

```typescript
// app/components/common/StructuredData.tsx
interface OrganizationSchema {
  type: "Organization";
  name: string;
  url: string;
  logo?: string;
  sameAs?: string[];
}

interface ArticleSchema {
  type: "Article";
  headline: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author: { name: string; url?: string };
}

interface BreadcrumbSchema {
  type: "BreadcrumbList";
  items: { name: string; url: string }[];
}

type SchemaType = OrganizationSchema | ArticleSchema | BreadcrumbSchema;

export function StructuredData({ schema }: { schema: SchemaType }) {
  const generateSchema = () => {
    switch (schema.type) {
      case "Organization":
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: schema.name,
          url: schema.url,
          logo: schema.logo,
          sameAs: schema.sameAs,
        };
      case "Article":
        return {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: schema.headline,
          description: schema.description,
          image: schema.image,
          datePublished: schema.datePublished,
          dateModified: schema.dateModified,
          author: {
            "@type": "Person",
            name: schema.author.name,
            url: schema.author.url,
          },
        };
      case "BreadcrumbList":
        return {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: schema.items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: item.url,
          })),
        };
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(generateSchema()) }}
    />
  );
}
```

#### Route-Level SEO with React Router

```typescript
// app/routes/blog.$slug.tsx
import type { Route } from "./+types/blog.$slug";
import { SEO } from "~/components/common/SEO";
import { StructuredData } from "~/components/common/StructuredData";

export function meta({ data }: Route.MetaArgs) {
  if (!data?.post) {
    return [{ title: "Post Not Found" }];
  }

  return [
    { title: `${data.post.title} | Blog` },
    { name: "description", content: data.post.excerpt },
    { property: "og:title", content: data.post.title },
    { property: "og:description", content: data.post.excerpt },
    { property: "og:image", content: data.post.featuredImage },
    { property: "og:type", content: "article" },
    { property: "article:published_time", content: data.post.publishedAt },
    { property: "article:author", content: data.post.author.name },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const post = await getPostBySlug(params.slug);
  if (!post) {
    throw new Response("Not Found", { status: 404 });
  }
  return { post };
}

export default function BlogPost({ loaderData }: Route.ComponentProps) {
  const { post } = loaderData;

  return (
    <article>
      <StructuredData
        schema={{
          type: "Article",
          headline: post.title,
          description: post.excerpt,
          image: post.featuredImage,
          datePublished: post.publishedAt,
          dateModified: post.updatedAt,
          author: { name: post.author.name, url: post.author.url },
        }}
      />
      <header>
        <h1>{post.title}</h1>
        <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
        <address rel="author">{post.author.name}</address>
      </header>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
```

#### SEO Checklist

| Requirement                          | Implementation                                   |
| ------------------------------------ | ------------------------------------------------ |
| Unique page titles                   | Use `meta()` function in each route              |
| Meta descriptions (150-160 chars)    | Descriptive, keyword-rich summaries              |
| Canonical URLs                       | Prevent duplicate content issues                 |
| Open Graph tags                      | Social media sharing optimization                |
| Twitter Card tags                    | Twitter-specific sharing                         |
| Structured data (JSON-LD)            | Rich snippets in search results                  |
| Semantic heading hierarchy           | Single `h1`, logical `h2-h6` nesting             |
| Alt text for images                  | Descriptive text for accessibility and SEO       |
| Internal linking                     | Use descriptive anchor text                      |
| Mobile-friendly design               | Responsive layout with TailwindCSS               |
| Fast page load (Core Web Vitals)     | Optimize LCP, FID, CLS                           |
| Sitemap.xml                          | Auto-generate from routes                        |
| robots.txt                           | Control crawler access                           |

#### Sitemap Generation

```typescript
// app/routes/sitemap[.]xml.ts
import type { Route } from "./+types/sitemap[.]xml";

const SITE_URL = "https://example.com";

export async function loader({ context }: Route.LoaderArgs) {
  // Fetch dynamic routes from database
  const posts = await getAllPublishedPosts(context);
  const products = await getAllProducts(context);

  const staticRoutes = [
    { url: "/", priority: 1.0, changefreq: "daily" },
    { url: "/about", priority: 0.8, changefreq: "monthly" },
    { url: "/blog", priority: 0.9, changefreq: "weekly" },
    { url: "/contact", priority: 0.7, changefreq: "monthly" },
  ];

  const postRoutes = posts.map((post) => ({
    url: `/blog/${post.slug}`,
    lastmod: post.updatedAt,
    priority: 0.7,
    changefreq: "weekly" as const,
  }));

  const productRoutes = products.map((product) => ({
    url: `/products/${product.slug}`,
    lastmod: product.updatedAt,
    priority: 0.8,
    changefreq: "daily" as const,
  }));

  const allRoutes = [...staticRoutes, ...postRoutes, ...productRoutes];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allRoutes
    .map(
      (route) => `
  <url>
    <loc>${SITE_URL}${route.url}</loc>
    ${route.lastmod ? `<lastmod>${route.lastmod}</lastmod>` : ""}
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
    )
    .join("")}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
```

#### Performance Optimization for SEO

```typescript
// server/middleware/cache-headers.ts
import { createMiddleware } from "hono/factory";

export const cacheHeaders = createMiddleware(async (c, next) => {
  await next();

  const url = new URL(c.req.url);

  // Static assets - long cache
  if (url.pathname.match(/\.(js|css|png|jpg|svg|woff2?)$/)) {
    c.res.headers.set("Cache-Control", "public, max-age=31536000, immutable");
  }

  // HTML pages - short cache with revalidation
  if (c.res.headers.get("Content-Type")?.includes("text/html")) {
    c.res.headers.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
  }

  // API responses - no cache by default
  if (url.pathname.startsWith("/api/")) {
    c.res.headers.set("Cache-Control", "no-store");
  }
});
```

---

## DaisyUI with Customized Built-in Themes

This project uses DaisyUI's built-in themes with customizations to maintain consistency while leveraging the well-designed theme foundations.

### Theme Selection and Customization

DaisyUI provides many built-in themes. Instead of creating themes from scratch, extend existing themes with brand-specific customizations:

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";
import daisyui from "daisyui";

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        // Extend the built-in "light" theme
        light: {
          ...require("daisyui/src/theming/themes")["light"],
          primary: "#6366f1",           // Custom primary (Indigo)
          "primary-content": "#ffffff",
          secondary: "#8b5cf6",          // Custom secondary (Violet)
          accent: "#f59e0b",             // Custom accent (Amber)
          "--rounded-btn": "0.5rem",     // Button border radius
          "--rounded-box": "0.75rem",    // Card/box border radius
        },
      },
      {
        // Extend the built-in "dark" theme
        dark: {
          ...require("daisyui/src/theming/themes")["dark"],
          primary: "#818cf8",            // Lighter primary for dark mode
          "primary-content": "#1f2937",
          secondary: "#a78bfa",
          accent: "#fbbf24",
          "base-100": "#1f2937",
          "base-200": "#111827",
          "base-300": "#0f172a",
          "--rounded-btn": "0.5rem",
          "--rounded-box": "0.75rem",
        },
      },
      // Include other built-in themes as-is for variety
      "cupcake",
      "corporate",
      "synthwave",
      "cyberpunk",
    ],
    // Default theme
    darkTheme: "dark",
    // Prefix for DaisyUI classes (optional)
    prefix: "",
    // Log DaisyUI info (disable in production)
    logs: process.env.NODE_ENV === "development",
  },
} satisfies Config;
```

### Theme Switching Implementation

```typescript
// app/hooks/useTheme.ts
import { useState, useEffect, useCallback } from "react";

type Theme = "light" | "dark" | "cupcake" | "corporate" | "synthwave" | "cyberpunk";

const THEME_KEY = "app-theme";
const DEFAULT_THEME: Theme = "light";

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(THEME_KEY) as Theme | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    const initialTheme = stored || (prefersDark ? "dark" : DEFAULT_THEME);
    setThemeState(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return { theme, setTheme, toggleTheme, mounted };
}
```

```typescript
// app/components/common/ThemeSelector.tsx
import { useTheme } from "~/hooks/useTheme";

const AVAILABLE_THEMES = [
  { value: "light", label: "Light", icon: "☀️" },
  { value: "dark", label: "Dark", icon: "🌙" },
  { value: "cupcake", label: "Cupcake", icon: "🧁" },
  { value: "corporate", label: "Corporate", icon: "🏢" },
  { value: "synthwave", label: "Synthwave", icon: "🌆" },
  { value: "cyberpunk", label: "Cyberpunk", icon: "🤖" },
] as const;

export function ThemeSelector() {
  const { theme, setTheme, mounted } = useTheme();

  if (!mounted) {
    return <div className="skeleton w-32 h-10" />;
  }

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost">
        <span className="mr-2">
          {AVAILABLE_THEMES.find((t) => t.value === theme)?.icon}
        </span>
        Theme
        <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-200 rounded-box w-52"
        role="listbox"
        aria-label="Select theme"
      >
        {AVAILABLE_THEMES.map((t) => (
          <li key={t.value}>
            <button
              onClick={() => setTheme(t.value)}
              className={theme === t.value ? "active" : ""}
              role="option"
              aria-selected={theme === t.value}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Custom Component Patterns

Define custom components that extend DaisyUI's built-in components:

```typescript
// app/components/common/Toast.tsx
import { useEffect } from "react";

interface ToastProps {
  message: string;
  type: "info" | "success" | "warning" | "error";
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type, duration = 5000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const alertClass = {
    info: "alert-info",
    success: "alert-success",
    warning: "alert-warning",
    error: "alert-error",
  }[type];

  return (
    <div className="toast toast-end toast-top z-50" role="alert" aria-live="polite">
      <div className={`alert ${alertClass} shadow-lg`}>
        <span>{message}</span>
        <button
          onClick={onClose}
          className="btn btn-ghost btn-xs"
          aria-label="Dismiss notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
```

```typescript
// app/components/common/Modal.tsx
import { useEffect, useRef, type ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  size?: "sm" | "md" | "lg";
}

export function Modal({ isOpen, onClose, title, children, actions, size = "md" }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  const sizeClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-2xl",
  }[size];

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      onClose={onClose}
      aria-labelledby="modal-title"
    >
      <div className={`modal-box ${sizeClass}`}>
        <h3 id="modal-title" className="font-bold text-lg">
          {title}
        </h3>
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          aria-label="Close modal"
        >
          ✕
        </button>
        <div className="py-4">{children}</div>
        {actions && <div className="modal-action">{actions}</div>}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose} aria-label="Close">close</button>
      </form>
    </dialog>
  );
}
```

```typescript
// app/components/common/Carousel.tsx
import { useState, useEffect, useCallback } from "react";

interface CarouselProps {
  items: { id: string; content: ReactNode; alt?: string }[];
  autoPlay?: boolean;
  interval?: number;
}

export function Carousel({ items, autoPlay = false, interval = 5000 }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(goToNext, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, goToNext]);

  return (
    <div
      className="carousel w-full relative"
      role="region"
      aria-roledescription="carousel"
      aria-label="Image carousel"
    >
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`carousel-item w-full transition-opacity duration-500 ${
            index === currentIndex ? "block" : "hidden"
          }`}
          role="group"
          aria-roledescription="slide"
          aria-label={`Slide ${index + 1} of ${items.length}`}
          aria-hidden={index !== currentIndex}
        >
          {item.content}
        </div>
      ))}
      
      {/* Navigation buttons */}
      <div className="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
        <button
          onClick={goToPrev}
          className="btn btn-circle btn-primary"
          aria-label="Previous slide"
        >
          ❮
        </button>
        <button
          onClick={goToNext}
          className="btn btn-circle btn-primary"
          aria-label="Next slide"
        >
          ❯
        </button>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentIndex ? "bg-primary" : "bg-base-300"
            }`}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === currentIndex ? "true" : undefined}
          />
        ))}
      </div>
    </div>
  );
}
```

### Available Built-in Themes Reference

DaisyUI provides these built-in themes that can be customized:

| Theme       | Type  | Description                        |
| ----------- | ----- | ---------------------------------- |
| light       | Light | Default light theme                |
| dark        | Dark  | Default dark theme                 |
| cupcake     | Light | Soft, pastel colors                |
| bumblebee   | Light | Yellow-focused                     |
| emerald     | Light | Green-focused                      |
| corporate   | Light | Professional, muted                |
| synthwave   | Dark  | Retro neon aesthetic               |
| retro       | Light | Vintage, warm tones                |
| cyberpunk   | Dark  | Futuristic, high contrast          |
| valentine   | Light | Pink/red romantic theme            |
| halloween   | Dark  | Orange/black spooky theme          |
| garden      | Light | Nature-inspired greens             |
| forest      | Dark  | Dark green forest theme            |
| aqua        | Dark  | Blue/cyan aquatic theme            |
| lofi        | Light | Minimal, grayscale                 |
| pastel      | Light | Soft pastel colors                 |
| fantasy     | Light | Magical purple theme               |
| wireframe   | Light | Sketch/wireframe style             |
| black       | Dark  | Pure black and white               |
| luxury      | Dark  | Gold and black premium             |
| dracula     | Dark  | Popular dracula color scheme       |
| cmyk        | Light | Cyan, magenta, yellow, key         |
| autumn      | Light | Warm autumn colors                 |
| business    | Dark  | Dark professional theme            |
| acid        | Light | Bright neon colors                 |
| lemonade    | Light | Fresh yellow/green                 |
| night       | Dark  | Blue-tinted night theme            |
| coffee      | Dark  | Brown coffee tones                 |
| winter      | Light | Cool blue/white winter             |
| dim         | Dark  | Dimmed, easy on eyes               |
| nord        | Light | Nord color palette                 |
| sunset      | Light | Warm sunset gradient               |

---

## Important Constraints

### Code Quality

- Never use `any` types - always define proper types
- All types must be defined in separate model files
- Group related models in their respective domain directories
- Export all models from index files for clean imports
- Follow SOLID principles strictly
- Implement clean architecture patterns

### Testing Requirements

- Maintain test coverage above 90%
- Write tests before or alongside feature implementation
- All API endpoints must have integration tests
- All components must have unit tests with React Testing Library
- Use meaningful test descriptions

### Accessibility Requirements

- Use semantic HTML elements
- Implement ARIA roles and attributes
- Ensure keyboard navigation works
- Maintain color contrast ratios (WCAG 2.1 AA)
- Test with screen readers

### Performance Requirements

- Optimize for Cloudflare Workers cold start
- Use appropriate caching strategies with KV
- Minimize bundle size
- Implement code splitting where appropriate

---

## Git Workflow

### Commit Standards

- Follow conventional commits format
- Use descriptive commit messages
- Reference issue/ticket numbers when applicable

```
feat(auth): implement user registration with email verification
fix(api): resolve race condition in concurrent requests
docs(readme): update deployment instructions
test(users): add integration tests for user CRUD operations
```

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - New features
- `fix/*` - Bug fixes
- `refactor/*` - Code refactoring

---

## External Dependencies

### Required Services

- Cloudflare Account with Workers, D1, KV, R2, Queues, Durable Objects
- Docker (for local PostgreSQL)

### Optional Services

- Workers AI (for AI features)
- Vectorize (for ML/vector search features)

---

## Environment Variables

```bash
# .dev.vars (local development)
HYPERDRIVE_URL=postgresql://dev:dev@localhost:5432/app_development

# Cloudflare resource IDs (for staging/production)
D1_DATABASE_ID=your-d1-id
KV_NAMESPACE_ID=your-kv-id
R2_BUCKET_NAME=your-r2-bucket
```

---

## Quick Reference

### Common Commands

```bash
# Development
pnpm dev                    # Start development server
pnpm lint                   # Run Biome linting
pnpm typecheck              # Run TypeScript type checking

# Testing
pnpm test                   # Run all tests
pnpm test:ui                # Run tests with Vitest UI
pnpm test --coverage        # Run tests with coverage report

# Build & Deploy
pnpm build                  # Build for production
pnpm preview                # Preview production build locally
pnpm preview:remote         # Preview with remote Cloudflare resources

# Local Services
docker-compose up -d        # Start PostgreSQL for Hyperdrive
docker-compose down         # Stop local services
```
