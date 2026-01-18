# React Router Cloudflare Starter

A production-ready full-stack starter built on **React Router v7 (Framework Mode)** with **Cloudflare Workers**. Features SSR, comprehensive Cloudflare service integrations, clean architecture with SOLID principles, and specification-driven development with OpenSpec.

## Key Features

### Frontend
- **React 19+** — Latest modern patterns and best practices with hooks
- **React Router v7** — Framework Mode with SSR, loaders/actions
- **TypeScript 5+** — Strict type safety, **no `any` type allowed**
- **TailwindCSS 4+** — Utility-first CSS with mobile-first responsive design
- **Semantic HTML & ARIA** — Accessibility and SEO best practices
- **DaisyUI (latest)** — UI components with customizable themes (default: light)
- **Lucide React** — Icon library (lucide-react)
- **react-i18next** — Frontend internationalization with centralized references
- **React Testing Library** — Component testing with 90%+ coverage
- **Form Layouts** — Following [TailwindCSS form layouts](https://tailwindcss.com/plus/ui-blocks/application-ui/forms/form-layouts)

### Backend
- **Hono (latest)** — Fast API framework with SOLID principles
- **TypeScript 5+** — Type-safe backend, **no `any` type allowed**
- **i18next** — Backend internationalization with Hono integration
- **CSRF Protection** — Secured mutations for all POST/PUT/PATCH/DELETE requests
- **CORS Protection** — Configurable origins via `wrangler.jsonc` variables
- **Logger Service** — Centralized logging with correlation ID and sensitive data sanitization
- **Global Error Handling** — Automatic error catching and logging for production debugging

### Architecture
- **Clean Architecture** — Engine/Facade and Service layers with SOLID principles
- **Dependency Injection** — Awilix with interface-based contracts (following [Awilix guide](https://github.com/jeffijoe/awilix/blob/master/README.md))
- **Layer Discipline** — Only create engine layer when orchestrating 2+ services
- **Drizzle ORM** — Type-safe database with separate D1/Hyperdrive schemas/migrations
- **Zod** — Shared runtime schema validation (frontend + backend)
- **i18next** — Internationalization (frontend + backend, centralized)
- **Theme & Language Selector** — Built into main layout with DaisyUI themes

### Testing
- **Vitest** — Unit + integration testing framework
- **90%+ Coverage** — Minimum coverage requirement, all tests must pass
- **Comprehensive Testing** — Component, API, utility tests with proper integration tests

### DevOps
- **PNPM** — Fast, efficient package manager (required)
- **Biome.js** — Fast formatting and linting
- **Docker Compose** — Local PostgreSQL for Hyperdrive development
- **OpenSpec** — Specification-driven development workflow
- **Wrangler** — Cloudflare CLI for development and deployment

### Cloudflare Services
- **D1** — SQLite database (separate schema)
- **Hyperdrive** — PostgreSQL connection pooling (separate schema)
- **KV** — Key-value cache storage
- **R2** — Object storage (optional, based on needs)
- **Durable Objects** — Real-time features and queues with KV communication (optional)
- **Vectorize** — Vector embeddings for ML (optional)
- **Workers AI** — Backend automation and AI inference (optional)

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Initialize OpenSpec](#initialize-openspec)
4. [Environment Setup](#environment-setup)
5. [Database Setup](#database-setup)
6. [Development](#development)
7. [Testing](#testing)
8. [Building & Deployment](#building--deployment)
9. [Project Structure](#project-structure)
10. [Architecture Overview](#architecture-overview)
11. [Cloudflare Services](#cloudflare-services)
12. [Quick Reference](#quick-reference)

---

## Prerequisites

Before starting, ensure you have the following installed:

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | 24+ LTS | JavaScript runtime |
| **PNPM** | 10+ | Package manager |
| **Docker** | Latest | Local PostgreSQL for Hyperdrive |
| **Wrangler CLI** | Latest | Cloudflare deployments |
| **Git** | Latest | Version control |

### Install Global Tools

```bash
# Install PNPM (if not installed)
npm install -g pnpm

# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare (for deployments)
wrangler login
```

---

## Installation

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd react-router-cf-starter
```

### Step 2: Install Dependencies

```bash
pnpm install
```

This installs all project dependencies including:
- React, React Router, TypeScript
- TailwindCSS, DaisyUI, Lucide React
- Hono, Drizzle ORM, Zod
- Vitest, React Testing Library
- i18next, react-i18next
- Awilix (dependency injection)

### Step 3: Install OpenSpec Fission AI (Optional but Recommended)

OpenSpec Fission AI enhances the development workflow with AI-assisted specification management.

```bash
# Install OpenSpec CLI globally
npm install -g @fission-ai/openspec@latest

# Verify installation
openspec --version
```

> **Note:** OpenSpec Fission AI integrates with your IDE (VS Code, Windsurf) for AI-assisted development. See [OpenSpec Documentation](https://openspec.dev) for IDE extensions.

---

## Initialize OpenSpec

OpenSpec provides specification-driven development for consistent, high-quality code.

### Step 1: Review Project Specifications

Read the project context before making changes:

```bash
# View project specifications
cat openspec/project.md

# View AI agent instructions
cat openspec/AGENTS.md
```

### Step 2: Understand the Specifications

```
openspec/
├── project.md      # Project context, tech stack, conventions
├── AGENTS.md       # AI assistant instructions
├── specs/          # Feature specifications
└── changes/        # Change proposals
    └── archive/    # Completed changes
```

**Key files to review:**
- `openspec/project.md` — Tech stack, architecture, coding conventions, testing strategy
- `openspec/AGENTS.md` — Instructions for AI assistants working on this project

### Step 3: OpenSpec Workflow Commands

When developing features, use OpenSpec workflows:

```bash
# Create a new change proposal
# Use: /openspec-proposal in your AI assistant

# Apply an approved change
# Use: /openspec-apply in your AI assistant

# Archive a completed change
# Use: /openspec-archive in your AI assistant
```

---

## Environment Setup

### Step 1: Create Environment File

```bash
cp .dev.vars.example .dev.vars
```

### Step 2: Configure Environment Variables

Edit `.dev.vars` with your settings (it resolves `${...}` placeholders in `wrangler.jsonc` via `scripts/gen-wrangler.js`):

```bash
# .dev.vars (gitignored)
VALUE_FROM_CLOUDFLARE="Hello from local dev!"
KV_ID="your_kv_id_here"
D1_DB_ID="your_d1_db_id_here"
HYPERDRIVE_DB_ID="your_hyperdrive_db_id_here"
VECTORIZE_INDEX_NAME="your_vectorize_index_name_here"
RATE_LIMITER_ID="your_rate_limiter_id_here"

# Optional (recommended for CORS)
# CORS_ALLOWED_ORIGINS="http://localhost:5173,https://your-domain.com"
```

### Step 3: Start Local Services

Start PostgreSQL for Hyperdrive development:

```bash
docker-compose up -d
```

Verify the service is running:

```bash
docker-compose ps
```

---

## Database Setup

This project is designed to use **Drizzle ORM** with separate schemas/migrations for:

- **D1** (SQLite)
- **Hyperdrive** (PostgreSQL)

### Step 1: Provision Cloudflare resources

Follow `GUIDE.md` to create D1/Hyperdrive resources and collect their IDs.

### Step 2: Configure bindings for local dev

Add the relevant IDs to `.dev.vars` (or CI variables) so `scripts/gen-wrangler.js` can generate `wrangler.json`.

### Step 3: Start local Postgres for Hyperdrive (optional)

```bash
docker-compose up -d
```

The default local connection string for Hyperdrive is configured in `wrangler.jsonc` under `hyperdrive[].localConnectionString`.

---

## Development

### Start Development Server

```bash
pnpm dev
```

This starts:
- **Vite dev server** with HMR at `http://localhost:5173`
- **Cloudflare Workers** local runtime for SSR
- **Wrangler** for local Cloudflare bindings (D1, KV, etc.)

### Code Quality Commands

```bash
# Run Biome linter
pnpm lint

# Run Biome formatter
pnpm format

# Run both lint and format
pnpm check

# Run TypeScript type checking
pnpm typecheck
```

---

## Testing

### Run Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with UI
pnpm test:ui

# Run tests with coverage report
pnpm test:coverage
```

### Coverage Requirements

- **Minimum coverage: 90%** for all metrics
- Tests are located in `__tests__/` directories alongside source files
- Use `*.test.ts` or `*.test.tsx` for unit tests
- Use `*.integration.test.ts` for integration tests

---

## Building & Deployment

### Build for Production

```bash
pnpm build
```

### Preview Production Build

```bash
# Preview with local bindings
pnpm preview

# Preview with remote Cloudflare resources
pnpm preview:remote
```

### Deploy to Cloudflare

```bash
# Upload new version
npx wrangler versions upload

# Deploy version
npx wrangler versions deploy
```

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
├── db/                       # Database schemas
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
│   ├── project.md            # Project context
│   ├── AGENTS.md             # AI instructions
│   ├── specs/                # Feature specs
│   └── changes/              # Change proposals
│       └── archive/          # Completed changes
│
├── public/                   # Static assets
├── scripts/                  # Build scripts
├── .dev.vars.example         # Environment template
├── docker-compose.yml        # Local PostgreSQL
├── wrangler.jsonc            # Cloudflare config
├── biome.json                # Biome config
├── tailwind.config.js        # TailwindCSS config
└── vitest.config.ts          # Vitest config
```

---

## Architecture Overview

This project follows a **clean architecture** with SOLID principles and dependency injection:

```
┌─────────────────────────────────────────────────────────┐
│                  Routes / Controllers                    │
│            (React Router routes / Hono routes)           │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                 Engine / Facade Layer                    │
│       (Business logic, orchestrates services)            │
│                                                          │
│  • Coordinates multiple services                         │
│  • Contains business rules and validation                │
│  • Transaction boundaries                                │
│  • Only create when orchestration is needed              │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                    Service Layer                         │
│         (Direct integration with externals)              │
│                                                          │
│  D1Service │ HyperdriveService │ KVService │ R2Service   │
│  DOService │ VectorService │ AIService │ APIService      │
└─────────────────────────────────────────────────────────┘
```

### Key Principles

**Layer Discipline:**
- **Engine Layer** — Business logic orchestration (no direct external calls)
- **Service Layer** — Direct integrations with D1, KV, R2, APIs, etc.
- **No Unnecessary Layers** — Only create engine layer when coordinating 2+ services

**Dependency Injection:**
- **Awilix** — Interface-based DI following [official guide](https://github.com/jeffijoe/awilix/blob/master/README.md)
- **Interface Contracts** — All services must implement interfaces
- **Testability** — Easy mocking and unit testing

**Core Features:**
- **Logger Service** — Centralized logging with correlation ID, sensitive data sanitization
- **Global Error Handling** — Automatic error catching and logging for all API routes
- **CSRF Protection** — Required for all mutations (POST/PUT/PATCH/DELETE)
- **CORS Protection** — Configurable origins via `wrangler.jsonc` variables

**Testing Requirements:**
- **Minimum 90% coverage** for statements, branches, functions, lines
- **Unit tests** — Components, services, utilities
- **Integration tests** — API endpoints, feature flows
- **All tests must pass** before merging

---

## Cloudflare Services

| Service | Purpose | Binding | Local Testing |
|---------|---------|---------|---------------|
| **D1** | SQLite database | `DB` | `wrangler d1` |
| **Hyperdrive** | PostgreSQL pooling | `HYPERDRIVE` | Docker Compose |
| **KV** | Key-value cache | `KV` | `wrangler kv` |
| **R2** | Object storage | `R2` | `wrangler r2` |
| **Durable Objects** | Real-time, queues | `COUNTER` | `wrangler dev` |
| **Vectorize** | Vector embeddings | `VECTOR` | `wrangler vectorize` |
| **Workers AI** | AI inference | `AI` | `wrangler ai` |

---

## Quick Reference

```bash
# ─────────────────────────────────────────────────────────
# INSTALLATION
# ─────────────────────────────────────────────────────────
pnpm install                    # Install dependencies
docker-compose up -d            # Start local PostgreSQL

# ─────────────────────────────────────────────────────────
# DEVELOPMENT
# ─────────────────────────────────────────────────────────
pnpm dev                        # Start dev server
pnpm lint                       # Run Biome linter
pnpm format                     # Run Biome formatter
pnpm check                      # Run lint + format
pnpm typecheck                  # TypeScript check

# ─────────────────────────────────────────────────────────
# DATABASE
# ─────────────────────────────────────────────────────────
pnpm db:generate:d1             # Generate D1 migrations
pnpm db:generate:hyperdrive     # Generate Hyperdrive migrations
pnpm db:migrate:d1              # Apply D1 migrations
pnpm db:migrate:hyperdrive      # Apply Hyperdrive migrations
pnpm db:studio:d1               # Open D1 Drizzle Studio
pnpm db:studio:hyperdrive       # Open Hyperdrive Drizzle Studio

# ─────────────────────────────────────────────────────────
# TESTING
# ─────────────────────────────────────────────────────────
pnpm test                       # Run all tests
pnpm test:watch                 # Watch mode
pnpm test:ui                    # Vitest UI
pnpm test:coverage              # Coverage report (≥90%)

# ─────────────────────────────────────────────────────────
# BUILD & DEPLOY
# ─────────────────────────────────────────────────────────
pnpm build                      # Build for production
pnpm preview                    # Preview locally
pnpm preview:remote             # Preview with remote resources

# ─────────────────────────────────────────────────────────
# LOCAL SERVICES
# ─────────────────────────────────────────────────────────
docker-compose up -d            # Start PostgreSQL
docker-compose down             # Stop PostgreSQL
docker-compose logs -f          # View logs
```

---

## Additional Resources

- **OpenSpec Project Context:** `openspec/project.md`
- **Detailed Setup Guide:** `GUIDE.md`
- **React Router Docs:** https://reactrouter.com
- **Cloudflare Workers Docs:** https://developers.cloudflare.com/workers
- **DaisyUI Themes:** https://daisyui.com/docs/themes

---

## License

MIT