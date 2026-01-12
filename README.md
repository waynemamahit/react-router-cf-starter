# react-router-cf-starter

A full-stack React Router v7 starter tailored for Cloudflare Workers. This template provides server-side rendering (SSR) on Cloudflare, client hydration, and comprehensive integrations for Durable Objects, KV, D1, Hyperdrive, R2, Queues, and Workers AI.

## Key Features

- **Server-side rendering** with React Router v7 and a worker-based server entry (`app/entry.server.tsx`).
- **Cloudflare Workers + Wrangler** deployment scaffolding.
- **Clean Architecture** with domain-driven design and SOLID principles.
- **Layered Architecture** with facade/engine patterns for business logic orchestration.
- **Drizzle ORM** for type-safe database access with separate schemas for D1 and Hyperdrive.
- **Durable Objects** for real-time features, queues, and PubSub messaging.
- **KV, D1, Hyperdrive, R2, Vectorize, Workers AI** examples and bindings support.
- **TypeScript** with strict type checking.
- **Vite** dev server with HMR for client-side development.
- **Vitest** for comprehensive testing (90%+ coverage target).
- **TailwindCSS + DaisyUI** for responsive, accessible UI design.
- **Biome.js** for fast formatting and linting.
- **Zod** for runtime schema validation.

---

## OpenSpec Workflow Guide

OpenSpec is a specification-driven development approach that ensures consistency and quality across the project. Follow this workflow when starting or contributing to the project.

### Initial Setup

#### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd react-router-cf-starter
pnpm install
```

#### 2. Start Local Services (PostgreSQL for Hyperdrive)

```bash
docker-compose up -d
```

#### 3. Configure Environment Variables

Copy the example environment file and configure your local settings:

```bash
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars` with your Cloudflare resource IDs (for staging/production) or use local defaults for development.

#### 4. Run Database Migrations

Generate and apply migrations for both databases:

```bash
# Generate migrations
pnpm db:generate:d1
pnpm db:generate:hyperdrive

# Apply D1 migrations locally
pnpm db:migrate:d1

# Apply Hyperdrive (PostgreSQL) migrations
pnpm db:migrate:hyperdrive
```

#### 5. Run Development Server

```bash
pnpm dev
```

---

### OpenSpec Development Workflow

#### Step 1: Review Project Context

Before making any changes, read the OpenSpec documentation:

```
openspec/
├── project.md     # Project context, architecture, conventions
└── AGENTS.md      # AI agent instructions
```

Key areas to understand:

- **Tech Stack**: React 19, TypeScript 5, Hono, TailwindCSS 4, DaisyUI
- **Architecture**: Clean architecture with layered design
- **Testing**: 90%+ coverage requirement with Vitest + React Testing Library
- **Cloudflare Services**: D1, KV, R2, Durable Objects, Queues, Workers AI

#### Step 2: Understand the Architecture

The project follows a **layered architecture**:

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

**Key Principles:**

- **Domain Layer**: Contains business logic, entities, and interfaces. No dependencies on infrastructure.
- **Infrastructure Layer**: Implements domain interfaces with concrete services (D1, KV, R2, etc.).
- **Application Layer**: Orchestrates services via facades/engines.
- **Presentation Layer**: React components consuming application layer.

#### Step 3: Feature Development Process

##### 3.1 Define Domain Models

Create domain entities and interfaces in the domain layer:

```typescript
// server/domain/entities/user.ts or app/core/domain/entities/user.ts
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

// server/domain/interfaces/user-repository.ts
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<User>;
  delete(id: string): Promise<void>;
}
```

##### 3.2 Create Zod Schemas

Define validation schemas in the shared schemas directory:

```typescript
// shared/schemas/user.schema.ts
import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
```

##### 3.3 Implement Infrastructure Services

Create concrete implementations in the infrastructure layer:

```typescript
// server/infrastructure/database/d1-user-repository.ts
import type { D1Database } from "@cloudflare/workers-types";
import type { User, UserRepository } from "../../domain/interfaces/user-repository";

export class D1UserRepository implements UserRepository {
  constructor(private readonly db: D1Database) {}

  async findById(id: string): Promise<User | null> {
    const result = await this.db
      .prepare("SELECT * FROM users WHERE id = ?")
      .bind(id)
      .first();
    return result ? this.toDomain(result) : null;
  }

