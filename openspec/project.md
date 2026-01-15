# Project Context

## Purpose

A modern full-stack web application starter built on **React Router v7 (Framework Mode)** with **Cloudflare Workers** as the deployment target. This project serves as a production-ready foundation for building scalable, accessible, and internationalized web applications leveraging Cloudflare's edge computing ecosystem.

---

## Tech Stack

### Core Framework & Runtime

- **React** (latest) — UI library with modern patterns (hooks, suspense, concurrent features)
- **React Router v7** (Framework Mode) — Full-stack routing with SSR, data loading, and actions
- **TypeScript** (latest) — Strict type safety with modern patterns
- **Cloudflare Workers** — Edge runtime for serverless deployment

### Package Management & Tooling

- **PNPM** — Fast, disk-efficient package manager
- **Biome.js** — Unified formatter and linter (replaces ESLint + Prettier)
- **Vite** — Build tool and dev server
- **Vitest** — Unit and integration testing framework

### Frontend Libraries

- **TailwindCSS** (latest) — Utility-first CSS framework
- **DaisyUI** (latest) — Component library with customizable themes (light theme as default)
- **Lucide React** — Icon library (`lucide-react`)
- **react-i18next** — Internationalization for React
- **Zod** — Schema validation
- **Awilix** — Dependency injection container

### Backend (Hono on Cloudflare Workers)

- **Hono** (latest) — Lightweight web framework for edge
- **i18next** — Backend internationalization
- **Zod** — Request/response validation
- **Awilix** — Dependency injection container
- **Drizzle ORM** — Type-safe database ORM

### Cloudflare Services

- **D1** — SQLite database for relational data
- **Hyperdrive** — PostgreSQL connection pooling (external DB)
- **Durable Objects** — Stateful real-time features and queues
- **KV** — Key-value caching and DO queue coordination
- **R2** — Object storage for static files
- **Vectorize** — Vector database for ML embeddings
- **Workers AI** — AI/ML inference at the edge

### Database & ORM

- **Drizzle ORM** — Type-safe ORM with separate schemas:
  - `db/d1/` — D1 SQLite schemas and migrations
  - `db/hyperdrive/` — Hyperdrive PostgreSQL schemas and migrations
- **Docker Compose** — Local PostgreSQL for Hyperdrive development

### Testing

- **Vitest** — Unit and integration testing
- **React Testing Library** — Component testing
- **MSW** (optional) — API mocking for integration tests

---

## Project Conventions

### Code Style

#### General Rules

- Use **Biome.js** for all formatting and linting (no ESLint/Prettier)
- Strict TypeScript with `strict: true` and `noUncheckedIndexedAccess: true`
- Prefer `const` over `let`, avoid `var`
- Use descriptive variable and function names
- Maximum line length: 100 characters
- Use single quotes for strings
- Use tabs for indentation

#### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `UserProfile.tsx` |
| Hooks | camelCase with `use` prefix | `useAuth.ts` |
| Utilities | camelCase | `formatDate.ts` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Types/Interfaces | PascalCase | `UserResponse` |
| Files (non-component) | kebab-case | `auth-service.ts` |
| Database tables | snake_case | `user_sessions` |
| Environment variables | SCREAMING_SNAKE_CASE | `DATABASE_URL` |

#### File Organization

```
app/
├── components/           # Reusable UI components
│   ├── __tests__/       # Component tests
│   ├── ui/              # Base UI components (buttons, inputs, etc.)
│   └── features/        # Feature-specific components
├── routes/              # React Router routes
│   └── __tests__/       # Route integration tests
├── hooks/               # Custom React hooks
├── containers/          # DI containers (Awilix)
├── engines/             # Business logic / facade layer
├── services/            # Direct integrations (API, DB, external)
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── i18n/                # Frontend translations
│   ├── locales/
│   │   ├── en/
│   │   └── id/
│   └── config.ts
├── styles/              # Global styles
└── root.tsx             # App root

server/
├── routes/              # Hono API routes
│   └── v1/
├── containers/          # DI containers (Awilix)
├── engines/             # Business logic / facade layer
├── services/            # Direct integrations (D1, Hyperdrive, KV, etc.)
├── middlewares/         # Hono middlewares
├── i18n/                # Backend translations
├── durable_objects/     # Durable Objects classes
└── app.ts               # Hono app entry

db/
├── d1/
│   ├── schema/          # D1 Drizzle schemas
│   └── migrations/      # D1 migrations
└── hyperdrive/
    ├── schema/          # Hyperdrive Drizzle schemas
    └── migrations/      # Hyperdrive migrations
```

