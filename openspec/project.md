# Project Context

## Purpose

A production-ready full-stack starter template built on **React Router v7 (Framework Mode)** with **Cloudflare Workers**. This project provides a scalable foundation for building modern web applications with SSR, comprehensive Cloudflare service integrations, clean architecture following SOLID principles, and specification-driven development with OpenSpec.

**Goals:**
- Provide a robust, type-safe development experience
- Enable rapid feature development with clean architecture patterns
- Ensure high code quality through comprehensive testing (90%+ coverage)
- Support internationalization and accessibility out of the box
- Leverage Cloudflare's edge computing capabilities

---

## Tech Stack

### Core Technologies

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Runtime** | Node.js | 24+ LTS | JavaScript runtime |
| **Package Manager** | PNPM | 10+ | Fast, efficient dependency management |
| **Language** | TypeScript | 5+ | Type safety, **no `any` type allowed** |
| **Formatting/Linting** | Biome.js | Latest | Fast, unified code quality tooling |

### Frontend

| Technology | Purpose |
|------------|---------|
| **React** | 19+ with latest modern patterns and hooks |
| **React Router v7** | Framework Mode with SSR, loaders/actions |
| **TailwindCSS** | 4+ utility-first CSS with mobile-first responsive design |
| **DaisyUI** | Latest version, UI components with customizable themes (default: **light**) |
| **Lucide React** | `lucide-react` for UI icons |
| **react-i18next** | Frontend internationalization |
| **React Testing Library** | Component testing |

### Backend

| Technology | Purpose |
|------------|---------|
| **Hono** | Latest version, fast API framework with SOLID principles |
| **i18next** | Backend internationalization with Hono integration |
| **Drizzle ORM** | Type-safe database with migrations |
| **Zod** | Runtime schema validation (shared frontend + backend) |
| **Awilix** | Dependency injection container |

### Testing

| Technology | Purpose |
|------------|---------|
| **Vitest** | Unit and integration testing framework |
| **React Testing Library** | Component testing with accessibility focus |

### Cloudflare Services

| Service | Purpose | Usage |
|---------|---------|-------|
| **D1** | SQLite database | Primary data storage (separate schema) |
| **Hyperdrive** | PostgreSQL connection pooling | External DB connections (separate schema) |
| **KV** | Key-value storage | Caching, session data, DO queue communication |
| **R2** | Object storage | Static files, uploads |
| **Durable Objects** | Real-time features | WebSocket connections, queues (with KV for inter-DO communication) |
| **Vectorize** | Vector embeddings | ML data models |
| **Workers AI** | AI inference | Backend automation |

### Infrastructure

| Technology | Purpose |
|------------|---------|
| **Docker Compose** | Local PostgreSQL for Hyperdrive development |
| **Wrangler** | Cloudflare CLI for development and deployment |

---

## Project Conventions

### Code Style

#### TypeScript Standards
- **Strict mode enabled** - No implicit any, strict null checks
- **No `any` type** - Use proper types, `unknown`, or generics
- **Explicit return types** - All functions must have explicit return types
- **Interface-first design** - Define interfaces before implementations
- **Proper type organization** - Centralize types in dedicated directories

```typescript
// ✅ CORRECT: Explicit types, interface-based
interface UserService {
  findById(id: string): Promise<User | null>;
  create(data: CreateUserInput): Promise<User>;
}

// ❌ WRONG: any type, implicit returns
function getUser(id: any) {
  return db.query(id);
}
```

#### Type Organization
```
app/types/           # Frontend-specific types
server/types/        # Backend-specific types
shared/types/        # Shared types (frontend + backend)
```

- **Interfaces** - For object shapes and contracts
- **Types** - For unions, intersections, and aliases
- **Enums** - Use `const` enums or string literal unions
- **Classes** - Only when behavior encapsulation is needed

#### Naming Conventions
- **Files**: `kebab-case.ts`, `kebab-case.tsx`
- **Components**: `PascalCase`
- **Functions/Variables**: `camelCase`
- **Constants**: `SCREAMING_SNAKE_CASE`
- **Interfaces**: `PascalCase` with `I` prefix optional (prefer without)
- **Types**: `PascalCase`
- **Enums**: `PascalCase` with `PascalCase` members

#### Import Order
1. Node.js built-ins
2. External packages
3. Internal aliases (`@/`, `~/`)
4. Relative imports
5. Type imports (separate section)

### Formatting Rules (Biome.js)
- **Indent**: 2 spaces
- **Line width**: 100 characters
- **Quotes**: Double quotes for strings
- **Semicolons**: Always
- **Trailing commas**: ES5

