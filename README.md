# React Router Cloudflare Starter

A production-ready full-stack starter built on **React Router v7 (Framework Mode)** with **Cloudflare Workers**. Features SSR, comprehensive Cloudflare service integrations, and specification-driven development with OpenSpec.

## Key Features

- **React Router v7** — Framework mode with SSR, data loading, and actions
- **Cloudflare Workers** — Edge deployment with D1, Hyperdrive, KV, R2, Durable Objects, Workers AI, Vectorize
- **TypeScript** — Strict type safety with modern patterns
- **Hono** — Lightweight backend API framework
- **TailwindCSS + DaisyUI** — Responsive, accessible UI (light theme default)
- **Drizzle ORM** — Type-safe database with separate D1/Hyperdrive schemas
- **Vitest + React Testing Library** — 90%+ coverage requirement
- **Biome.js** — Fast formatting and linting
- **Zod** — Runtime schema validation
- **Awilix** — Dependency injection for SOLID architecture
- **i18next** — Internationalization (English + Indonesian)

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
| **Node.js** | 20+ LTS | JavaScript runtime |
| **PNPM** | 8+ | Package manager |
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

Edit `.dev.vars` with your settings:

```bash
# .dev.vars
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app
SESSION_SECRET=your-secret-key-here

# Cloudflare Resource IDs (for staging/production)
# Leave empty for local development
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

This project uses **Drizzle ORM** with separate schemas for D1 (SQLite) and Hyperdrive (PostgreSQL).

### Step 1: Generate Migrations

```bash
# Generate D1 (SQLite) migrations
pnpm db:generate:d1

# Generate Hyperdrive (PostgreSQL) migrations
pnpm db:generate:hyperdrive
```

### Step 2: Apply Migrations

```bash
# Apply D1 migrations locally
pnpm db:migrate:d1

# Apply Hyperdrive migrations to local PostgreSQL
pnpm db:migrate:hyperdrive
```

### Step 3: View Database (Optional)

```bash
# Open D1 Drizzle Studio
pnpm db:studio:d1

# Open Hyperdrive Drizzle Studio
pnpm db:studio:hyperdrive
```

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
│   │   ├── ui/               # Base UI components
│   │   └── features/         # Feature components
│   ├── routes/               # React Router routes
│   ├── hooks/                # Custom React hooks
│   ├── containers/           # DI containers (Awilix)
│   ├── engines/              # Business logic (facade layer)
│   ├── services/             # Frontend services
│   ├── types/                # TypeScript types
│   ├── i18n/                 # Frontend translations
│   │   └── locales/          # en/, id/
│   ├── styles/               # Global styles
│   ├── app.css               # TailwindCSS + DaisyUI config
│   ├── root.tsx              # App root
│   └── entry.server.tsx      # SSR entry
│
├── server/                   # Backend (Hono)
│   ├── routes/               # API routes
│   │   └── v1/               # Versioned API
│   ├── containers/           # DI containers (Awilix)
│   ├── engines/              # Business logic (facade layer)
│   ├── services/             # Cloudflare service integrations
│   ├── middlewares/          # Hono middlewares
│   ├── i18n/                 # Backend translations
│   ├── durable_objects/      # Durable Objects classes
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
├── openspec/                 # OpenSpec specifications
│   ├── project.md            # Project context
│   ├── AGENTS.md             # AI instructions
│   ├── specs/                # Feature specs
│   └── changes/              # Change proposals
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

This project follows a **layered architecture** with SOLID principles and dependency injection:

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

**Key Principles:**
- **Engine Layer** — Business logic and orchestration (no direct external calls)
- **Service Layer** — Direct integrations with D1, KV, R2, APIs, etc.
- **Dependency Injection** — Awilix containers for testability and flexibility

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