# Project Context

## Purpose

A production-ready full-stack starter template built on **React Router v7 (Framework Mode)** with **Cloudflare Workers**. This project provides a scalable, maintainable foundation for building modern web applications with SSR, comprehensive Cloudflare service integrations, and specification-driven development using OpenSpec.

**Goals:**
- Provide a clean, layered architecture following SOLID principles
- Enable rapid feature development with type-safe patterns
- Ensure high code quality with comprehensive testing (90%+ coverage)
- Support internationalization (English + Indonesian)
- Leverage Cloudflare's edge computing capabilities for optimal performance

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18+ | UI library with modern hooks and patterns |
| **React Router** | v7 | Framework mode with SSR, data loading, actions |
| **TypeScript** | 5+ | Strict type safety with latest patterns |
| **TailwindCSS** | 3+ | Utility-first CSS with responsive design |
| **DaisyUI** | Latest | UI components with customizable themes (light default) |
| **Lucide React** | Latest | Icon library |
| **react-i18next** | Latest | Frontend internationalization |
| **Zod** | Latest | Runtime schema validation |
| **Awilix** | Latest | Dependency injection container |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Hono** | Latest | Lightweight API framework for Workers |
| **Drizzle ORM** | Latest | Type-safe database operations |
| **i18next** | Latest | Backend internationalization |
| **Zod** | Latest | Request/response validation |
| **Awilix** | Latest | Dependency injection container |

### Database

| Technology | Purpose |
|------------|---------|
| **Cloudflare D1** | SQLite database for lightweight data |
| **Cloudflare Hyperdrive** | PostgreSQL connection pooling |
| **Drizzle ORM** | Separate schemas for D1 and Hyperdrive |

### Cloudflare Services

| Service | Purpose | Use Cases |
|---------|---------|-----------|
| **D1** | SQLite database | User data, settings, lightweight storage |
| **Hyperdrive** | PostgreSQL pooling | Complex queries, relational data |
| **KV** | Key-value cache | Session data, feature flags, caching |
| **R2** | Object storage | Static files, uploads, media |
| **Durable Objects** | Real-time, state | WebSocket, queues, coordination |
| **Vectorize** | Vector embeddings | ML data models, similarity search |
| **Workers AI** | AI inference | Text generation, embeddings, automation |

### Development Tools

| Tool | Purpose |
|------|---------|
| **PNPM** | Package manager |
| **Biome.js** | Formatting and linting |
| **Vitest** | Unit and integration testing |
| **React Testing Library** | Component testing |
| **Docker Compose** | Local PostgreSQL for Hyperdrive |
| **Wrangler** | Cloudflare CLI |

---

## Project Conventions

### Code Style

#### TypeScript
- **Strict mode enabled** — All compiler strict flags on
- **Explicit return types** — All functions must have explicit return types
- **Interface over type** — Prefer interfaces for object shapes, types for unions/primitives
- **Readonly by default** — Use `readonly` for properties that shouldn't mutate
- **No `any`** — Use `unknown` and narrow types instead
- **Barrel exports** — Use `index.ts` for clean imports

```typescript
// ✅ Good
interface UserService {
  readonly getUser: (id: string) => Promise<User | null>;
  readonly createUser: (data: CreateUserInput) => Promise<User>;
}

// ❌ Bad
type UserService = {
  getUser: (id: string) => any;
  createUser: (data: any) => any;
}
```

#### Naming Conventions
- **Files:** `kebab-case.ts`, `kebab-case.tsx`
- **Components:** `PascalCase`
- **Functions/Variables:** `camelCase`
- **Constants:** `SCREAMING_SNAKE_CASE`
- **Interfaces:** `PascalCase` (no `I` prefix)
- **Types:** `PascalCase`
- **Enums:** `PascalCase` with `PascalCase` members

