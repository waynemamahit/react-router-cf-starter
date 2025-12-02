# react-router-cf-starter

A full-stack React Router starter tailored for Cloudflare Workers. This template provides server-side rendering (SSR) on Cloudflare, client hydration, and example integrations for Durable Objects, KV, D1, Hyperdrive, and Vectorize.

## Key Features

- **Server-side rendering** with React Router and a worker-based server entry (`app/entry.server.tsx`).
- **Cloudflare Workers + Wrangler** deployment scaffolding.
- **Durable Objects** example (high-performance counter) in `server/durable_objects`.
- **KV, D1, Hyperdrive, Vectorize** examples and bindings support.
- **TypeScript** by default.
- **Vite** dev server with HMR for client-side development.

## Project Layout

- `app/` — React app source (routes, root, CSS).
- `build/` — Output artifacts for production (client + server bundles).
- `public/` — Static assets served by the worker.
- `server/` — Worker server entry, Durable Object code, API routes.
- `wrangler.jsonc` — Worker configuration for Cloudflare.

## Prerequisites

- Node.js (recommended 18+)
- `pnpm` (this repo uses `pnpm` in scripts)
- Wrangler CLI (`npm i -g wrangler`) for Cloudflare deployments
- Docker (only if you want to run the local PostgreSQL used by Hyperdrive)

## Installation

Install dependencies with `pnpm`:

```bash
pnpm install
```

## Development

Run the Vite dev server and local server proxy (project scripts use `pnpm`):

```bash
pnpm dev
```

This starts the client dev server with HMR and the server entry used for SSR. By default the client is available at `http://localhost:5173` and SSR is routed through the local server process.

If you rely on Cloudflare staging resources locally (Hyperdrive/D1/KV), follow the local setup in `GUIDE.md` and populate `.dev.vars` before running.

## Previewing the Production Build Locally

The repo includes scripts to build the client and server and preview using Wrangler with the staging environment bindings.

```bash
pnpm build
pnpm preview
```

`pnpm preview` uses the built server bundle in `build/server` and serves it locally in a way similar to Cloudflare Workers for final verification.

## Building for Production

Create a production build:

```bash
pnpm build
```

## Deployment

Deployment uses the Wrangler CLI. Set up a Cloudflare API token and add it to your CI/CD provider (see `GUIDE.md`). Example deploy commands:

```bash
# publish via wrangler using configured environment
pnpm deploy

# or use wrangler directly
npx wrangler deploy --env production
```

For preview deployments and version management you can use:

```bash
npx wrangler versions upload
npx wrangler versions deploy
```

## Local Hyperdrive (Postgres) for Development

This project can use Hyperdrive which requires PostgreSQL for local development. A `docker-compose.yml` is included.

```bash
docker-compose up -d
```

Configure your `.dev.vars` with staging resource IDs (see `GUIDE.md`) before running preview/dev commands that interact with Cloudflare-managed resources.

## Where to Look

- Server SSR entry: `app/entry.server.tsx`
- Routes: `app/routes.ts` and `app/routes/*.tsx`
- Worker server + DOs: `server/` and `server/durable_objects`
- Built artifacts: `build/`

## Need Help?

If you want, I can:
- Run a quick repo scan to verify scripts and `package.json`.
- Update CI examples for GitHub Actions/Bitbucket pipelines.

---

Happy hacking — open an issue or ask if you want a tailored CI/CD example for your provider.