### Architecture Patterns

#### Layered Architecture (SOLID + DI)

```
┌─────────────────────────────────────────────────────────┐
│                    Routes / Controllers                  │
│              (React Router routes / Hono routes)         │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                   Engine / Facade Layer                  │
│         (Business logic, orchestrates services)          │
│                                                          │
│  • Coordinates multiple services                         │
│  • Contains business rules and validation                │
│  • Transaction boundaries                                │
│  • Error handling and transformation                     │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                     Service Layer                        │
│           (Direct integration with externals)            │
│                                                          │
│  • D1Service (SQLite operations)                         │
│  • HyperdriveService (PostgreSQL operations)             │
│  • KVService (caching operations)                        │
│  • R2Service (file storage)                              │
│  • DOService (Durable Objects communication)             │
│  • VectorService (ML embeddings)                         │
│  • AIService (Workers AI inference)                      │
│  • ExternalAPIService (third-party APIs)                 │
└─────────────────────────────────────────────────────────┘
```

#### Dependency Injection (Awilix)

**Frontend Container (`app/containers/container.ts`):**

```typescript
import { createContainer, asClass, asFunction } from 'awilix';

export const createAppContainer = () => {
  const container = createContainer();
  
  container.register({
    // Engines (facade/business logic)
    authEngine: asClass(AuthEngine).scoped(),
    userEngine: asClass(UserEngine).scoped(),
    
    // Services (direct integrations)
    apiService: asClass(APIService).singleton(),
    storageService: asClass(StorageService).singleton(),
  });
  
  return container;
};
```

**Backend Container (`server/containers/container.ts`):**

```typescript
import { createContainer, asClass, asValue } from 'awilix';

export const createServerContainer = (env: Env) => {
  const container = createContainer();
  
  container.register({
    // Environment bindings
    env: asValue(env),
    
    // Engines (facade/business logic)
    userEngine: asClass(UserEngine).scoped(),
    contentEngine: asClass(ContentEngine).scoped(),
    
    // Services (Cloudflare bindings)
    d1Service: asClass(D1Service).scoped(),
    hyperdriveService: asClass(HyperdriveService).scoped(),
    kvService: asClass(KVService).scoped(),
    r2Service: asClass(R2Service).scoped(),
    doService: asClass(DOService).scoped(),
    vectorService: asClass(VectorService).scoped(),
    aiService: asClass(AIService).scoped(),
  });
  
  return container;
};
```

#### React Patterns

- **Functional components only** — No class components
- **Custom hooks for logic extraction** — Separate UI from business logic
- **Suspense boundaries** — For async data loading
- **Error boundaries** — For graceful error handling
- **Hydration-safe patterns** — Use `isMounted` state for client-only data

```typescript
// Hydration-safe pattern for client-only data
const [isMounted, setIsMounted] = useState(false);
useEffect(() => setIsMounted(true), []);
const displayData = isMounted ? clientData : defaultData;
```

#### Hono API Patterns

- **Route grouping** — Organize by resource/domain
- **Middleware composition** — Auth, validation, i18n
- **Zod validation** — All request/response schemas
- **Typed context** — Full type safety with `Env` types

```typescript
// Example Hono route with DI
app.get('/api/v1/users/:id', async (c) => {
  const container = c.get('container');
  const userEngine = container.resolve<UserEngine>('userEngine');
  
  const id = c.req.param('id');
  const result = await userEngine.getUserById(id);
  
  return c.json(result);
});
```

### UI & Accessibility

#### Semantic HTML & ARIA

- Use semantic elements: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`
- Add ARIA labels for interactive elements
- Ensure keyboard navigation support
- Maintain focus management for modals/dialogs
- Use `role` attributes where semantic elements aren't available

```tsx
// Example accessible component
<button
  type="button"
  aria-label="Close dialog"
  aria-pressed={isPressed}
  onClick={handleClose}
>
  <X className="h-5 w-5" aria-hidden="true" />
