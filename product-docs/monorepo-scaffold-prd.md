# PRD: QA & UX Beta Testing Platform — Monorepo Scaffold

**Status:** Implemented (see [PR #1](https://github.com/bretuobay/qa-ux-platform/pull/1))  
**Repo:** https://github.com/bretuobay/qa-ux-platform

---

## Overview

Scaffold a complete, working monorepo skeleton for the QA & UX Beta Testing Platform. The platform connects organisations, testers, and suppliers in a structured feedback and quality-assurance workflow.

---

## Monorepo shape

```
qa-ux-platform/
  apps/
    buyer/          # Vite SPA — buyer portal
    supplier/       # Vite SPA — supplier/operator portal
    worker/         # Cloudflare Worker (Hono 4) — API + Queues + cron
  packages/
    contracts/      # Zod 4 schemas shared by all apps
    domain/         # Pure business rules, no I/O
    db/             # Drizzle schema, migrations, Neon/pg client
    ui/             # Shared React components (only when ≥2 apps need them)
  turbo.json
  pnpm-workspace.yaml
  package.json      # root
  tsconfig.base.json
  eslint.config.js  # ESLint 9 flat config
  .prettierrc
  vitest.workspace.ts
  wrangler.toml     # Cloudflare Worker config
  .gitignore
  README.md
```

---

## Tech versions

| Tool | Version |
|---|---|
| Node | 24 (`.nvmrc` + `engines` field) |
| pnpm | 9 (`packageManager` in root `package.json`) |
| TypeScript | 5.9 |
| Turborepo | latest |
| Hono | 4 |
| Vite | 8 |
| React | 19 |
| React Router | 7 |
| TanStack Query | 5 (`@tanstack/react-query`) |
| Tailwind CSS | v4 |
| `@baobab-web/ui` | from npm; stub as local workspace package if unpublished |
| Zod | 4 |
| Drizzle ORM + drizzle-kit | `pg` driver |
| Vitest | 4 |
| fast-check | latest |
| ESLint | 9 flat config |
| Prettier | latest |

---

## apps/worker (Cloudflare Worker)

- **Entry:** `src/index.ts` — Hono 4 app exported as `export default app`
- **Stub routes:** `GET /api/health`, router stubs for `/api/v1/auth`, `/api/v1/orders`, `/api/v1/findings`
- **Cloudflare Queues** binding stub (`QA_QUEUE`) with a `queue` export handler
- **Cron trigger** stub (`scheduled` export) with handler in `src/jobs/cron.ts`
- **Hyperdrive** binding stub (`HYPERDRIVE`) for Neon in production
- **R2** bucket binding stub (`EVIDENCE_BUCKET`)
- **SMS adapter:** `src/adapters/sms.ts`
  - `SmsAdapter` interface with `send(to, message)`
  - `ConsoleSmsAdapter` (default/dev)
  - `HubtelSmsAdapter` (used when `HUBTEL_API_KEY` env var present)
  - Factory function `createSmsAdapter(env)`
- **Auth middleware:** `src/middleware/auth.ts` — HTTP-only cookie auth stub
- **Business middleware:** `src/middleware/business.ts` — attaches `businessId` from `X-Business-Id` header to Hono context
- `wrangler.toml` declaring all bindings; `compatibility_date` set to scaffold date
- `tsconfig.json` extending `../../tsconfig.base.json`
- Bindings type file `src/types/worker-env.d.ts`

---

## apps/buyer and apps/supplier

- Vite 8 + React 19 + React Router 7 + TanStack Query 5 + Tailwind v4
- `vite.config.ts` proxies `/api` → `http://localhost:8787`
- Each app: `src/main.tsx`, `src/App.tsx` with `<RouterProvider>`, `src/routes/` with at least one route component using the view-model pattern
- **View-model pattern:** `useXxxViewModel` hook (fetches + holds state), component only renders
- **Buyer example route:** `src/routes/orders/index.tsx` + `src/routes/orders/useOrdersViewModel.ts`
- **Supplier example route:** `src/routes/dashboard/index.tsx` + `src/routes/dashboard/useDashboardViewModel.ts`
- Tailwind v4 configured in `src/index.css` with `@import "tailwindcss"` and `@baobab-web/ui` Signal theme
- Files: `index.html`, `tsconfig.json`, `tsconfig.node.json`, `vitest.config.ts`

---

## packages/contracts

- Zod 4 schemas: `OrderSchema`, `FindingSchema`, `UserSchema`, `BusinessSchema`, `TesterProfileSchema`
- Each in its own file under `src/`; re-export all from `src/index.ts`
- `tsconfig.json` extending base; builds to `dist/`
- Vitest config

---

## packages/domain

- Pure TypeScript, zero runtime deps except `packages/contracts`
- `src/order/createOrder.ts` — `createOrder(input: OrderInput): Order`
- `src/order/validateOrder.ts` — `validateOrder(order: Order): ValidationResult`
- `src/order/index.ts` re-exports both
- `src/index.ts` re-exports all
- Vitest config; at least 3 unit tests + 2 fast-check property tests in `src/order/__tests__/`

---

## packages/db

- Drizzle ORM with `pg` driver
- `src/schema/` — tables: `organizations`, `users`, `memberships`, `applications`, `builds`, `orders`, `scenarios`, `executions`, `findings`, `evidence`, `tester_profiles`, `assignments`, `reports`, `payments`
- Each table in its own file; re-export from `src/schema/index.ts`
- `drizzle.config.ts` using `DATABASE_URL` env var
- `src/client.ts` — `getDb(connectionString: string)` helper using `drizzle(new Pool({ connectionString }))`
- `tsconfig.json` extending base; builds to `dist/`

---

## Root config files

### pnpm-workspace.yaml
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### turbo.json
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**", ".next/**"] },
    "dev": { "cache": false, "persistent": true },
    "lint": {},
    "test": { "dependsOn": ["^build"] },
    "typecheck": { "dependsOn": ["^build"] }
  }
}
```

### tsconfig.base.json
Strict mode, `moduleResolution: "bundler"`, `target: "ES2022"`, `lib: ["ES2022"]`; no `paths` (packages export via `exports` field).

### ESLint 9 flat config (`eslint.config.js`)
`@typescript-eslint`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-config-prettier`

### .prettierrc
`singleQuote: true`, `semi: false`, `tabWidth: 2`, `trailingComma: "es5"`

### vitest.workspace.ts
```ts
export default ['packages/*/vitest.config.ts', 'apps/*/vitest.config.ts']
```

### Root package.json scripts
```json
{
  "build": "turbo run build",
  "dev": "turbo run dev",
  "lint": "turbo run lint",
  "test": "turbo run test",
  "typecheck": "turbo run typecheck",
  "format": "prettier --write ."
}
```

---

## Acceptance criteria

All of the following must pass with zero errors before the PR is merged:

1. `pnpm install`
2. `pnpm typecheck`
3. `pnpm lint`
4. `pnpm test`
5. `pnpm build`

### Fallback for `@baobab-web/ui`

If `@baobab-web/ui` is not on npm or has peer dep conflicts with React 19 / Tailwind v4, stub it as `packages/ui` (a workspace package) exporting a `Button` component and a `cn` utility using `clsx` + `tailwind-merge`, referenced as `@qa-ux/ui` in all apps.

---

## Implementation notes (recorded post-scaffold)

- `@baobab-web/ui@1.7.0` was available on npm and compatible with React 19 — no stub was needed. The Signal CSS theme is imported via `@baobab-web/ui/themes/signal.css`.
- `@vitejs/plugin-react` needed to be v6 (not v4) to support Vite 8.
- `@cloudflare/workers-types` needed to be v5 to match Wrangler 4.
- Zod 4 `z.infer<>` returns the **output** type (defaults filled in); `z.input<>` was used for `CreateOrderInput` so callers don't have to pass `status`.
- Zod 4 UUID validation is stricter than v3 — test fixture UUIDs must be valid v4 UUIDs.
- `globalThis.crypto.randomUUID()` (Web Crypto API) used in `packages/domain` instead of Node's `crypto` module to keep the package runtime-agnostic.