#### File Organization
```
feature/
├── index.ts              # Barrel export
├── feature.component.tsx # React component
├── feature.engine.ts     # Business logic
├── feature.service.ts    # External integrations
├── feature.types.ts      # Type definitions
├── feature.schema.ts     # Zod schemas
└── __tests__/
    ├── feature.component.test.tsx
    ├── feature.engine.test.ts
    └── feature.integration.test.ts
```

### React Patterns

#### Component Structure
- Use **functional components** with hooks exclusively
- Use **semantic HTML** and **ARIA roles** for accessibility
- Implement **proper form layouts** following Tailwind UI patterns
- Use **DaisyUI components** with custom theme (light default)

```tsx
// ✅ Good - Semantic HTML with ARIA
export function UserCard({ user }: UserCardProps): JSX.Element {
  return (
    <article aria-labelledby={`user-${user.id}-name`}>
      <header>
        <h2 id={`user-${user.id}-name`}>{user.name}</h2>
      </header>
      <section aria-label="User details">
        <p>{user.email}</p>
      </section>
    </article>
  );
}
```

#### Form Layouts
Follow Tailwind CSS form layout patterns for responsive design:
- Stack labels above inputs on mobile
- Side-by-side on larger screens
- Proper spacing and grouping
- Clear validation feedback

```tsx
// Form layout pattern (responsive)
<form className="space-y-6">
  <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4">
    <label htmlFor="email" className="block text-sm font-medium">
      Email
    </label>
    <div className="mt-2 sm:col-span-2 sm:mt-0">
      <input
        type="email"
        id="email"
        className="input input-bordered w-full max-w-md"
        aria-describedby="email-description"
      />
      <p id="email-description" className="mt-2 text-sm text-base-content/70">
        We'll never share your email.
      </p>
    </div>
  </div>
</form>
```

#### Custom UI Components
Create custom DaisyUI-based components for common patterns:
- **Toast** — Notifications with auto-dismiss
- **Modal** — Accessible dialog with focus trap
- **Carousel** — Touch-friendly image slider
- **Dropdown** — Accessible menu component

#### Theme & Language Switcher
Main layout must include:
- **Theme selector** — Toggle between DaisyUI themes (light default)
- **Language selector** — Switch between supported locales (en, id)

```tsx
// Main layout pattern
export function MainLayout({ children }: LayoutProps): JSX.Element {
  return (
    <div data-theme="light" className="min-h-screen">
      <header>
        <nav aria-label="Main navigation">
          {/* Navigation items */}
          <div className="flex items-center gap-2">
            <ThemeSelector />
            <LanguageSelector />
          </div>
        </nav>
      </header>
      <main id="main-content" role="main">
        {children}
      </main>
    </div>
  );
}
```

#### Hydration Safety
For browser-only data (localStorage, etc.), use the mounted pattern:

```tsx
function Component(): JSX.Element {
  const [data] = useLocalStorage('key', defaultValue);
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const renderedData = isMounted ? data : defaultValue;
  
  return <div>{renderedData}</div>;
}
```

---

### Architecture Patterns

#### Layered Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Routes / Controllers                      │
│              (React Router routes / Hono routes)             │
│                                                              │
│  • Handle HTTP requests/responses                            │
│  • Input validation with Zod                                 │
│  • Delegate to engines                                       │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                   Engine / Facade Layer                      │
│           (Business logic and orchestration)                 │
│                                                              │
│  • Coordinate multiple services                              │
│  • Business rules and validation                             │
│  • Transaction boundaries                                    │
│  • NO direct external calls                                  │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                      Service Layer                           │
│             (Direct external integrations)                   │
│                                                              │
│  D1Service │ HyperdriveService │ KVService │ R2Service      │
│  DOService │ VectorService │ AIService │ ExternalAPIService │
└─────────────────────────────────────────────────────────────┘
```

**Key Rules:**
- **Only create engines when orchestration is needed** — Don't create unnecessary layers
- **Services are single-responsibility** — One service per external dependency
- **Engines orchestrate** — Combine multiple services for business operations
- **No business logic in services** — Services are thin wrappers

#### Dependency Injection with Awilix

Follow the [Awilix documentation](https://github.com/jeffijoe/awilix/blob/master/README.md) for proper implementation.

**Container Setup:**
```typescript
// containers/container.ts
import { createContainer, asClass, InjectionMode } from 'awilix';