</button>
```

#### TailwindCSS Conventions

- Use responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
- Mobile-first approach
- Follow Tailwind form layouts: [Form Layouts](https://tailwindcss.com/plus/ui-blocks/application-ui/forms/form-layouts)
- Use DaisyUI components with theme customization

#### DaisyUI Configuration

DaisyUI v5 uses CSS-based configuration with `@plugin` syntax:

```css
/* app/app.css */
@import "tailwindcss";

/* Enable built-in themes: light (default), dark (prefers-color-scheme) */
@plugin "daisyui" {
  themes: light --default, dark --prefersdark;
}

/* Customize the light theme */
@plugin "daisyui/theme" {
  name: "light";
  default: true;
  color-scheme: light;
  --color-primary: oklch(58.5% 0.233 255);      /* blue-500 */
  --color-primary-content: oklch(98% 0.01 255);
  --color-secondary: oklch(58.5% 0.233 277);    /* indigo-500 */
  --color-secondary-content: oklch(98% 0.01 277);
  --color-accent: oklch(76.9% 0.188 70.08);     /* amber-500 */
  --color-accent-content: oklch(20% 0.05 70);
  --radius-selector: 0.5rem;
  --radius-field: 0.375rem;
  --radius-box: 0.5rem;
}

/* Customize the dark theme */
@plugin "daisyui/theme" {
  name: "dark";
  prefersdark: true;
  color-scheme: dark;
  --color-primary: oklch(65% 0.233 255);
  --color-primary-content: oklch(98% 0.01 255);
  --color-secondary: oklch(65% 0.233 277);
  --color-secondary-content: oklch(98% 0.01 277);
  --color-accent: oklch(76.9% 0.188 70.08);
  --color-accent-content: oklch(20% 0.05 70);
}
```

**Theme Switching:**
- Use `data-theme` attribute on `<html>` element
- Persist theme preference to localStorage
- Use [theme-change](https://github.com/saadeghi/theme-change) library for easy switching

```html
<!-- Set theme on HTML element -->
<html data-theme="light">
  <!-- Section with different theme -->
  <div data-theme="dark">Always dark</div>
</html>
```

#### Custom Components (when needed)

Define custom components in `app/components/ui/` for:
- **Toast** — Notification system with queue
- **Modal** — Accessible dialog with focus trap
- **Carousel** — Touch-friendly image slider
- **Other** — As requirements demand

### Internationalization (i18n)

#### Frontend (react-i18next)

```
app/i18n/
├── locales/
│   ├── en/
│   │   ├── common.json
│   │   ├── auth.json
│   │   └── errors.json
│   └── id/
│       ├── common.json
│       ├── auth.json
│       └── errors.json
└── config.ts
```

#### Backend (i18next with Hono)

```
server/i18n/
├── locales/
│   ├── en/
│   │   └── messages.json
│   └── id/
│       └── messages.json
└── config.ts
```

#### Theme & Language Selector

Implement in main layout (`app/root.tsx`):
- Theme toggle (light/dark) persisted to localStorage
- Language selector with available locales
- Use `useLocalStorage` hook with hydration-safe pattern

### Testing Strategy

#### Coverage Requirements

- **Minimum coverage: 90%** for all metrics
- Run coverage: `pnpm test:coverage`

#### Unit Testing (Vitest)

- **Components** — `app/components/__tests__/`
- **Hooks** — `app/hooks/__tests__/`
- **Utilities** — `app/utils/__tests__/`
- **Engines** — `app/engines/__tests__/`, `server/engines/__tests__/`
- **Services** — `server/services/__tests__/`

```typescript
// Example component test
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';

