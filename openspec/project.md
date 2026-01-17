# Project Context

## Purpose

A production-ready, full-stack React Router v7 starter with Cloudflare Workers, featuring SSR, comprehensive Cloudflare service integrations, clean architecture with SOLID principles, and specification-driven development. Designed for scalable, maintainable, and testable applications.

## Tech Stack

### Frontend
- **React 19+** — Latest modern patterns and best practices
- **React Router v7** — Framework mode with SSR, loaders, and actions
- **TypeScript 5+** — Strict type safety with modern patterns
- **TailwindCSS 4+** — Latest modern patterns for responsive and accessible design
- **DaisyUI (latest)** — UI components with customizable built-in themes (default: light)
- **Lucide React** — UI icons library
- **react-i18next** — Frontend internationalization
- **React Testing Library** — Component testing with proper test coverage
- **Zod** — Runtime schema validation (shared with backend)
- **Awilix** — Dependency injection for engine/service architecture

### Backend
- **Hono (latest)** — Fast, lightweight web framework with SOLID principles
- **TypeScript 5+** — Type-safe backend with modern patterns
- **Drizzle ORM** — Type-safe database operations with migrations
- **Zod** — Runtime schema validation (shared with frontend)
- **i18next** — Backend internationalization
- **Awilix** — Dependency injection with interface binding
- **Vitest** — Unit and integration testing

### Database & Storage
- **D1** — Cloudflare SQLite database (separate schema)
- **Hyperdrive** — PostgreSQL connection pooling (separate schema)
- **Docker Compose** — Local PostgreSQL for Hyperdrive development
- **KV** — Key-value cache storage
- **R2** — Object storage for static files
- **Vectorize** — Vector embeddings for ML models
- **Durable Objects** — Real-time features and queues (combined with KV)

### DevOps & Tooling
- **PNPM** — Package manager
- **Biome.js** — Fast formatting and linting
- **Vitest** — Unit and integration testing framework
- **Docker** — Local development services
- **Wrangler** — Cloudflare Workers deployment
- **OpenSpec** — Specification-driven development

### AI & Automation
- **Workers AI** — Backend automation and AI inference

## Project Conventions

### Code Style

#### General
- Use **Biome.js** for all formatting and linting
- Follow strict TypeScript configuration
- Use semantic HTML with proper ARIA roles for accessibility and SEO
- No emojis in code unless explicitly required
- Prefer descriptive variable and function names over comments
- Use PascalCase for components, interfaces, types, and classes
- Use camelCase for variables, functions, and methods
- Use SCREAMING_SNAKE_CASE for constants
- Use kebab-case for file names (except components: PascalCase)

#### Import Organization
```typescript
// 1. External dependencies
import { useEffect } from 'react';
import { Hono } from 'hono';

// 2. Internal absolute imports
import { UserEngine } from '~/engines/user-engine';
import type { IUserService } from '~/services/user-service';

// 3. Relative imports
import { Button } from './button';
```

#### TypeScript Patterns
- Always use interfaces for contracts and DI bindings
- Use type for unions, intersections, and utilities
- Prefer `type` for props, `interface` for service contracts
- Never use `any` — use `unknown` and type guards
- Enable strict mode and all strict flags
- Use const assertions where appropriate
- Leverage discriminated unions for state management

### Architecture Patterns

#### Clean Architecture Layers

**Only create engine/facade layers when business logic orchestration is needed.**

```
Routes/Controllers (React Router routes / Hono routes)
        ↓
Engine/Facade Layer (Business logic orchestration)
        ↓
Service Layer (Direct external integrations)
```

#### Engine/Facade Layer
- **Purpose:** Business logic orchestration, coordinating multiple services
- **Responsibilities:**
  - Orchestrate multiple service calls
  - Implement complex business rules
  - Handle transaction boundaries
  - Transform data between services
  - Validate business constraints
- **When to create:** Only when you need to coordinate 2+ services or have complex business logic
- **When NOT to create:** Simple CRUD operations that call a single service
- **Can be shared:** Between frontend and backend if logic is identical

#### Service Layer
- **Purpose:** Direct integration with external services
- **Backend services:** D1, Hyperdrive, KV, R2, Durable Objects, Vector, Workers AI
- **Frontend services:** API calls, Smart Contracts, Payment Gateways, OAuth, Map Libraries, third-party libraries
- **Responsibilities:**
  - Direct database queries (D1, Hyperdrive)
  - Cache operations (KV)
  - File storage (R2)
  - External API calls
  - Third-party integrations
- **Must use interfaces** for dependency injection

#### Dependency Injection with Awilix