  // ... other methods
}
```

##### 3.4 Create Application Facades

Orchestrate services in the application layer:

```typescript
// server/application/facades/user-facade.ts
export class UserFacade {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly cacheService: CacheService
  ) {}

  async createUser(input: CreateUserInput): Promise<User> {
    const user = await this.userRepository.save(input);
    await this.cacheService.set(`user:${user.id}`, user);
    return user;
  }
}
```

##### 3.5 Build API Routes

Create Hono API routes using facades:

```typescript
// server/api/routes/users.ts
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createUserSchema } from "../../shared/schemas/user.schema";

const users = new Hono();

users.post("/", zValidator("json", createUserSchema), async (c) => {
  const data = c.req.valid("json");
  const userFacade = c.get("userFacade");
  const user = await userFacade.createUser(data);
  return c.json({ user }, 201);
});

export { users };
```

##### 3.6 Create React Components

Build accessible, responsive components:

```tsx
// app/components/features/UserProfile.tsx
interface UserProfileProps {
  user: User;
  onEdit: (id: string) => void;
}

export function UserProfile({ user, onEdit }: UserProfileProps) {
  return (
    <article className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">{user.name}</h2>
        <p className="text-base-content/70">{user.email}</p>
        <div className="card-actions justify-end">
          <button
            className="btn btn-primary"
            onClick={() => onEdit(user.id)}
            aria-label={`Edit ${user.name}'s profile`}
          >
            Edit Profile
          </button>
        </div>
      </div>
    </article>
  );
}
```

#### Step 4: Write Tests

##### Unit Tests for Components

```typescript
// tests/unit/components/UserProfile.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { UserProfile } from "../../../app/components/features/UserProfile";

describe("UserProfile", () => {
  const mockUser = {
    id: "1",
    email: "john@example.com",
    name: "John Doe",
    createdAt: new Date(),
  };

  it("displays user information correctly", () => {
    render(<UserProfile user={mockUser} onEdit={vi.fn()} />);

    expect(screen.getByRole("heading", { name: /john doe/i })).toBeInTheDocument();
    expect(screen.getByText(/john@example\.com/i)).toBeInTheDocument();
  });

  it("calls onEdit when edit button is clicked", async () => {
    const onEdit = vi.fn();
    render(<UserProfile user={mockUser} onEdit={onEdit} />);

    await userEvent.click(screen.getByRole("button", { name: /edit/i }));

    expect(onEdit).toHaveBeenCalledWith("1");
  });
});
```

##### Integration Tests for API

```typescript
// tests/integration/api/users.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { createTestApp } from "../../fixtures/test-app";

describe("Users API", () => {
  let app: ReturnType<typeof createTestApp>;

  beforeEach(() => {
    app = createTestApp();
  });

  it("POST /api/users creates a user", async () => {
    const response = await app.request("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        name: "Test User",
      }),
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.user).toMatchObject({
      email: "test@example.com",
      name: "Test User",
    });
  });
});
```

#### Step 5: Run Quality Checks

```bash
# Run linting
pnpm lint

# Run type checking
pnpm typecheck

# Run tests with coverage
pnpm test --coverage
```

Ensure coverage is above 90% before submitting changes.

---

## Project Layout

```
├── app/                    # Frontend React application
│   ├── components/         # React components
│   ├── core/               # Domain and application layers
│   ├── hooks/              # Custom React hooks
│   ├── routes/             # React Router routes
│   ├── styles/             # Global styles and themes
│   └── utils/              # Utility functions
├── server/                 # Backend application
│   ├── api/                # Hono API routes
│   ├── application/        # Facades and engines
│   ├── domain/             # Domain entities and interfaces
│   ├── infrastructure/     # Service implementations
│   └── durable-objects/    # Durable Object classes
├── shared/                 # Shared code (frontend & backend)
│   ├── schemas/            # Zod validation schemas
│   ├── types/              # Shared TypeScript types
│   └── utils/              # Shared utilities
├── tests/                  # Test files
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   └── fixtures/           # Test fixtures and mocks
├── openspec/               # OpenSpec documentation
├── public/                 # Static assets
├── scripts/                # Build and utility scripts
└── wrangler.jsonc          # Cloudflare Worker configuration
```

---

## Prerequisites

- Node.js 24+ LTS
- `pnpm` (package manager)
- Wrangler CLI (`npm i -g wrangler`) for Cloudflare deployments
- Docker (for local PostgreSQL used by Hyperdrive)

---

## Installation

Install dependencies with `pnpm`:

```bash
pnpm install
```

---

## Development

Run the Vite dev server and local server proxy:

```bash
pnpm dev
```

This starts the client dev server with HMR and the server entry used for SSR. By default the client is available at `http://localhost:5173`.

