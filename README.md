# Orbit Enterprise Monorepo

Production-ready SaaS repository with:

- Next.js frontend with a modern control-center UI
- Express API with JWT auth
- PostgreSQL schema for users, workspaces, providers, and browser jobs
- Playwright worker service for queued browser automations
- MCP bridge endpoint for browser-plan execution
- Docker and `docker-compose` support
- Deploy-ready structure for split hosting

## What This Repo Does

This repo is a starting point for an AI operations SaaS.

It lets you:

- create user accounts and workspaces
- sign in with JWT auth
- connect free or free-friendly AI providers
- store provider credentials and defaults in Postgres
- queue browser automation jobs from the web dashboard
- run those jobs with a Playwright worker
- accept MCP-compatible browser-plan requests through the API

You can use it as the base for:

- an AI provider management console
- a browser automation SaaS
- an internal agent operations dashboard
- an MCP-backed browser job platform

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

6. Open the running services:

- Web: `http://localhost:3000`
- API health: `http://localhost:4000/api/health`

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

## Free Resources You Can Use

These are the main free or free-friendly services this repo is designed to work with:

- `OpenRouter` for multi-model AI access
- `Groq` for fast inference
- `Together AI` for open model access
- `Hugging Face` for hosted open-model inference
- `Neon` for Postgres
- `Vercel Hobby` for the Next.js frontend
- `Render` for the API and Playwright worker
- `Railway` as an alternative API/worker/database host

Recommended mapping:

- Frontend: Vercel Hobby
- API: Render web service or Railway service
- Worker: Render worker or Railway service
- Database: Neon Postgres
- AI providers: OpenRouter, Groq, Together, Hugging Face

Important:

- this repo is wired to connect to those services once you add your env vars and API keys
- it does not automatically create third-party accounts or provision those external resources for you

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

## Step-By-Step Free Setup

### OpenRouter

1. Create an account at `https://openrouter.ai/`
2. Generate an API key in the OpenRouter dashboard
3. Open the Orbit web app and choose the OpenRouter provider template
4. Fill:
   - `Provider key`: `openrouter`
   - `Base URL`: `https://openrouter.ai/api/v1`
   - `Default model`: for example `openai/gpt-4o-mini`
   - `API key`: your OpenRouter key
5. Save the provider

### Groq

1. Create an account at `https://console.groq.com/`
2. Generate an API key
3. Choose the Groq template in the Orbit UI
4. Fill:
   - `Provider key`: `groq`
   - `Base URL`: `https://api.groq.com/openai/v1`
   - `Default model`: for example `llama-3.3-70b-versatile`
   - `API key`: your Groq key
5. Save the provider

### Neon

1. Create an account at `https://neon.tech/`
2. Create a database project
3. Copy the Postgres connection string
4. Put it into `.env`:

```bash
DATABASE_URL=postgresql://...
```

5. Start the API or run Docker
6. The API will apply `apps/api/src/db/schema.sql` automatically when `AUTO_MIGRATE=true`

### Vercel Hobby

1. Push this repo to GitHub
2. Create a Vercel project and import the repo
3. If prompted, set the root directory to `apps/web`
4. Add environment variables in Vercel:
   - `NEXT_PUBLIC_APP_NAME=Orbit Control`
   - `NEXT_PUBLIC_API_URL=https://your-api-domain`
   - `API_PUBLIC_URL=https://your-api-domain`
5. Deploy the frontend

### Render

1. Push this repo to GitHub
2. Create a Render Blueprint using `render.yaml`
3. Let Render create the API service, worker, and database
4. Fill the unsynced Render environment variables:
   - `JWT_SECRET`
   - `WORKER_TOKEN`
   - `MCP_SHARED_SECRET`
   - `CORS_ORIGIN`
   - `NEXT_PUBLIC_API_URL` where needed
   - `API_PUBLIC_URL` where needed
   - `API_INTERNAL_URL` for the worker
5. Copy the API public URL after deploy
6. Use that API URL in the Vercel frontend env vars

### Railway

1. Create a Railway project
2. Add Postgres or reuse a Neon database
3. Deploy the API service from `apps/api`
4. Deploy the worker from `workers/playwright`
5. Deploy the frontend on Vercel, or host it separately on Railway if preferred
6. Set:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `WORKER_TOKEN`
   - `MCP_SHARED_SECRET`
   - `NEXT_PUBLIC_API_URL`
   - `API_PUBLIC_URL`
   - `API_INTERNAL_URL`

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

## Current Wiring Status

Already wired:

- Next.js frontend to Express API
- JWT auth and protected routes
- Postgres schema bootstrapping on API start
- AI provider catalog and provider persistence
- browser job queue and Playwright worker polling
- MCP route for browser-plan enqueueing
- Dockerfiles for web, API, and worker

Not yet automated:

- external account creation for Neon, Vercel, Render, Railway, OpenRouter, or Groq
- automatic provider key generation
- advanced production hardening such as encrypted secret storage, rate limiting, email verification, and managed queue infrastructure