---

### Architecture Patterns

#### Clean Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Routes / Controllers                      │
│              (React Router routes / Hono routes)             │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                   Engine / Facade Layer                      │
│         (Business logic, orchestrates services)              │
│                                                              │
│   • Coordinates multiple services                            │
│   • Contains business rules and validation                   │
│   • Transaction boundaries                                   │
│   • ONLY create when orchestrating 2+ services               │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                      Service Layer                           │
│           (Direct integration with externals)                │
│                                                              │
│   Backend: D1Service │ HyperdriveService │ KVService │       │
│            R2Service │ DOService │ VectorService │ AIService │
│                                                              │
│   Frontend: APIService │ OAuthService │ PaymentService │     │
│             MapService │ SmartContractService                │
└─────────────────────────────────────────────────────────────┘
```

#### Layer Discipline Rules

**Engine/Facade Layer:**
- Contains business logic and orchestration
- Coordinates multiple services
- Handles transaction boundaries
- **ONLY create when needed** - Do not create unnecessary engine layers
- Can be shared between frontend and backend if logic is portable

**Service Layer:**
- Direct integration with external services
- No business logic - pure data access/manipulation
- Backend services: D1, Hyperdrive, KV, R2, Durable Objects, Vectorize, Workers AI
- Frontend services: API calls, OAuth, Payment Gateways, Maps, Smart Contracts, third-party libraries

**Creation Rules:**
```
✅ Create Engine: When orchestrating 2+ services with business logic
✅ Create Service: For each external integration point
❌ Don't Create: Unnecessary abstraction layers
❌ Don't Create: Engine that just proxies a single service
```

#### Dependency Injection (Awilix)

Follow the [official Awilix guide](https://github.com/jeffijoe/awilix/blob/master/README.md) for implementation.

**Key Principles:**
- **Interface-based contracts** - All services MUST implement interfaces
- **Container registration** - Use `asClass` or `asFunction` with proper lifetime
- **Scoped containers** - Request-scoped for API handlers
- **Testability** - Easy mocking through interface substitution

```typescript
// ✅ CORRECT: Interface-based DI
interface IUserService {
  findById(id: string): Promise<User | null>;
}

class UserService implements IUserService {
  constructor(private deps: { db: IDatabase }) {}
  
  async findById(id: string): Promise<User | null> {
    return this.deps.db.query(id);
  }
}

// Container registration
container.register({
  userService: asClass(UserService).scoped(),
});
```

#### SOLID Principles Application

- **S**ingle Responsibility - Each service/engine has one purpose
- **O**pen/Closed - Extend via interfaces, not modification
- **L**iskov Substitution - Implementations are interchangeable
- **I**nterface Segregation - Small, focused interfaces
- **D**ependency Inversion - Depend on abstractions, not concretions

---

### Schema Validation (Zod)

- **Shared schemas** in `shared/schemas/` for frontend + backend
- **Specific schemas** in `app/schemas/` or `server/schemas/`
- **Type inference** - Derive TypeScript types from Zod schemas

```typescript
// shared/schemas/user.schema.ts
import { z } from "zod";

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
});

export type User = z.infer<typeof UserSchema>;
```

---

### Database Patterns (Drizzle ORM)

#### Separate Schemas
- **D1 (SQLite)**: `db/d1/schema/`
- **Hyperdrive (PostgreSQL)**: `db/hyperdrive/schema/`

#### Migration Strategy
- **D1**: `db/d1/migrations/`
- **Hyperdrive**: `db/hyperdrive/migrations/`

```bash
# D1 Commands
pnpm d1:generate      # Generate D1 migrations
pnpm d1:migrate       # Apply D1 migrations
pnpm d1:studio        # Open D1 Drizzle Studio