**Critical Requirements:**
1. **Always use interfaces** for service contracts
2. **Register with interface binding** in DI containers
3. **Follow the Awilix guide:** https://github.com/jeffijoe/awilix/blob/master/README.md

```typescript
// ❌ BAD: No interface
class UserService {
  async getUser(id: string) { ... }
}

// ✅ GOOD: Interface-based
interface IUserService {
  getUser(id: string): Promise<User>;
}

class UserService implements IUserService {
  async getUser(id: string): Promise<User> { ... }
}

// Container registration
container.register({
  userService: asClass(UserService).singleton(),
});

// Usage in engine
class UserEngine {
  constructor(private userService: IUserService) {}
}
```

#### Core Features

##### Logger Service
- **Purpose:** Centralized logging with sensitive data sanitization
- **Requirements:**
  - Hold correlation ID for tracing requests
  - Sanitize sensitive data (passwords, tokens, PII)
  - Log all API request/response payloads
  - Support different log levels (debug, info, warn, error)
  - Format logs for production debugging

##### Global Error Handling
- **Purpose:** Catch and log all server errors automatically
- **Requirements:**
  - Catch all unhandled errors in API routes
  - Log errors with logger service (includes correlation ID)
  - Return consistent error responses
  - Hide internal details from clients
  - Make debugging easy in production

#### Form Layout
- **Use TailwindCSS form layouts:** https://tailwindcss.com/plus/ui-blocks/application-ui/forms/form-layouts
- Implement proper responsive design patterns
- Ensure accessibility with ARIA labels
- Use DaisyUI form components where applicable

#### Theme & Language
- **Default theme:** DaisyUI light theme
- **Theme switcher:** In main layout, persist preference
- **Language switcher:** In main layout, support i18n
- **Persistence:** Use localStorage or cookies

### Security

#### CSRF Protection
- Implement CSRF protection for all mutation requests (POST, PUT, PATCH, DELETE)
- Use Hono CSRF middleware
- Verify CSRF tokens in API routes
- **Ensure CSRF protection works properly** in all forms and API calls

#### CORS Protection
- Implement CORS with configurable origins
- **Control CORS origins from `wrangler.jsonc` variables**
- Use environment variables for allowed origins
- Example: `CORS_ALLOWED_ORIGINS="http://localhost:5173,https://your-domain.com"`

### Testing Strategy

#### Test Coverage Requirements
- **Minimum 90% coverage** for all metrics (statements, branches, functions, lines)
- All tests must pass before merging
- Use descriptive test names following "should..." pattern

#### Unit Testing
- **Framework:** Vitest
- **Frontend:** React Testing Library for components
- **Backend:** Test services, engines, utilities in isolation
- **Location:** `__tests__/` directories alongside source files
- **Naming:** `*.test.ts` or `*.test.tsx`
- **Scope:** Test individual functions, components, services

#### Integration Testing
- **Framework:** Vitest
- **Backend:** Test API endpoints end-to-end
- **Frontend:** Test component interactions with APIs
- **Location:** `__tests__/` directories
- **Naming:** `*.integration.test.ts`
- **Scope:** Test feature flows, API contracts

#### Test Organization
```typescript
describe('UserService', () => {
  describe('getUser', () => {
    it('should return user when ID exists', async () => {
      // Arrange
      const mockDb = createMockDb();
      const service = new UserService(mockDb);
      
      // Act
      const result = await service.getUser('123');
      
      // Assert
      expect(result).toEqual({ id: '123', name: 'John' });
    });

    it('should throw error when user not found', async () => {
      // Test implementation
    });
  });
});
```

### Git Workflow

#### Branch Strategy
- `main` — Production-ready code
- `develop` — Integration branch
- `feature/*` — New features
- `fix/*` — Bug fixes
- `chore/*` — Maintenance tasks

#### Commit Conventions
Follow Conventional Commits:
```
feat: add user authentication
fix: resolve hydration mismatch in header
chore: update dependencies
docs: update README installation steps
test: add integration tests for API
refactor: restructure user service layer
```

## Domain Context

### Cloudflare Services Integration

#### D1 (SQLite)
- Use for lightweight, edge-distributed data
- Separate schema and migrations in `db/d1/`
- Type-safe queries with Drizzle ORM
- Test locally with `wrangler d1`

#### Hyperdrive (PostgreSQL)
- Use for relational data requiring ACID guarantees
- Separate schema and migrations in `db/hyperdrive/`
- Local development with Docker Compose
- Connection pooling handled by Cloudflare

#### KV (Key-Value Store)
- Use for caching and session storage
- TTL support for automatic expiration
- Low latency at the edge
- Communication layer for Durable Objects queues

