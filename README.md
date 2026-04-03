# Orbit Enterprise Monorepo

Production-ready SaaS repository with:

- Next.js frontend with a modern control-center UI
- Express API with JWT auth
- PostgreSQL schema for users, workspaces, providers, and browser jobs
- Playwright worker service for queued browser automations
- MCP bridge endpoint for browser-plan execution
- Docker and `docker-compose` support
- Deploy-ready structure for split hosting

## Services

- `apps/web`: Next.js 15 App Router frontend
- `apps/api`: Express API, auth, DB, queue, and MCP bridge
- `workers/playwright`: Polling worker that runs browser jobs with Playwright
- `packages/shared`: Shared provider catalog and constants

## Quick Start

```bash
cp .env.example .env
npm install
docker compose up --build
```

App URLs:

- Web: `http://localhost:3000`
- API: `http://localhost:4000`

## Setup

1. Copy the environment template:

```bash
cp .env.example .env
```

2. Fill in the shared secrets in `.env`:

- `JWT_SECRET`
- `WORKER_TOKEN`
- `MCP_SHARED_SECRET`

3. Confirm the local service URLs:

- `NEXT_PUBLIC_API_URL=http://localhost:4000`
- `API_PUBLIC_URL=http://localhost:4000`
- `API_INTERNAL_URL=http://localhost:4000`

4. Install dependencies from the repo root:

```bash
npm install
```

5. Start everything with Docker:

```bash
docker compose up --build
```

## Local Dev Without Docker

```bash
npm install
npm run dev:api
npm run dev:web
npm run dev:worker
```

## Configuration

### Frontend

- `NEXT_PUBLIC_APP_NAME`: branding shown in the Next.js UI
- `NEXT_PUBLIC_API_URL`: browser-facing API base URL
- `API_PUBLIC_URL`: server-rendered frontend API URL

### API

- `PORT`: Express API port
- `DATABASE_URL`: Postgres connection string
- `JWT_SECRET`: JWT signing secret
- `JWT_EXPIRES_IN`: token lifetime
- `CORS_ORIGIN`: allowed frontend origin list
- `AUTO_MIGRATE`: set to `true` to apply schema on boot

### Worker

- `API_INTERNAL_URL`: internal API URL used by the Playwright worker
- `WORKER_TOKEN`: shared secret for internal worker routes

### MCP

- `MCP_SHARED_SECRET`: shared secret required by `/api/mcp/tools/run-browser-plan`

## Backend Features

- JWT register/login/me flow
- Workspace creation on signup
- AI provider catalog + saved provider credentials
- Browser job creation, claiming, and completion
- MCP-compatible HTTP manifest + browser-plan tool route

## Database

Schema file:

- `apps/api/src/db/schema.sql`

Tables:

- `users`
- `workspaces`
- `ai_providers`
- `app_settings`
- `browser_jobs`

## Environment

Core variables:

- `DATABASE_URL`
- `JWT_SECRET`
- `WORKER_TOKEN`
- `MCP_SHARED_SECRET`
- `NEXT_PUBLIC_API_URL`
- `API_PUBLIC_URL`
- `API_INTERNAL_URL`
- `APP_URL`

## Deployment

### Docker

```bash
docker compose up --build
```

### Free-friendly hosting split

- Frontend: Vercel Hobby
- API + worker: Render or Railway
- Postgres: Neon

Included deployment helpers:

- `docker-compose.yml` for local multi-service boot
- `render.yaml` blueprint for API, worker, web, and Postgres

Set the API and worker to share:

- `DATABASE_URL`
- `WORKER_TOKEN`
- `MCP_SHARED_SECRET`
- `JWT_SECRET`

## MCP Integration

The API exposes:

- `GET /api/mcp/manifest`
- `POST /api/mcp/tools/run-browser-plan`

This lets an external MCP-aware client enqueue browser plans without talking to Playwright directly.
