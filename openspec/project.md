# Project Context

## Purpose

A production-ready full-stack starter built on **React Router v7 (Framework Mode)** with **Cloudflare Workers**. Features SSR, comprehensive Cloudflare service integrations, clean architecture with SOLID principles, and specification-driven development with OpenSpec.

**Goals:**
- Provide a scalable, maintainable starter for modern web applications
- Demonstrate best practices for React Router Framework Mode with Cloudflare Workers
- Implement clean architecture with proper separation of concerns
- Enable rapid development with type safety and comprehensive testing

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19+ (latest) | UI library with modern patterns and hooks |
| **React Router** | v7+ | Framework Mode with SSR, loaders/actions |
| **TypeScript** | 5+ (latest) | Strict type safety, no `any` type allowed |
| **TailwindCSS** | 4+ (latest) | Utility-first CSS, responsive design |
| **DaisyUI** | latest | UI components with customizable themes (default: light) |
| **Lucide React** | latest | Icon library (lucide-react) |
| **react-i18next** | latest | Frontend internationalization |
| **Zod** | latest | Runtime schema validation |
| **Awilix** | latest | Dependency injection container |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Hono** | latest | Fast API framework with SOLID principles |
| **TypeScript** | 5+ (latest) | Type-safe backend, no `any` type allowed |
| **Drizzle ORM** | latest | Type-safe database ORM |
| **Zod** | latest | Request/response validation |
| **i18next** | latest | Backend internationalization |
| **Awilix** | latest | Dependency injection container |

### Database

| Technology | Purpose |
|------------|---------|
| **D1** | SQLite database (Cloudflare) |
| **Hyperdrive** | PostgreSQL connection pooling (Cloudflare) |
| **Docker Compose** | Local PostgreSQL for Hyperdrive development |

### Testing

| Technology | Purpose |
|------------|---------|
| **Vitest** | Unit and integration testing framework |
| **React Testing Library** | Component testing |
| **Coverage** | Minimum 90% required, all tests must pass |

### DevOps & Tooling

| Technology | Purpose |
|------------|---------|
| **PNPM** | Package manager |
| **Biome.js** | Formatting and linting |
| **Wrangler** | Cloudflare CLI for development and deployment |
| **Docker Compose** | Local PostgreSQL for Hyperdrive |

### Cloudflare Services

| Service | Purpose | Required |
|---------|---------|----------|
| **D1** | SQLite database | Yes |
| **Hyperdrive** | PostgreSQL connection pooling | Yes |
| **KV** | Key-value caching | Yes |
| **R2** | Object storage for static files | Based on needs |
| **Durable Objects** | Real-time features and queues (with KV communication) | Based on needs |
| **Vectorize** | Vector embeddings for ML data models | Based on needs |
| **Workers AI** | Backend automation and AI inference | Based on needs |

---

## Project Conventions

### Code Style

**General Rules:**
- **No `any` type** — All types must be explicitly defined
- **Strict TypeScript** — Enable all strict compiler options
- **Biome.js** — Use for formatting and linting
- **Semantic HTML** — Use proper HTML5 elements with ARIA roles for accessibility and SEO
- **File naming** — Use kebab-case for files, PascalCase for components/classes

**TypeScript Best Practices:**
- Define all types, interfaces, enums, and classes in dedicated `types/` directories
- Use interface for object shapes, type for unions/intersections
- Export types from barrel files (`index.ts`)
- Use `satisfies` operator for type narrowing when appropriate
- Prefer `unknown` over `any` for truly unknown types
- Use generics for reusable type patterns

**React Best Practices:**
- Use functional components with hooks
- Prefer named exports for components
- Use `React.FC` or explicit return types
- Implement proper error boundaries
- Use `useMemo` and `useCallback` for optimization when needed
- Follow React Router v7 patterns for loaders/actions