export interface CradleInterface {
  userService: UserService;
  userEngine: UserEngine;
  // ... other dependencies
}

export function createAppContainer(env: Env): AwilixContainer<CradleInterface> {
  const container = createContainer<CradleInterface>({
    injectionMode: InjectionMode.CLASSIC,
  });

  container.register({
    // Services (external integrations)
    userService: asClass(D1UserService).singleton(),
    kvService: asClass(CloudflareKVService).singleton(),
    
    // Engines (business logic)
    userEngine: asClass(UserEngine).scoped(),
  });

  return container;
}
```

**Interface Binding:**
```typescript
// Always define interfaces for DI binding
interface UserService {
  readonly findById: (id: string) => Promise<User | null>;
  readonly create: (data: CreateUserInput) => Promise<User>;
}

// Implementation
class D1UserService implements UserService {
  constructor(private readonly db: DrizzleD1Database) {}
  
  async findById(id: string): Promise<User | null> {
    // Direct D1 query
  }
  
  async create(data: CreateUserInput): Promise<User> {
    // Direct D1 insert
  }
}
```

**Engine Pattern:**
```typescript
interface UserEngine {
  readonly registerUser: (input: RegisterInput) => Promise<RegisterResult>;
}

class UserEngineImpl implements UserEngine {
  constructor(
    private readonly userService: UserService,
    private readonly kvService: KVService,
    private readonly emailService: EmailService,
  ) {}

  async registerUser(input: RegisterInput): Promise<RegisterResult> {
    // Orchestrate multiple services
    const user = await this.userService.create(input);
    await this.kvService.set(`user:${user.id}`, user);
    await this.emailService.sendWelcome(user.email);
    return { user, success: true };
  }
}
```

#### SOLID Principles

- **S**ingle Responsibility — Each class/function has one reason to change
- **O**pen/Closed — Open for extension, closed for modification
- **L**iskov Substitution — Implementations are interchangeable via interfaces
- **I**nterface Segregation — Small, focused interfaces
- **D**ependency Inversion — Depend on abstractions, not concretions

---

### Testing Strategy

#### Coverage Requirements
- **Minimum 90% coverage** for statements, branches, functions, and lines
- **All components must have tests** — Unit and integration
- **All API endpoints must have tests** — Unit and integration
- **All utilities must have tests** — Unit tests

#### Test Types

| Type | Location | Naming | Purpose |
|------|----------|--------|---------|
| Unit | `__tests__/` | `*.test.ts(x)` | Isolated function/component testing |
| Integration | `__tests__/` | `*.integration.test.ts` | Multi-layer testing |

#### Test Structure
```typescript
// Component test
describe('UserCard', () => {
  it('renders user name', () => {
    render(<UserCard user={mockUser} />);
    expect(screen.getByRole('heading')).toHaveTextContent(mockUser.name);
  });

  it('has proper accessibility attributes', () => {
    render(<UserCard user={mockUser} />);
    expect(screen.getByRole('article')).toHaveAttribute('aria-labelledby');
  });
});

// Engine test
describe('UserEngine', () => {
  let engine: UserEngine;
  let mockUserService: jest.Mocked<UserService>;

  beforeEach(() => {
    mockUserService = createMockUserService();
    engine = new UserEngineImpl(mockUserService, mockKVService, mockEmailService);
  });

  it('creates user and caches result', async () => {
    const result = await engine.registerUser(mockInput);
    expect(mockUserService.create).toHaveBeenCalledWith(mockInput);
    expect(mockKVService.set).toHaveBeenCalled();
  });
});