#### R2 (Object Storage)
- Use for static files, images, videos
- S3-compatible API
- No egress fees

#### Durable Objects
- Use for real-time features (WebSockets, presence)
- Use for queue implementations
- **Combine with KV for inter-queue communication**
- Strongly consistent storage
- Single-threaded per instance

#### Vectorize
- Use for vector embeddings
- ML model data storage
- Similarity search

#### Workers AI
- Backend automation tasks
- AI inference at the edge
- Model execution without external APIs

### Internationalization (i18n)

#### Requirements
- Use `i18next` as the core library
- Frontend: `react-i18next`
- Backend: `i18next` with Hono
- **Centralize translation references** that can be shared
- Support language switching in UI
- Persist language preference

#### Translation Structure
```
app/i18n/locales/
  en/
    common.json
    errors.json
    forms.json
  id/
    common.json
    errors.json
    forms.json

server/i18n/locales/
  en/
    api.json
    errors.json
  id/
    api.json
    errors.json
```

### Database Strategy

#### Schema Separation
- **D1 schema:** `db/d1/schema/` — SQLite-specific tables
- **Hyperdrive schema:** `db/hyperdrive/schema/` — PostgreSQL-specific tables
- **Never mix:** Keep schemas completely separate
- **Migrations:** Separate migration folders for each

#### Migration Best Practices
- Always generate migrations, never edit database directly
- Use descriptive migration names
- Test migrations on local before deploying
- Rollback strategy for production

#### Choosing D1 vs Hyperdrive
- **Use D1 for:** Edge-distributed data, simple queries, read-heavy workloads
- **Use Hyperdrive for:** Complex queries, ACID transactions, relational integrity

## Important Constraints

### Technical Constraints
- **Package Manager:** Must use PNPM only
- **Node.js Version:** 24+ LTS required
- **TypeScript:** Strict mode enabled
- **Test Coverage:** Minimum 90%, all tests must pass
- **Code Quality:** Must pass Biome linting and formatting
- **Cloudflare:** Must be deployable to Cloudflare Workers
- **DaisyUI:** Use built-in themes, customize only when necessary
- **Default Theme:** Light theme as default

### Architecture Constraints
- **Layer Discipline:** No direct external calls from engine layer
- **Dependency Injection:** All services must use interface-based DI
- **No Unnecessary Layers:** Only create engine layer when orchestration is needed
- **Service Contracts:** All services must implement interfaces
- **Error Handling:** All API errors must be caught by global handler
- **Logging:** All API requests must include correlation ID

### Security Constraints
- **CSRF:** Required for all mutations
- **CORS:** Must be configurable via environment variables
- **Secrets:** Never hardcode API keys or secrets
- **Environment:** Use `.dev.vars` for local, Wrangler secrets for production
- **Sensitive Data:** Must be sanitized in logs

### Performance Constraints
- **Edge-First:** Optimize for edge runtime
- **Bundle Size:** Minimize client-side JavaScript
- **Database:** Use appropriate service (D1 vs Hyperdrive)
- **Caching:** Leverage KV for frequently accessed data
- **CDN:** Use R2 for static assets

## External Dependencies

### Cloudflare Services
All Cloudflare services must be:
- Configurable via `wrangler.jsonc`
- Testable locally with Wrangler CLI
- Production-ready with proper bindings

### Required Services
- **D1:** SQLite database binding
- **Hyperdrive:** PostgreSQL connection
- **KV:** Cache storage
- **R2:** Object storage (optional, based on needs)
- **Durable Objects:** Real-time/queues (optional, based on needs)
- **Vectorize:** Vector storage (optional, based on needs)
- **Workers AI:** AI inference (optional, based on needs)

### Third-Party Services (Optional)
Choose based on requirements:
- **Payment Gateways:** Stripe, PayPal
- **OAuth Providers:** Google, GitHub, Auth0
- **Map Services:** Google Maps, Mapbox
- **Analytics:** Google Analytics, Plausible
- **Monitoring:** Sentry, LogRocket

### Development Tools
- **Docker:** Required for local Hyperdrive PostgreSQL
- **Wrangler CLI:** Required for Cloudflare deployments
- **OpenSpec:** Recommended for specification-driven development

## Service Selection Guidelines

**Only include Cloudflare services based on actual requirements:**
- Don't use R2 unless you need file storage
- Don't use Durable Objects unless you need real-time or queues
- Don't use Vectorize unless you need ML embeddings
- Don't use Workers AI unless you need edge AI inference
- Always prefer simpler solutions over complex ones

**Start minimal, add services as needed.**