**TailwindCSS Best Practices:**
- Use utility classes directly in JSX
- Implement responsive design with mobile-first approach
- Follow [TailwindCSS form layouts](https://tailwindcss.com/plus/ui-blocks/application-ui/forms/form-layouts) for forms
- Use DaisyUI components with customized light theme as default
- Create custom components (Toast, Modal, Carousel, etc.) based on requirements

**Accessibility Requirements:**
- Use semantic HTML elements (`<nav>`, `<main>`, `<article>`, `<section>`, etc.)
- Implement ARIA roles and attributes where needed
- Ensure keyboard navigation support
- Maintain proper heading hierarchy
- Provide alt text for images

### Architecture Patterns

**Clean Architecture with SOLID Principles:**

```
┌─────────────────────────────────────────────────────────────┐
│                   Routes / Controllers                       │
│              (React Router routes / Hono routes)             │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                   Engine / Facade Layer                      │
│         (Business logic, orchestrates services)              │
│                                                              │
│  • Coordinates multiple services                             │
│  • Contains business rules and validation                    │
│  • Transaction boundaries                                    │
│  • Only create when orchestration is needed                  │
│  • Can be shared between frontend and backend if possible    │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                      Service Layer                           │
│           (Direct integration with externals)                │
│                                                              │
│  Backend: D1 │ Hyperdrive │ KV │ R2 │ DO │ Vector │ AI      │
│  Frontend: API │ OAuth │ Payment │ Maps │ Third-party libs   │
└─────────────────────────────────────────────────────────────┘
```

**Layer Discipline:**
- **Engine/Facade Layer** — Business logic orchestration, coordinates 2+ services
- **Service Layer** — Direct integrations with external services only
- **No Unnecessary Layers** — Only create engine layer when truly needed
- **Interface-based Contracts** — All services must implement interfaces for DI

**Dependency Injection (Awilix):**
- Follow [Awilix official guide](https://github.com/jeffijoe/awilix/blob/master/README.md)
- Use interface-based bindings in container
- Register services as singletons or scoped as appropriate
- Enable easy mocking for testing

**Validation (Zod):**
- Define schemas in `schemas/` directories
- Share schemas between frontend and backend in `shared/schemas/`
- Use for request validation, form validation, and response typing

**Internationalization (i18next):**
- Centralized translation references
- Frontend: react-i18next
- Backend: i18next with Hono
- Support theme and language selector in main layout

### Security Requirements

**CSRF Protection:**
- Implement for all mutation requests (POST, PUT, PATCH, DELETE)
- Validate CSRF tokens in Hono middleware
- Ensure CSRF protection works properly in both development and production

**CORS Protection:**
- Configure allowed origins via `wrangler.jsonc` variables
- Support multiple origins (development and production)
- Implement proper preflight handling

**Logger Service:**
- Centralized logging with correlation ID for request tracing
- Sanitize sensitive data in all request payloads and response data
- Track correlation ID across all API requests

**Global Error Handling:**
- Automatic error catching for all API routes
- Log errors with logger service (including correlation ID)
- Return appropriate error responses without exposing internals
- Enable easy debugging in production

### Testing Strategy

**Coverage Requirements:**
- **Minimum 90% coverage** for statements, branches, functions, lines
- **All tests must pass** before merging

**Test Types:**
- **Unit Tests** — Components, services, utilities, engines
- **Integration Tests** — API endpoints, feature flows, database operations
- **Component Tests** — React Testing Library for UI components

**Test Organization:**
- Place tests in `__tests__/` directories alongside source
- Use `*.test.ts` or `*.test.tsx` for unit tests
- Use `*.integration.test.ts` for integration tests

**Testing Best Practices:**
- Test behavior, not implementation
- Mock external services at the DI container level
- Use factories for test data generation
- Ensure comprehensive coverage for all API endpoints

### Git Workflow

**Branching Strategy:**
- `main` — Production-ready code
- `develop` — Integration branch for features
- `feature/*` — Feature branches
- `fix/*` — Bug fix branches
- `release/*` — Release preparation branches

**Commit Conventions:**
- Use conventional commits: `type(scope): message`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Keep commits atomic and focused

**PR Requirements:**
- All tests must pass
- Coverage must meet 90% threshold
- Code review required
- Biome checks must pass

---

## Domain Context

### Main Layout Features
- **Theme Selector** — Switch between DaisyUI built-in themes (light as default)
- **Language Selector** — Switch between supported languages (i18next)
- **Responsive Navigation** — Mobile-first responsive design

### Custom UI Components
Create custom components based on requirements and use cases:
- **Toast** — Notification system
- **Modal** — Dialog/popup system
- **Carousel** — Image/content slider
- Additional components as needed

### Form Design
- Follow [TailwindCSS form layouts](https://tailwindcss.com/plus/ui-blocks/application-ui/forms/form-layouts)
- Implement proper responsive design for all form sizes
- Use Zod for form validation
- Display validation errors accessibly

---

## Important Constraints

### Technical Constraints
- **No `any` type** — TypeScript must be strictly typed
- **90% test coverage** — All tests must pass
- **Biome.js compliance** — All code must pass linting and formatting
- **Accessibility** — Semantic HTML and ARIA roles required
- **CSRF/CORS** — Security middleware must be properly configured

### Performance Constraints
- Optimize for Cloudflare Workers edge runtime
- Use proper caching strategies with KV
- Implement efficient database queries with Drizzle

### Development Constraints
- Use PNPM as package manager (not npm or yarn)
- Local development must work with Docker Compose for PostgreSQL
- All Cloudflare services must be testable locally

---

## External Dependencies

### Cloudflare Services Configuration

**Required Services:**
- **D1** — SQLite database with separate schema in `db/d1/`
- **Hyperdrive** — PostgreSQL with separate schema in `db/hyperdrive/`
- **KV** — Caching layer

**Optional Services (based on requirements):**
- **R2** — Static file storage
- **Durable Objects** — Real-time features, queues (with KV for cross-DO communication)
- **Vectorize** — Vector embeddings for ML data models
- **Workers AI** — AI inference and automation

### Database Migrations
- Use Drizzle ORM for all database operations
- Maintain separate migrations for D1 and Hyperdrive
- Follow best practices for schema design

### Third-Party Libraries
- All dependencies managed via PNPM
- Pin versions in `package.json`
- Update dependencies regularly for security

---

## Project Structure

```
├── app/                      # Frontend (React)
│   ├── components/           # React components
│   │   ├── __tests__/        # Component tests
│   │   ├── ui/               # Base UI (Toast, Modal, Carousel, etc.)
│   │   └── features/         # Feature components
│   ├── routes/               # React Router routes
│   ├── hooks/                # Custom React hooks
│   ├── containers/           # DI containers (Awilix)
│   ├── engines/              # Business logic (facade layer)
│   ├── services/             # Frontend services (API, OAuth, etc.)
│   ├── types/                # TypeScript types/interfaces
│   ├── schemas/              # Zod schemas
│   ├── i18n/                 # Frontend translations
│   │   └── locales/          # en/, id/, etc.
│   ├── styles/               # Global styles
│   ├── app.css               # TailwindCSS + DaisyUI config
│   ├── root.tsx              # App root (theme/language selectors)
│   └── entry.server.tsx      # SSR entry
│
├── server/                   # Backend (Hono)
│   ├── routes/               # API routes
│   │   └── v1/               # Versioned API
│   ├── containers/           # DI containers (Awilix)
│   ├── engines/              # Business logic (facade layer)
│   ├── services/             # Cloudflare service integrations
│   ├── middlewares/          # Hono middlewares (CSRF, CORS, Logger, Error)
│   ├── schemas/              # Zod schemas
│   ├── i18n/                 # Backend translations
│   ├── durable-objects/      # Durable Objects classes
│   └── app.ts                # Hono app entry
│
├── db/                       # Database schemas (separate)
│   ├── d1/                   # D1 (SQLite)
│   │   ├── schema/           # Drizzle schemas
│   │   └── migrations/       # D1 migrations
│   └── hyperdrive/           # Hyperdrive (PostgreSQL)
│       ├── schema/           # Drizzle schemas
│       └── migrations/       # PostgreSQL migrations
│
├── shared/                   # Shared code (frontend + backend)
│   ├── types/                # Shared TypeScript types
│   ├── schemas/              # Shared Zod schemas
│   └── utils/                # Shared utilities
│
├── openspec/                 # OpenSpec specifications
│   ├── project.md            # Project context (this file)
│   ├── AGENTS.md             # AI assistant instructions
│   ├── specs/                # Feature specifications
│   └── changes/              # Change proposals
│       └── archive/          # Completed changes
│
├── public/                   # Static assets
├── scripts/                  # Build scripts
├── .dev.vars.example         # Environment template
├── docker-compose.yml        # Local PostgreSQL
├── wrangler.jsonc            # Cloudflare config (CORS origins here)
├── biome.json                # Biome config
├── tailwind.config.js        # TailwindCSS config
├── drizzle.config.ts         # Drizzle config
└── vitest.config.ts          # Vitest config
```

---

## Core Features Implementation

### Logger Service
```typescript
interface ILoggerService {
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, error?: Error, meta?: Record<string, unknown>): void;
  setCorrelationId(id: string): void;
  getCorrelationId(): string;
}
```
- Sanitize sensitive fields: `password`, `token`, `secret`, `authorization`, `cookie`
- Include correlation ID in all log entries
- Support structured logging for production debugging

### Global Error Handler
```typescript
// Hono middleware for automatic error catching
app.onError((err, c) => {
  const logger = container.resolve<ILoggerService>('loggerService');
  logger.error('Unhandled error', err, { path: c.req.path, method: c.req.method });
  return c.json({ error: 'Internal Server Error' }, 500);
});
```

### CSRF Middleware
- Generate and validate CSRF tokens
- Apply to all mutation endpoints (POST, PUT, PATCH, DELETE)
- Integrate with Hono middleware stack

### CORS Middleware
- Read allowed origins from `wrangler.jsonc` variables
- Support multiple origins for dev and production
- Handle preflight OPTIONS requests

---

## Quick Reference Commands

```bash
# Installation
pnpm install
docker-compose up -d

# Development
pnpm dev
pnpm lint
pnpm format
pnpm check
pnpm typecheck

# Database
pnpm db:generate:d1
pnpm db:generate:hyperdrive
pnpm db:migrate:d1
pnpm db:migrate:hyperdrive

# Testing
pnpm test
pnpm test:watch
pnpm test:coverage    # Must be ≥90%

# Build & Deploy
pnpm build
pnpm preview
npx wrangler versions upload
npx wrangler versions deploy
```