// API integration test
describe('POST /api/v1/users', () => {
  it('creates user and returns 201', async () => {
    const response = await app.request('/api/v1/users', {
      method: 'POST',
      body: JSON.stringify(validInput),
    });
    expect(response.status).toBe(201);
  });
});
```

#### Test Commands
```bash
pnpm test              # Run all tests
pnpm test:watch        # Watch mode
pnpm test:ui           # Vitest UI
pnpm test:coverage     # Coverage report
```

---

### Git Workflow

#### Branching Strategy
- **main** — Production-ready code
- **develop** — Integration branch
- **feature/*** — New features
- **fix/*** — Bug fixes
- **refactor/*** — Code improvements

#### Commit Convention
Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation
- `style` — Formatting
- `refactor` — Code restructuring
- `test` — Adding tests
- `chore` — Maintenance

---

## Domain Context

### Internationalization

- **Supported locales:** English (en), Indonesian (id)
- **Frontend:** react-i18next with namespace-based organization
- **Backend:** i18next with Hono middleware
- **Translation files:** JSON format in `i18n/locales/{locale}/`

```typescript
// Frontend usage
const { t } = useTranslation('common');
return <h1>{t('welcome')}</h1>;

// Backend usage
app.get('/api/greeting', (c) => {
  const t = c.get('t');
  return c.json({ message: t('hello') });
});
```

### Database Schema Separation

- **D1 (SQLite):** `db/d1/schema/` — Lightweight, edge-optimized data
- **Hyperdrive (PostgreSQL):** `db/hyperdrive/schema/` — Complex relational data

```typescript
// D1 schema example
// db/d1/schema/users.ts
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// Hyperdrive schema example
// db/hyperdrive/schema/analytics.ts
export const analytics = pgTable('analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  event: varchar('event', { length: 255 }).notNull(),
  data: jsonb('data'),
  createdAt: timestamp('created_at').defaultNow(),
});
```

### Durable Objects with KV Communication

For queue coordination across Durable Objects:

```typescript
// Use KV for inter-DO communication
class QueueDO implements DurableObject {
  constructor(
    private readonly state: DurableObjectState,
    private readonly env: Env,
  ) {}