describe('Button', () => {
  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

#### Integration Testing

- **API Routes** — Test full request/response cycle
- **Route Components** — Test with data loading and actions
- **Engine Layer** — Test with mocked services

```typescript
// Example API integration test
import { app } from '../app';

describe('GET /api/v1/users/:id', () => {
  it('should return user data', async () => {
    const res = await app.request('/api/v1/users/123', {
      method: 'GET',
    });
    
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('id', '123');
  });
});
```

#### Test File Naming

- Unit tests: `*.test.ts` or `*.test.tsx`
- Integration tests: `*.integration.test.ts`
- Test utilities: `*.test-utils.ts`

### Git Workflow

#### Branch Strategy

- `main` — Production-ready code
- `staging` — Pre-production testing
- `feature/*` — New features
- `fix/*` — Bug fixes
- `chore/*` — Maintenance tasks

#### Commit Conventions

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

Examples:
- `feat(auth): add login with OAuth2`
- `fix(api): handle null response from D1`
- `chore(deps): update DaisyUI to v5`

---

## Domain Context

### Cloudflare Services Usage Guide

| Service | Use Case | Local Testing |
|---------|----------|---------------|
| **D1** | Primary relational data (users, content) | `wrangler d1` local DB |
| **Hyperdrive** | Complex queries, existing PostgreSQL | Docker Compose PostgreSQL |
| **KV** | Session cache, feature flags, DO coordination | `wrangler kv` local |
| **R2** | User uploads, static assets | `wrangler r2` local |
| **Durable Objects** | Real-time collaboration, job queues | `wrangler dev` with DO |
| **Vectorize** | Semantic search, recommendations | `wrangler vectorize` local |
| **Workers AI** | Text generation, embeddings, classification | `wrangler ai` local |

### Durable Objects + KV Queue Pattern

For distributed queue coordination:

```typescript
// DO for queue processing
export class QueueProcessor extends DurableObject {
  async processItem(item: QueueItem) {
    // Process item
    // Signal other DOs via KV
    await this.env.KV.put(`queue:${item.id}:status`, 'completed');
  }
}

// KV for cross-DO communication
await env.KV.put('queue:notifications', JSON.stringify({
  type: 'ITEM_PROCESSED',
  itemId: item.id,
  timestamp: Date.now(),
}));
```

---

## Important Constraints

### Technical Constraints

1. **Cloudflare Workers Limits**
   - CPU time: 30s (paid) / 10ms (free)
   - Memory: 128MB
   - Subrequest limit: 1000/request

2. **D1 Constraints**
   - Max DB size: 10GB
   - Max rows per query: 100,000
   - SQLite syntax only

3. **Durable Objects**
   - Single-threaded per instance
   - 128MB memory per instance
   - Must handle hibernation

4. **Bundle Size**
   - Workers: 10MB compressed
   - Minimize dependencies

### Business Constraints

- Must support Indonesian (`id`) and English (`en`) locales
- Light theme as default, with dark mode option
- Mobile-responsive design (mobile-first)
- WCAG 2.1 AA accessibility compliance

### Security Constraints

- No secrets in code — use environment variables
- Validate all inputs with Zod
- Sanitize user-generated content
- Use HTTPS only
- Implement CSRF protection for mutations

---

## External Dependencies

### Cloudflare Bindings (wrangler.jsonc)

```jsonc
{
  "d1_databases": [
    { "binding": "DB", "database_name": "app-db", "database_id": "xxx" }
  ],
  "hyperdrive": [
    { "binding": "HYPERDRIVE", "id": "xxx" }
  ],
  "kv_namespaces": [
    { "binding": "KV", "id": "xxx" }
  ],
  "r2_buckets": [
    { "binding": "R2", "bucket_name": "app-bucket" }
  ],
  "durable_objects": {
    "bindings": [
      { "name": "COUNTER", "class_name": "Counter" }
    ]
  },
  "vectorize": [
    { "binding": "VECTOR", "index_name": "app-vectors" }
  ],
  "ai": { "binding": "AI" }
}
```

### Environment Variables

```bash
# .dev.vars (local development)
DATABASE_URL=postgresql://user:pass@localhost:5432/app
SESSION_SECRET=xxx
```

### Docker Compose (Local Hyperdrive)

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: app
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## Scripts Reference

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm preview          # Preview production build

# Testing
pnpm test             # Run all tests
pnpm test:coverage    # Run with coverage (must be ≥90%)
pnpm test:watch       # Watch mode

# Database
pnpm db:generate      # Generate Drizzle migrations
pnpm db:migrate       # Run D1 migrations
pnpm db:migrate:pg    # Run Hyperdrive migrations
pnpm db:studio        # Open Drizzle Studio

# Code Quality
pnpm lint             # Run Biome linter
pnpm format           # Run Biome formatter
pnpm check            # Run both lint and format
```