# Hyperdrive Commands
pnpm db:generate      # Generate Hyperdrive migrations
pnpm db:migrate       # Apply Hyperdrive migrations
pnpm db:studio        # Open Hyperdrive Drizzle Studio
```

---

### Security Patterns

#### CSRF Protection
- **Required for all mutations**: POST, PUT, PATCH, DELETE
- Implement via Hono middleware
- Token-based with double-submit cookie pattern
- Validate on all form submissions and API mutations

#### CORS Protection
- **Configurable origins** via `wrangler.jsonc` variables
- Use environment variables for origin lists
- Strict origin validation in production

```jsonc
// wrangler.jsonc
{
  "vars": {
    "CORS_ALLOWED_ORIGINS": "https://your-domain.com,https://api.your-domain.com"
  }
}
```

#### Sensitive Data Handling
- **Never log sensitive data** - Logger service sanitizes automatically
- **Environment variables** for secrets
- **No hardcoded credentials** in codebase

---

### Logging & Error Handling

#### Logger Service
- **Correlation ID** - Track requests across services
- **Sensitive data sanitization** - Automatic redaction of passwords, tokens, etc.
- **Structured logging** - JSON format for production
- **Request/Response logging** - All API calls logged with timing

```typescript
interface ILoggerService {
  info(message: string, meta?: Record<string, unknown>): void;
  error(message: string, error?: Error, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  debug(message: string, meta?: Record<string, unknown>): void;
  setCorrelationId(id: string): void;
}
```

#### Global Error Handling
- **Automatic error catching** - All API routes wrapped
- **Error logging** - Errors logged with correlation ID and stack trace
- **Production-safe responses** - No sensitive details exposed to clients
- **Easy debugging** - Correlation ID for tracing issues

---

### Internationalization (i18n)

#### Centralized References
- **Frontend**: `react-i18next` with translations in `app/i18n/locales/`
- **Backend**: `i18next` with Hono integration in `server/i18n/`
- **Shared keys** where applicable

#### Translation Structure
```
app/i18n/
├── config.ts           # i18next configuration
└── locales/
    ├── en/
    │   ├── common.json
    │   └── errors.json
    └── id/
        ├── common.json
        └── errors.json

server/i18n/
├── config.ts           # Backend i18next configuration
└── locales/
    ├── en.json
    └── id.json
```

#### Theme & Language Selector
- Built into main layout component
- DaisyUI theme switcher (default: light theme)
- Language selector with flag icons
- Persisted in localStorage/cookie

---

### UI/UX Patterns

#### Semantic HTML & Accessibility
- **Semantic elements** - Use `<main>`, `<nav>`, `<article>`, `<section>`, etc.
- **ARIA roles** - Proper roles for interactive elements
- **Keyboard navigation** - All interactions keyboard-accessible
- **Focus management** - Visible focus indicators
- **Screen reader support** - Descriptive labels and announcements

#### Form Layouts
- Follow [TailwindCSS Form Layouts](https://tailwindcss.com/plus/ui-blocks/application-ui/forms/form-layouts)
- Responsive design (mobile-first)
- Proper label associations
- Error state handling
- Loading states

#### Custom Components
Define custom components based on requirements:
- **Toast** - Notification system with DaisyUI styling
- **Modal** - Accessible modal dialogs
- **Carousel** - Image/content carousels
- Additional components as needed per feature requirements

#### DaisyUI Theming
- **Default theme**: `light`
- **Available themes**: All 35 DaisyUI built-in themes
- **Theme switching**: Use [theme-change](https://github.com/saadeghi/theme-change) for localStorage persistence
- **Theme configuration** in CSS with `@plugin "daisyui"`

```css
/* app.css - TailwindCSS 4+ with DaisyUI */
@import "tailwindcss";
@plugin "daisyui" {
  themes: light --default, dark --prefersdark, cupcake, corporate;
}
```

**Theme Flags:**
- `--default` - Sets the default theme
- `--prefersdark` - Applies when user prefers dark mode (`prefers-color-scheme: dark`)

**Apply theme to page:**
```html
<html data-theme="light">
  <!-- Content uses light theme -->
  <div data-theme="dark">
    <!-- This section uses dark theme -->
  </div>
</html>
```

**Enable all themes:**
```css
@plugin "daisyui" {
  themes: all;
}
```

---

### Testing Strategy

#### Coverage Requirements
- **Minimum coverage: 90%** for all metrics (statements, branches, functions, lines)
- **All tests must pass** before merging
- **No skipped tests** in production branches

#### Test Types

**Unit Tests** (`*.test.ts`, `*.test.tsx`)
- Components (React Testing Library)
- Services
- Utilities
- Engines/Facades
- Schema validations

**Integration Tests** (`*.integration.test.ts`)
- API endpoints
- Feature flows
- Database operations
- Service interactions

#### Test Organization
```
app/
├── components/
│   ├── Button.tsx
│   └── __tests__/
│       └── Button.test.tsx
├── services/
│   ├── api.service.ts
│   └── __tests__/
│       └── api.service.test.ts

server/
├── routes/
│   └── v1/
│       ├── users.ts
│       └── __tests__/
│           ├── users.test.ts
│           └── users.integration.test.ts
```

#### Testing Commands
```bash
pnpm test              # Run all tests
pnpm test:watch        # Watch mode
pnpm test:ui           # Vitest UI
pnpm test:coverage     # Coverage report (≥90% required)
```

---

### Git Workflow

#### Branch Strategy
- `main` - Production-ready code
- `dev` - Integration branch
- `feat/*` - Feature development
- `fix/*` - Bug fixes
- `chore/*` - Maintenance tasks

#### Commit Conventions
Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting
- `refactor` - Code restructuring
- `test` - Adding tests
- `chore` - Maintenance

---

## Domain Context

### Application Domains

This starter template is designed to support various application types:
- **SaaS applications** - Multi-tenant with user management
- **E-commerce** - Product catalogs, carts, checkout
- **Content platforms** - CMS, blogs, documentation
- **Real-time applications** - Chat, notifications, live updates
- **AI-powered applications** - ML inference, embeddings, automation

### Cloudflare Edge Computing

**Key Concepts:**
- **Workers** - Serverless functions at the edge
- **D1** - SQLite at the edge, low-latency reads
- **Hyperdrive** - Connection pooling for external databases
- **Durable Objects** - Stateful edge computing for real-time features
- **KV** - Global key-value storage for caching
- **R2** - S3-compatible object storage
- **Vectorize** - Vector database for ML embeddings
- **Workers AI** - ML inference at the edge

---

## Important Constraints

### Technical Constraints

1. **TypeScript Strictness**
   - No `any` type usage
   - Strict null checks enabled
   - Explicit return types required

2. **Test Coverage**
   - Minimum 90% coverage enforced
   - All tests must pass before merge

3. **Architecture Compliance**
   - Follow clean architecture layers
   - No unnecessary abstraction layers
   - Interface-based dependency injection

4. **Security Requirements**
   - CSRF protection on all mutations
   - CORS with configurable origins
   - Sensitive data sanitization in logs

5. **Cloudflare Compatibility**
   - All code must run on Workers runtime
   - No Node.js-specific APIs (unless polyfilled)
   - Edge-compatible dependencies only

### Performance Constraints

1. **Bundle Size** - Monitor and optimize frontend bundle
2. **Cold Start** - Optimize Worker initialization
3. **Database Queries** - Use indexes, avoid N+1 queries

---

## External Dependencies

### Required External Services

| Service | Purpose | Configuration |
|---------|---------|---------------|
| **Cloudflare Account** | Workers, D1, KV, R2, etc. | Wrangler CLI |
| **PostgreSQL** | Hyperdrive backend (optional) | Docker Compose for local |

### Key NPM Packages

| Package | Purpose |
|---------|---------|
| `react-router` | Framework with SSR |
| `hono` | Backend API framework |
| `drizzle-orm` | Type-safe ORM |
| `zod` | Schema validation |
| `awilix` | Dependency injection |
| `i18next` | Internationalization |
| `tailwindcss` | Utility CSS |
| `daisyui` | UI components |
| `lucide-react` | Icons |
| `vitest` | Testing framework |
| `@testing-library/react` | Component testing |

### External Documentation

- [React Router v7 Docs](https://reactrouter.com)
- [Hono Documentation](https://hono.dev)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [Awilix Guide](https://github.com/jeffijoe/awilix/blob/master/README.md)
- [DaisyUI Components](https://daisyui.com)
- [TailwindCSS Form Layouts](https://tailwindcss.com/plus/ui-blocks/application-ui/forms/form-layouts)

---

## Quick Reference

### Development Commands

```bash
# Installation
pnpm install                    # Install dependencies
docker-compose up -d            # Start local PostgreSQL

# Development
pnpm dev                        # Start dev server

# Code Quality
pnpm lint                       # Run Biome linter
pnpm format                     # Run Biome formatter
pnpm check                      # Run lint + format
pnpm typecheck                  # TypeScript check

# Database
pnpm d1:generate                # Generate D1 migrations
pnpm d1:migrate                 # Apply D1 migrations
pnpm db:generate                # Generate Hyperdrive migrations
pnpm db:migrate                 # Apply Hyperdrive migrations

# Testing
pnpm test                       # Run all tests
pnpm test:coverage              # Coverage report (≥90%)

# Build & Deploy
pnpm build                      # Build for production
pnpm preview                    # Preview locally
```

### File Naming Patterns

| Pattern | Example |
|---------|---------|
| Component | `UserProfile.tsx` |
| Service | `user.service.ts` |
| Engine | `auth.engine.ts` |
| Schema | `user.schema.ts` |
| Type | `user.types.ts` |
| Test | `*.test.ts`, `*.integration.test.ts` |
| Route | `users.tsx` (React Router), `users.ts` (Hono) |