  async processQueue(): Promise<void> {
    // Read coordination state from KV
    const lock = await this.env.KV.get('queue:lock');
    if (lock) return;

    // Set lock
    await this.env.KV.put('queue:lock', this.state.id.toString(), {
      expirationTtl: 60,
    });

    // Process queue items
    // ...

    // Release lock
    await this.env.KV.delete('queue:lock');
  }
}
```

---

## Important Constraints

### Technical Constraints
- **Node.js 20+ LTS** required
- **PNPM 8+** as package manager (no npm/yarn)
- **90%+ test coverage** enforced in CI
- **Biome.js** for all formatting/linting (no ESLint/Prettier)
- **Strict TypeScript** — No implicit any, strict null checks

### Architecture Constraints
- **No unnecessary layers** — Only create engines when orchestrating multiple services
- **Interface-first DI** — All container bindings use interfaces
- **Service layer is thin** — No business logic in services
- **Zod for all validation** — No manual validation logic

### Cloudflare Constraints
- **Worker size limits** — Keep bundle size optimized
- **D1 query limits** — Batch operations when possible
- **KV eventual consistency** — Account for propagation delays
- **Durable Object alarms** — Use for scheduled tasks

### Accessibility Constraints
- **Semantic HTML** required for all components
- **ARIA roles** for custom interactive elements
- **Keyboard navigation** support required
- **Color contrast** must meet WCAG 2.1 AA

---

## External Dependencies

### Cloudflare Services

| Service | Binding | Configuration |
|---------|---------|---------------|
| D1 Database | `DB` | `wrangler.jsonc` |
| Hyperdrive | `HYPERDRIVE` | `wrangler.jsonc` + Docker Compose |
| KV Namespace | `KV` | `wrangler.jsonc` |
| R2 Bucket | `R2` | `wrangler.jsonc` |
| Durable Objects | `COUNTER`, etc. | `wrangler.jsonc` |
| Vectorize | `VECTOR` | `wrangler.jsonc` |
| Workers AI | `AI` | `wrangler.jsonc` |

### Local Development

| Service | Tool | Configuration |
|---------|------|---------------|
| PostgreSQL | Docker Compose | `docker-compose.yml` |
| Cloudflare Bindings | Wrangler | `wrangler.jsonc` |

### NPM Packages (Key Dependencies)

**Frontend:**
- `react`, `react-dom`, `react-router`
- `@tanstack/react-query` (if needed)
- `react-i18next`, `i18next`
- `zod`
- `awilix`
- `lucide-react`
- `tailwindcss`, `daisyui`

**Backend:**
- `hono`
- `drizzle-orm`, `drizzle-kit`
- `i18next`
- `zod`
- `awilix`

**Testing:**
- `vitest`
- `@testing-library/react`
- `@testing-library/jest-dom`
- `msw` (for API mocking)

---

## Project Structure

```
├── app/                      # Frontend (React)
│   ├── components/           # React components
│   │   ├── __tests__/        # Component tests
│   │   ├── ui/               # Base UI components (Toast, Modal, etc.)
│   │   └── features/         # Feature components
│   ├── routes/               # React Router routes
│   ├── hooks/                # Custom React hooks
│   ├── containers/           # DI containers (Awilix)
│   ├── engines/              # Business logic (facade layer)
│   ├── services/             # Frontend services
│   ├── types/                # TypeScript types
│   ├── schemas/              # Zod schemas
│   ├── i18n/                 # Frontend translations
│   │   └── locales/          # en/, id/
│   ├── styles/               # Global styles
│   ├── app.css               # TailwindCSS + DaisyUI config
│   ├── root.tsx              # App root with theme/language
│   └── entry.server.tsx      # SSR entry
│
├── server/                   # Backend (Hono)
│   ├── routes/               # API routes
│   │   └── v1/               # Versioned API
│   ├── containers/           # DI containers (Awilix)
│   ├── engines/              # Business logic (facade layer)
│   ├── services/             # Cloudflare service integrations
│   ├── middlewares/          # Hono middlewares
│   ├── schemas/              # Zod schemas
│   ├── i18n/                 # Backend translations
│   ├── durable-objects/      # Durable Objects classes
│   └── app.ts                # Hono app entry
│
├── db/                       # Database schemas (separated)
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
│   ├── project.md            # This file
│   ├── AGENTS.md             # AI instructions
│   ├── specs/                # Feature specs
│   └── changes/              # Change proposals
│       └── archive/          # Completed changes
│
├── public/                   # Static assets
├── scripts/                  # Build scripts
├── docker-compose.yml        # Local PostgreSQL
├── wrangler.jsonc            # Cloudflare config
├── biome.json                # Biome config
├── tailwind.config.js        # TailwindCSS + DaisyUI config
├── vitest.config.ts          # Vitest config
└── package.json              # PNPM package config
```

---

## Quick Reference

### Commands
```bash
# Development
pnpm dev                        # Start dev server
pnpm lint                       # Run Biome linter
pnpm format                     # Run Biome formatter
pnpm check                      # Lint + format
pnpm typecheck                  # TypeScript check

# Database
pnpm db:generate:d1             # Generate D1 migrations
pnpm db:generate:hyperdrive     # Generate Hyperdrive migrations
pnpm db:migrate:d1              # Apply D1 migrations
pnpm db:migrate:hyperdrive      # Apply Hyperdrive migrations

# Testing
pnpm test                       # Run all tests
pnpm test:watch                 # Watch mode
pnpm test:coverage              # Coverage (≥90%)

# Build & Deploy
pnpm build                      # Build for production
pnpm preview                    # Preview locally
```

### Key Patterns
- **DI Container:** Use Awilix with interface binding
- **Validation:** Zod schemas for all input/output
- **i18n:** Centralized translations with namespaces
- **Accessibility:** Semantic HTML + ARIA roles
- **Testing:** 90%+ coverage with integration tests
