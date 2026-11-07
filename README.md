# QA & UX Beta Testing Platform

A monorepo for the QA and UX Beta Testing Platform — connecting organisations, testers, and suppliers in a structured feedback and quality-assurance workflow.

## Stack

| Layer | Technology |
|---|---|
| Monorepo | Turborepo + pnpm workspaces |
| Language | TypeScript 5.9 |
| API | Hono 4 on Cloudflare Workers |
| Frontend | React 19 + React Router 7 + Vite 8 |
| Data fetching | TanStack Query 5 |
| Styling | Tailwind CSS v4 + `@baobab-web/ui` |
| Validation | Zod 4 |
| ORM | Drizzle ORM + Neon (pg) |
| Testing | Vitest 4 + fast-check |
| Linting | ESLint 9 flat config + Prettier |

## Packages

| Package | Description |
|---|---|
| `apps/buyer` | Vite SPA — buyer / end-user portal |
| `apps/supplier` | Vite SPA — supplier / operator portal |
| `apps/worker` | Cloudflare Worker — API, Queues, cron |
| `packages/contracts` | Zod 4 schemas shared across all apps |
| `packages/domain` | Pure business-logic, zero I/O |
| `packages/db` | Drizzle schema, migrations, Neon client |

## Quickstart

```bash
# Prerequisites: Node 24, pnpm 9
pnpm install
pnpm dev
```

The worker dev server runs at `http://localhost:8787`.  
Buyer SPA at `http://localhost:5173`, supplier SPA at `http://localhost:5174`.

## Environment variables

Copy `.env.example` (create one) and set:

```
DATABASE_URL=postgresql://...
HUBTEL_API_KEY=...        # optional — enables Hubtel SMS
```