If you rely on Cloudflare staging resources locally (Hyperdrive/D1/KV), follow the local setup in `GUIDE.md` and populate `.dev.vars` before running.

---

## Testing

Run all tests:

```bash
pnpm test
```

Run tests with Vitest UI:

```bash
pnpm test:ui
```

Run tests with coverage report:

```bash
pnpm test --coverage
```

**Coverage Requirement:** Maintain 90%+ coverage for all components and API endpoints.

---

## Previewing the Production Build Locally

Build and preview using Wrangler with staging environment bindings:

```bash
pnpm build
pnpm preview
```

To preview with remote resources:

```bash
pnpm preview:remote
```

---

## Building for Production

Create a production build:

```bash
pnpm build
```

---

## Deployment

Deployment uses the Wrangler CLI. Set up a Cloudflare API token and add it to your CI/CD provider (see `GUIDE.md`).

For preview deployments and version management:

```bash
npx wrangler versions upload
npx wrangler versions deploy
```

---

## Local Hyperdrive (PostgreSQL) for Development

This project uses Hyperdrive which requires PostgreSQL for local development. A `docker-compose.yml` is included:

```bash
docker-compose up -d
```

Configure your `.dev.vars` with staging resource IDs (see `GUIDE.md`) before running preview/dev commands that interact with Cloudflare-managed resources.

---

## Cloudflare Services Overview

| Service         | Purpose                                       | Binding Name    |
| --------------- | --------------------------------------------- | --------------- |
| D1              | SQLite database for structured data           | `DB`            |
| Hyperdrive      | PostgreSQL connection pooling                 | `HYPERDRIVE`    |
| KV              | Key-value caching, sessions, cross-DO state   | `CACHE`         |
| R2              | Object storage for static files               | `STORAGE`       |
| Durable Objects | Real-time, WebSockets, queues, PubSub         | `REALTIME`      |
| Queue Manager   | Background job processing (DO + KV)           | `QUEUE_MANAGER` |
| PubSub          | Event-driven messaging (DO + KV)              | `PUBSUB`        |
| Workers AI      | AI/ML inference                               | `AI`            |
| Vectorize       | Vector database for embeddings                | `VECTOR_DB`     |

---

## Where to Look

- Server SSR entry: `app/entry.server.tsx`
- Routes: `app/routes.ts` and `app/routes/*.tsx`
- API routes: `server/api/routes/`
- Worker server + DOs: `server/` and `server/durable-objects/`
- Domain layer: `server/domain/` and `app/core/domain/`
- OpenSpec context: `openspec/project.md`
- Built artifacts: `build/`

---

## Quick Reference

```bash
# Development
pnpm dev              # Start development server
pnpm lint             # Run Biome linting
pnpm typecheck        # Run TypeScript type checking

# Testing
pnpm test             # Run all tests
pnpm test:ui          # Run tests with Vitest UI
pnpm test --coverage  # Run tests with coverage report

# Database (Drizzle ORM)
pnpm db:generate:d1        # Generate D1 migrations
pnpm db:generate:hyperdrive # Generate Hyperdrive migrations
pnpm db:migrate:d1         # Apply D1 migrations locally
pnpm db:migrate:d1:remote  # Apply D1 migrations to remote
pnpm db:migrate:hyperdrive # Apply Hyperdrive migrations
pnpm db:studio:d1          # Open D1 Drizzle Studio
pnpm db:studio:hyperdrive  # Open Hyperdrive Drizzle Studio

# Build & Deploy
pnpm build            # Build for production
pnpm preview          # Preview production build locally
pnpm preview:remote   # Preview with remote Cloudflare resources

# Local Services
docker-compose up -d  # Start PostgreSQL for Hyperdrive
docker-compose down   # Stop local services
```

---

## Need Help?

If you want, I can:

- Run a quick repo scan to verify scripts and `package.json`.
- Update CI examples for GitHub Actions/Bitbucket pipelines.

---

Happy hacking — open an issue or ask if you want a tailored CI/CD example for your provider.
