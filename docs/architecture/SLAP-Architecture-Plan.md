# SLAP — Enterprise Monorepo Template
## Architecture & Planning Document · v2.0 · March 2026

> **Stop AI Slop. Build What Works.**

---

## Table of Contents

1. [Vision & Goals](#1-vision--goals)
2. [Infrastructure — Cloudflare Native](#2-infrastructure--cloudflare-native)
3. [Monorepo Structure](#3-monorepo-structure)
4. [Tech Stack](#4-tech-stack)
5. [CI/CD Pipeline](#5-cicd-pipeline)
6. [Frontend — apps/web](#6-frontend--appsweb)
7. [Backend — apps/api](#7-backend--appsapi)
8. [Validators Package — @slap/validators](#8-validators-package--slapvalidators)
9. [Database — @slap/db](#9-database--slapdb)
10. [Authentication, Authorisation & Security](#10-authentication-authorisation--security)
11. [Mobile — apps/mobile](#11-mobile--appsmobile)
12. [Logger Package — @slap/logger](#12-logger-package--slaplogger)
13. [Testing Strategy — TDD-oriented](#13-testing-strategy--tdd-oriented)
14. [Observability](#14-observability)
15. [Design System](#15-design-system)
16. [Payments — Polar.sh](#16-payments--polarsh)
17. [Email — @slap/email](#17-email--slapemail)
18. [Documentation System](#18-documentation-system)
19. [The slap CLI — Post-v1](#19-the-slap-cli--post-v1)
20. [Beyond v1 — Planned Extensions](#20-beyond-v1--planned-extensions)
21. [Alternative Structure — Self-hosted (Beyond v1)](#21-alternative-structure--self-hosted-beyond-v1)

---

## 1. Vision & Goals

SLAP (Stop AI Slop, Launch Actually-good Products) is an enterprise-grade monorepo template engineered for serial app production. The goal is to reduce time-to-launch for a new production-ready application from weeks to 1–2 days. By combining a battle-tested stack, consistent design system, AI-ready documentation, and automated tooling, every project bootstrapped from SLAP starts at production quality — not proof-of-concept quality.

### 1.1 Design Principles

- **Consistency** — one repo, one style guide, one test strategy, one CI pipeline across all apps.
- **Stability** — every dependency is kept at the latest stable major; updates are a deliberate action, not a surprise.
- **Security by default** — auth, rate limiting, input validation, and secrets management are pre-wired before a single line of business logic is written.
- **Speed by default** — edge-first architecture, query caching, bundle optimisation, and CDN delivery out of the box.
- **Compact** — everything lives in the monorepo; bootstrapping a new app from the template requires no external scaffolding step (and once the CLI exists, a single `npx slap init`).
- **AI-native** — all documentation, folder naming, and test patterns are designed to be consumed and extended by AI agents without ambiguity.
- **Local-first development** — the full stack must run and iterate fast on a local machine before any cloud deploy is needed.

---

## 2. Infrastructure — Cloudflare Native

SLAP is built entirely on Cloudflare's platform. There is no server to provision, no container to manage, and no reverse proxy to configure. Cloudflare is the runtime, the database, the cache, the queue, the CDN, and the observability layer. Each app manages its own Cloudflare config via a `wrangler.toml` at its root — there is no shared infra folder.

### 2.1 Cloudflare Services Map

| Service | Role in SLAP |
|---|---|
| Workers | Backend API (Hono) — handles HTTP, auth callbacks, webhook processing |
| Pages | Next.js frontend — static + edge-SSR via `_worker.js` |
| D1 | Primary relational database — SQLite, globally replicated read replicas |
| R2 | Object storage — user uploads, email assets, build artefacts; private by default |
| KV | Session store, feature flags, short-lived read caches |
| Queues | Async job processing — email sends, webhook retries, analytics ingestion |
| Durable Objects | Mutable edge state — rate limiter token buckets, WebSocket presence hubs |
| Cron Triggers | Scheduled jobs — digest emails, data aggregation, cleanup routines |
| Workers AI | On-demand lightweight inference at the edge |
| Logpush | Structured log export to R2; queryable via Cloudflare SQL API |
| Analytics Engine | Custom product metrics at edge (latency buckets, queue depths) |
| Turnstile | Invisible bot protection on auth and contact forms |
| Access | Zero-trust access control for admin dashboards and internal tooling |
| Pages Previews | Per-branch preview URLs — available but not wired into CI by default |

> **Note:** Preview deployments — Cloudflare Pages supports per-branch preview URLs and this capability is available but not planned in v1 CI. It can be enabled by adding a `deploy-preview` workflow when needed.

---

## 3. Monorepo Structure

### 3.1 Top-level Layout

```
slap/
├── apps/
│   ├── web/              # Next.js 15 — landing + app + admin
│   │   └── wrangler.toml # CF Pages config for this app
│   ├── api/              # Hono — backend API worker
│   │   └── wrangler.toml # CF Worker config for this app
│   └── mobile/           # Expo + React Native
├── packages/
│   ├── ui/               # shadcn/ui + mvpblocks design system
│   ├── config/           # Shared tsconfig, ultracite configs
│   ├── db/               # Drizzle schema + migrations
│   ├── validators/       # Zod schemas + inferred types
│   ├── logger/           # Pino wrapper with SLAP pretty format
│   ├── auth/             # Better-Auth config + Drizzle adapter
│   ├── email/            # React Email templates + Resend adapter
│   └── analytics/        # PostHog + Sentry shared init
├── docs/
│   ├── project/          # Architecture, ADRs, MVP, feature sets, external setup guide
│   └── tasks/            # AI-managed task lifecycle documents
│       ├── open/         # Active tasks
│       └── done/         # Completed tasks
├── skills/               # Editor skill files (loaded by Cursor/Windsurf skill system)
│   ├── hono.md
│   ├── drizzle.md
│   ├── nextjs.md
│   ├── betterauth.md
│   ├── tiptap.md
│   └── expo.md
├── scripts/              # Code-gen utilities and helpers
├── .github/              # CI workflows, PR and issue templates
├── .cursorrules          # Cursor IDE rules — loaded automatically every session
├── .windsurfrules        # Windsurf IDE rules
├── AGENT.md              # Generic agent briefing (Claude, GPT, etc.)
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

### 3.2 Package vs App Decision Criteria

A piece of code becomes a **package** when it is imported by more than one app, has no runtime side effects at import time, or wraps a third-party service in a consistent adapter. It stays in an **app** when it is specific to that app's routing, UI, or business logic.

| Name | Type | Rationale |
|---|---|---|
| ui | Package | Components consumed by web and mobile |
| validators | Package | Zod schemas + types used by API, web, and mobile |
| db | Package | Single schema source; multiple apps query the same D1 |
| logger | Package | Used by API, queue workers, and scripts |
| auth | Package | Better-Auth config + adapter shared by API and web |
| email | Package | Templates + Resend sender used by API and cron workers |
| analytics | Package | PostHog/Sentry init shared by web and mobile |
| config | Package | ESLint (Ultracite), tsconfig, Tailwind preset |
| web | App | Next.js — app-specific routes and pages |
| api | App | Hono worker — app-specific route handlers |
| mobile | App | Expo — app-specific screens and navigation |

---

## 4. Tech Stack

### 4.1 Monorepo Tooling

| Concern | Choice |
|---|---|
| Package manager | pnpm — workspace hoisting, strict peer resolution, fast installs |
| Monorepo runner | Turborepo — task graph execution with remote caching (Vercel Remote Cache or self-hosted via `TURBO_REMOTE_CACHE_SIGNATURE_KEY`) |
| Linter | Oxlint via Ultracite — Rust-based, near-zero config, 50–100× faster than ESLint |
| Formatter | oxfmt via Ultracite — consistent formatting enforced at save and on commit |
| Lint/format config | `packages/config` exports per-app Ultracite configs: `base`, `nextjs`, `react-native` — apps extend rather than duplicate |
| TypeScript | `packages/config/tsconfig/` — strict mode, bundler module resolution, shared path aliases |

### 4.2 Ultracite Config Inheritance

Ultracite is the one config that governs everything. The `packages/config` package exports three composable configs. Each app extends the right one — no duplication, no drift.

```json
// packages/config/ultracite/base.json  — all apps inherit this
// packages/config/ultracite/nextjs.json — extends base, enables Next.js plugin
// packages/config/ultracite/expo.json   — extends base, enables RN plugin
```

```json
// apps/web/.ultraciterc.json
{ "extends": "@slap/config/ultracite/nextjs" }
```

```json
// apps/api/.ultraciterc.json
{ "extends": "@slap/config/ultracite/base" }
```

```json
// apps/mobile/.ultraciterc.json
{ "extends": "@slap/config/ultracite/expo" }
```

### 4.3 Developer Experience Tooling

| Tool | Role |
|---|---|
| Git hooks | Lefthook — single binary, no postinstall script needed; hooks defined in `lefthook.yml` at repo root |
| Staged linting | Lefthook built-in glob filtering — runs oxlint + oxfmt `--write` on staged files only; no lint-staged required |
| Commit linting | commitlint + `@commitlint/config-conventional` — enforces conventional commit format |
| Commit helper | commitizen + cz-emoji — interactive prompt for emoji conventional commits |
| Versioning | Changesets — per-package bump + auto-generated `CHANGELOG.md` files |
| CI/CD | GitHub Actions — lint, typecheck, test, build, deploy (see section 5) |

**`lefthook.yml` (repo root):**

```yaml
pre-commit:
  parallel: true
  commands:
    lint:
      glob: "*.{ts,tsx,mts,cts}"
      run: pnpm oxlint --fix {staged_files}
    format:
      glob: "*.{ts,tsx,mts,cts,json,md}"
      run: pnpm oxfmt --write {staged_files}

commit-msg:
  commands:
    commitlint:
      run: pnpm commitlint --edit {1}
```

### 4.4 Root package.json Scripts

These scripts are available at the workspace root and are the primary day-to-day commands.

```json
{
  "scripts": {
    "dev":          "turbo dev",
    "build":        "turbo build",
    "test":         "turbo test",
    "fix":          "turbo fix",
    "commit":       "git add -A && cz",
    "commit:stage": "cz",
    "changeset":    "changeset",
    "version":      "changeset version",
    "release":      "changeset publish"
  }
}
```

> **`pnpm fix`** — The single code-health command. It runs typecheck and lint/format (with `--write`) across all packages in parallel. `build` and `test` declare `fix` as a dependency in the Turbo pipeline, so they never run on broken code. Running `pnpm fix` before committing is enforced via the Lefthook pre-commit hook. `lint` and `typecheck` are not exposed as separate root scripts — `fix` is the only entry point for both.

### 4.5 Turbo Pipeline

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "remoteCache": { "enabled": true },
  "tasks": {
    "typecheck": { "dependsOn": ["^build"], "outputs": [] },
    "lint":      { "outputs": [] },
    "fix":       { "dependsOn": ["typecheck", "lint"], "outputs": [] },
    "build":     { "dependsOn": ["fix", "^build"], "outputs": [".next/**", "dist/**", ".wrangler/**"] },
    "test":      { "dependsOn": ["fix", "^build"], "outputs": ["coverage/**"] },
    "dev":       { "persistent": true, "cache": false }
  }
}
```

`typecheck` and `lint` are internal pipeline nodes — they exist so Turbo can cache them individually, but they are not called directly. `fix` is the only public gate, and both `build` and `test` must pass through it. This means a dirty codebase can never produce a successful build or test run.

---

## 5. CI/CD Pipeline

### 5.1 GitHub Actions Workflows

The CI pipeline covers only what must run on every push. Deployments, releases, dependency updates, and security scans are all managed via external service GUIs — see `docs/project/EXTERNAL-SETUP.md` for step-by-step configuration of each.

| Workflow | Trigger & Action |
|---|---|
| `ci.yml` | Triggers on every push and PR. Runs: `pnpm install` → `turbo fix` → `turbo test` → `turbo build` (affected packages only via Turbo). Gate: all steps must pass for a PR to be mergeable. |

**Managed externally (not in CI):**

| Concern | Where to configure |
|---|---|
| Web deploy (Cloudflare Pages) | Cloudflare Pages dashboard — connect GitHub repo, set build command and output dir, auto-deploys on push to main |
| API deploy (Cloudflare Workers) | Cloudflare Workers dashboard — connect GitHub repo via Cloudflare CI integration |
| Mobile release (App Store / Play Store) | Expo EAS dashboard — configure build profiles and submit credentials per platform |
| Dependency updates | Renovate Bot app — install on repo, configure `renovate.json` grouping strategy |
| Security scanning | Snyk dashboard — connect repo, set severity threshold for PR blocking |

See `docs/project/EXTERNAL-SETUP.md` for the exact steps to configure each of these.

### 5.2 Changesets Workflow

1. Developer runs `pnpm changeset` — selects affected packages, chooses bump type (patch/minor/major), writes a one-line summary.
2. The changeset file (`.changeset/random-name.md`) is committed with the PR.
3. On merge to main, the Changesets bot opens a "Version Packages" PR that aggregates all pending changesets into version bumps + CHANGELOG entries.
4. Merging the Version Packages PR applies all bumps and creates git tags. Downstream deploys (Cloudflare, EAS) are triggered by their own Git integrations watching for those tags.

### 5.3 Local Development — First Priority

All apps must be fully runnable locally before any cloud resource is needed. The local dev setup is designed for fast iteration — hot reload, local D1, local KV, and local Queues all work via Wrangler's built-in local simulation.

```bash
# Start everything locally
pnpm dev                          # Turbo fans out to all apps concurrently

# Per-app local dev
pnpm --filter @slap/web dev       # Next.js on localhost:3000
pnpm --filter @slap/api dev       # Wrangler dev on localhost:8787
pnpm --filter @slap/mobile dev    # Expo on localhost:8081 (Expo Go)
```

> **Expo + Linux:** Expo local development does not require a Mac or EAS. Expo Go on an Android device or the Android Emulator covers the full dev loop on Linux. EAS Build is the cloud build service used when producing App Store / Play Store binaries — this is only needed for release builds. Local Expo dev and EAS are independent workflows.

---

## 6. Frontend — apps/web

| Concern | Choice |
|---|---|
| Framework | Next.js 15 (App Router, React 19, Partial Pre-rendering) |
| Deployment | Cloudflare Pages — `wrangler.toml` at `apps/web` root, `@cloudflare/next-on-pages` adapter |
| Styling | Tailwind CSS v4 — single CSS config, design tokens from `packages/ui/tokens.css` |
| Components | shadcn/ui (latest) — copied into `packages/ui` and owned by the repo |
| Blocks | mvpblocks pre-built sections; fall back to shadcn community blocks (`ui.shadcn.com/blocks`) — source URL documented in component file header |
| Theme | tweakcn.com token generation → baseui preset → CSS variables in `packages/ui` |
| Icons | lucide-react — consistent set across web and mobile |
| Data fetching | TanStack Query v5 — works with RSC, Server Actions, and client components; `staleTime` defaults to 60s |
| State | Zustand v5 — only for complex cross-component client state; TanStack Query handles server state |
| Validation | Zod via `@slap/validators` — same schemas as API (see section 8) |
| Auth client | Better-Auth React client + Next.js server helpers |
| Payments | `@polar-sh/nextjs` — checkout redirect and customer portal link |
| Rich text | Tiptap v3 — headless, Tailwind-styled, content stored as ProseMirror JSON in D1 |
| Server Actions | Used for mutations where a full API round-trip adds no value (e.g. settings update) |
| Analytics | `@slap/analytics` — PostHog + Sentry, both behind `/ingest/*` and `/monitoring/*` reverse proxy rewrites in `next.config.ts` to bypass ad blockers |
| Forms | react-hook-form v7 + Zod resolver |
| API calls | Hono RPC client (`hono/client`) — fully typed, no raw fetch calls in the frontend |

> **i18n:** next-intl is planned beyond v1. The template ships in English only. next-intl will be pre-installed and wired but inactive — adding a locale requires only adding `messages/{locale}.json` and the locale to the config array.

---

## 7. Backend — apps/api

| Concern | Choice |
|---|---|
| Framework | Hono v4 — Cloudflare Workers-native, ultra-fast, zero external dependencies |
| Deployment | Cloudflare Workers — `wrangler.toml` at `apps/api` root |
| API spec | hono-zod-openapi — type-safe request/response contracts; Scalar UI at `/api/docs` |
| Validation | Zod via `@slap/validators` — same schemas as frontend; request validation at route layer |
| ORM | Drizzle ORM v1 beta — SQL-first, D1 adapter, type-safe queries |
| Database | Cloudflare D1 — SQLite-based, globally replicated |
| Cache / Sessions | Cloudflare KV — sessions, feature flags; Durable Objects for mutable state |
| Auth | Better-Auth server — Drizzle adapter, see section 10 |
| Payments | Polar.sh webhook handler + API wrapper; webhooks enqueued to CF Queues for reliability |
| Email | `@slap/email` — Resend transport, sends enqueued via CF Queues (decoupled, auto-retried) |
| Rate limiting | Durable Object token bucket — per-endpoint limits, see section 10.2 |
| Security headers | Hono secure-headers middleware — CSP, HSTS, X-Frame-Options |
| CORS | Hono CORS middleware — origin allowlist loaded from env vars |
| Logging | `@slap/logger` — Pino with Cloudflare Workers-compatible sync sink |
| Background jobs | CF Queues consumer + Cron Triggers — modular consumer files per job domain |
| Structure | One Hono sub-app per feature domain (auth, users, billing, content) merged at root |

---

## 8. Validators Package — @slap/validators

This package is the single source of truth for all data shapes across the entire monorepo. Every schema lives here, types are inferred and re-exported, and both the frontend and backend import from this package. Nothing defines its own ad-hoc validation.

### 8.1 Structure

```
packages/validators/
├── src/
│   ├── schemas/
│   │   ├── auth.ts         # Login, register, magic-link, reset-password
│   │   ├── user.ts         # User profile update, avatar, preferences
│   │   ├── billing.ts      # Checkout, subscription, webhook payloads
│   │   ├── content.ts      # Rich-text document create/update
│   │   └── common.ts       # Pagination, cursor, ID shapes, date ranges
│   ├── types/
│   │   └── index.ts        # All z.infer<> exports
│   └── index.ts            # Re-exports everything
└── package.json
```

### 8.2 Schema + Type Export Pattern

Every schema file exports both the Zod schema (for runtime validation) and the inferred TypeScript type (for compile-time safety). This pattern is enforced across all schema files.

```ts
// packages/validators/src/schemas/auth.ts
import { z } from 'zod';

export const LoginSchema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const RegisterSchema = LoginSchema.extend({
  name:            z.string().min(2).max(100),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path:    ['confirmPassword'],
});

export const MagicLinkSchema = z.object({
  email: z.string().email(),
});
```

```ts
// packages/validators/src/types/index.ts
export type LoginInput     = z.infer<typeof LoginSchema>;
export type RegisterInput  = z.infer<typeof RegisterSchema>;
export type MagicLinkInput = z.infer<typeof MagicLinkSchema>;
// ... all other inferred types
```

```ts
// packages/validators/src/index.ts  (the public API)
export * from './schemas/auth';
export * from './schemas/user';
export * from './schemas/billing';
export * from './schemas/content';
export * from './schemas/common';
export * from './types';
```

### 8.3 Usage Across Apps

```ts
// apps/api — route handler with openapi contract
import { LoginSchema, type LoginInput } from '@slap/validators';

app.openapi(createRoute({
  method: 'post', path: '/auth/login',
  request: { body: { content: { 'application/json': { schema: LoginSchema } } } },
}), async (c) => {
  const body: LoginInput = c.req.valid('json');
  // body is fully typed, already validated
});
```

```ts
// apps/web — form with react-hook-form
import { LoginSchema, type LoginInput } from '@slap/validators';

const form = useForm<LoginInput>({ resolver: zodResolver(LoginSchema) });
```

```ts
// apps/mobile — same import, same behaviour
import { LoginSchema, type LoginInput } from '@slap/validators';
```

---

## 9. Database — @slap/db

### 9.1 Drizzle + D1 Setup

The `db` package owns the complete database layer: schema definitions, migration files, and helper utilities. All apps import from `@slap/db` — no app defines its own table. Drizzle ORM v1 beta is used with the D1 HTTP adapter for Cloudflare Workers.

```
packages/db/
├── src/
│   ├── schema/
│   │   ├── users.ts          # users, sessions, accounts tables
│   │   ├── content.ts        # documents, revisions
│   │   ├── billing.ts        # subscriptions, orders
│   │   └── audit.ts          # audit_logs — immutable append-only
│   ├── client.ts             # createDb(d1Binding) factory
│   └── index.ts              # re-exports schema + client
├── migrations/               # generated SQL migration files
└── drizzle.config.ts
```

### 9.2 Schema Conventions

- All tables use **cuid2** as the primary key type — collision-resistant, URL-safe, no UUID overhead.
- Every table includes `created_at` and `updated_at` — set automatically via Drizzle `default`/`onUpdate`.
- Soft deletes via `deleted_at` timestamp — user data is never hard-deleted.
- Foreign keys are always indexed explicitly — Drizzle does not auto-index FKs.
- Audit log table is append-only — no update or delete operations, ever.

### 9.3 DB Scripts

| Command | Description |
|---|---|
| `db:generate` | `drizzle-kit generate` — diffs schema against last migration and emits a new SQL file |
| `db:push` | `drizzle-kit push` — pushes schema diff directly to local D1 (dev only, no migration file) |
| `db:pull` | `drizzle-kit pull` — introspects an existing D1 database and generates schema TypeScript from it |
| `db:introspect` | Alias for `pull` — used when starting from an existing database (e.g. migrating a legacy project into SLAP) |
| `db:migrate` | `wrangler d1 execute` — applies the latest migration file to local D1 |
| `db:migrate:prod` | `wrangler d1 execute --remote` — applies to production D1 via Cloudflare API |
| `db:studio` | `drizzle-kit studio` — opens local visual database browser |
| `db:seed` | `tsx src/seed.ts` — populates local D1 with fixture data for development |

> **Migration tests:** Standalone migration test files are not planned. Migrations are validated by running them against a real in-process D1 SQLite instance during integration tests (the api test suite runs `db:migrate` as a setup step). This catches broken migrations without a separate test category.

---

## 10. Authentication, Authorisation & Security

### 10.1 Better-Auth Configuration

| Aspect | Detail |
|---|---|
| Adapter | Drizzle adapter (`@slap/db`) — users, sessions, accounts, verifications tables managed by Better-Auth |
| Strategies | Google OAuth (v1). Apple OAuth (planned beyond v1). Magic Link (email). Email + password. |
| Session | JWT stored in Cloudflare KV — 7-day sliding expiry window |
| Roles | User and Admin — two roles only for v1. Better-Auth roles plugin, checked via middleware on protected routes. |
| MFA | Planned beyond v1 — Better-Auth MFA plugin (TOTP) is available but not activated in the template. |
| Passkeys | Planned beyond v1 — Better-Auth WebAuthn plugin. |
| Org/tenant | Planned beyond v1 — Better-Auth organisations plugin. |
| Mobile | Expo SecureStore persists the Better-Auth token — biometric unlock supported via expo-local-authentication. |

> **FRICTIONLESS AUTH:** Auth UX is one screen: a Google sign-in button plus an email magic-link fallback. No password field shown by default. The goal is zero friction on the user's first visit. Email/password is available in the API but not surfaced in the default UI.

### 10.2 Rate Limiting

Rate limiting is implemented via a Durable Object token bucket. Each bucket is keyed by IP address or user ID depending on the endpoint.

| Scope | Limit |
|---|---|
| Auth endpoints (login, magic link) | 10 requests / 15 minutes per IP. On breach: 429 + `Retry-After` header. Resets after 15 min of inactivity. |
| Auth endpoints (per user account) | 100 requests / 1 hour per authenticated user ID. Prevents credential stuffing on known accounts. |
| General API | 1,000 requests / 1 minute per IP — generous baseline appropriate for Cloudflare Workers (no cold-start cost per request). Adjust downward for sensitive endpoints. |
| Admin routes | 100 requests / 1 minute per user ID — tighter window; admin actions are rarely high-frequency. |

### 10.3 Security Defaults

- All secrets in environment variables — never committed. `.env.example` documents every variable with a description.
- Content Security Policy via Hono `secure-headers` (API) and Next.js `headers` config (web).
- CORS: origin allowlist from env — never wildcard in production.
- Zod validation on every API route — malformed requests rejected before any handler logic runs.
- Drizzle parameterised queries — SQL injection impossible by construction.
- R2 objects private by default — presigned URLs with 15-minute TTL for all user file access.
- Cloudflare Turnstile on all auth forms — invisible, no user friction.
- Audit log in D1 for all admin actions, auth events, and payment events — append-only, never modified.
- `pnpm audit` + Snyk scan runs daily in CI — new vulnerabilities open a GitHub issue automatically.

---

## 11. Mobile — apps/mobile

| Concern | Choice |
|---|---|
| Framework | Expo SDK 53 (latest) + React Native 0.78 |
| Navigation | Expo Router v4 — file-based routing, typed route params, deep link support built-in |
| Styling | NativeWind v4 — Tailwind utility classes in React Native, same token set as web |
| Components | react-native-reusables — shadcn/ui port for React Native, base for `packages/ui` mobile variants |
| Data / State | TanStack Query v5 + Zustand v5 — identical patterns to web |
| Validation | `@slap/validators` — same Zod schemas, zero duplication |
| Auth | Better-Auth Expo client — SecureStore for token, biometric unlock via expo-local-authentication |
| Payments | Expo WebBrowser for web-initiated Polar checkout — complies with App Store guidelines |
| Notifications | Expo Notifications — FCM (Android) + APNs (iOS), push token stored in D1 |
| Offline | TanStack Query persistence adapter + expo-sqlite for local query cache |
| OTA updates | Expo Updates — silent JS bundle updates between app store releases for non-native changes |
| Builds | EAS Build (cloud) — Android builds on Linux, iOS builds on cloud Mac agents via EAS |
| Distribution | EAS Submit — automated App Store + Play Store submission from CI |
| Analytics | PostHog React Native SDK + Sentry Expo plugin |
| Platforms | iOS 16+ and Android 9+ (API level 28) |

> **EAS + Linux:** Since development is on Linux (no local Mac), EAS Build provides cloud-hosted Mac build agents for iOS. Android builds compile locally or via EAS. Preview and production builds are triggered via the Expo EAS dashboard connected to the GitHub repo — no local Mac ever required.

---

## 12. Logger Package — @slap/logger

### 12.1 Log Format

The logger wraps Pino and outputs human-readable one-liners in development and structured JSON in production.

```
[HH:MM:SS] LEVEL [module] [sub/fn] message  •  { payload }
```

**Examples:**

```
[14:32:01] INFO  [api] [auth/login] User authenticated  •  { userId: "u_abc", ms: 42 }
[14:32:01] ERROR [queue] [email/send] Delivery failed  •  { reqId: "r_9xk", to: "x@y" }
```

### 12.2 Request ID Pattern

Every top-level entry point — Worker fetch handler, Queue consumer, Cron handler — generates a unique `requestId` (nanoid, 12 chars) and creates a child logger with it. All descendant functions receive the child logger as a parameter. Parallel requests running in the same isolate never mix their log lines.

```ts
// Worker entry point
const reqId = nanoid(12);
const log = logger.child({ module: 'api', reqId });
await handleRequest(req, env, log);

// Descendant handler — receives and extends the logger
async function handleRequest(req: Request, env: Env, log: Logger) {
  const child = log.child({ sub: 'auth/login' });
  child.info('User authenticated', { userId });
}
```

### 12.3 API & Configuration

| API | Description |
|---|---|
| `createLogger(module)` | Factory — returns a Pino instance labelled with the module name |
| `logger.child({ sub })` | Creates a scoped child with inherited context; `sub` becomes the `[sub/fn]` segment |
| `log.info/warn/error()` | Standard Pino levels: trace debug info warn error fatal |
| `LOG_LEVEL` | Env var — minimum output level. Default: `info` (prod), `debug` (dev) |
| `LOG_FORMAT` | Env var — `'pretty'` (dev default) \| `'json'` (prod default) |
| Redaction | Auto-redacts: `password`, `token`, `secret`, `authorization`, `cookie`, `set-cookie` |

### 12.4 ANSI Colour Map (pretty mode)

| Token | Colour |
|---|---|
| TRACE | Dim white |
| DEBUG | Cyan |
| INFO | Green bold |
| WARN | Yellow bold |
| ERROR | Red bold |
| FATAL | White on red background |
| `[module]` | Bright blue |
| `[sub/fn]` | Magenta |
| `reqId` | Gray italic |
| `• payload` | Dark gray |

---

## 13. Testing Strategy — TDD-oriented

### 13.1 Philosophy

Minimal but meaningful. Every package ships with tests that verify: (1) core business logic contracts, (2) API route input/output contracts, (3) critical UI flows (auth, payment checkout, onboarding), and (4) schema validation edge cases. The rule: **if it breaks in production and hurts a user, it must be tested before it ships.**

### 13.2 Test Layers

| Layer | Tool & Scope |
|---|---|
| Unit — `@slap/validators` | Vitest — every schema tested with valid, invalid, and edge-case fixtures. This is the most critical unit test suite. |
| Unit — `@slap/logger` | Vitest — assert format output, level filtering, field redaction. |
| Unit — `@slap/auth` | Vitest — token generation, session expiry logic, role check helpers. |
| Integration — `apps/api` | Vitest + Hono test client — all routes tested against mocked D1/KV bindings. DB migrations applied as setup step. No external network calls. |
| Component — `packages/ui` | Vitest + `@testing-library/react` — interaction tests for stateful components (forms, dialogs, dropdowns). |
| E2E — `apps/web` | Playwright — auth flow, onboarding, billing checkout, core app actions. Runs against local dev server. |
| E2E — `apps/mobile` | Maestro (YAML-based) — login, core screen navigation smoke tests. Runs on Android Emulator in CI. |
| Type coverage | `tsc --noEmit` runs in CI as part of `turbo typecheck` — zero TypeScript errors gate every merge. |

### 13.3 Vitest Shared Config

```ts
// packages/config/vitest.base.ts
export default defineConfig({
  test: {
    globals:     true,
    environment: 'node',   // override to 'jsdom' in packages/ui
    coverage:    { provider: 'v8', reporter: ['text', 'lcov'] },
    include:     ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    setupFiles:  ['./src/test-setup.ts'],
  }
});
```

### 13.4 TDD Workflow

1. Write a failing test that precisely describes the expected contract **(red)**.
2. Write the minimum implementation to pass it **(green)**.
3. Refactor with the test suite as the safety net **(refactor)**.
4. All tests pass before a PR is opened — enforced by the CI gate.

---

## 14. Observability

### 14.1 PostHog

- Integrated in `@slap/analytics` — initialised once, exported as `posthog` singleton.
- Next.js: all PostHog requests routed through `/ingest/*` rewrites in `next.config.ts` — bypasses ad blockers, avoids third-party cookies.
- Expo: PostHog React Native SDK — identifies user on auth, tracks screen views automatically via Expo Router integration.
- Backend: server-side event capture for payment webhooks, job completions, and critical error paths.

### 14.2 Sentry

- Next.js SDK — automatic route performance instrumentation + source maps uploaded in CI build step.
- Hono middleware — captures unhandled exceptions with full request context (method, path, user ID, reqId).
- Expo: Sentry Expo plugin — native crash reporting on both iOS and Android.
- Routed through `/monitoring/*` rewrite (same pattern as PostHog) to avoid ad blockers.

### 14.3 Cloudflare Native

- **Workers Analytics Engine** — custom metrics (request latency histograms, queue depths, auth events) at zero additional cost.
- **Logpush → R2** — all Worker request logs archived; queryable via Cloudflare D1 SQL API for incident investigation.
- **Cloudflare Notifications** — alerting on error rate spikes, D1 query timeout increases, Worker CPU limit approaches.

---

## 15. Design System

### 15.1 Token Architecture

- Design tokens generated at tweakcn.com (baseui preset) → exported as CSS custom properties in `packages/ui/src/tokens.css`.
- Tailwind v4 config references these tokens directly — no hardcoded colour values in component code anywhere.
- Dark mode: class-based (`html.dark`) — toggled by a Zustand theme store, persisted in `localStorage` on web and in Expo SecureStore on mobile.
- NativeWind v4 reads the same token names as web — single colour/spacing/radius source of truth across platforms.

### 15.2 Component Hierarchy

1. **Primitive** — shadcn/ui base components (Button, Input, Dialog, Card, etc.) — copied into `packages/ui` and owned by the repo, not installed as a dependency.
2. **Block** — mvpblocks page sections (Hero, Pricing, Feature Grid, Testimonials) — composed from primitives, live in `packages/ui/src/blocks/`.
3. **Feature** — app-specific compositions (AuthForm, CheckoutCard, UserAvatar) — live in `apps/web/src/components/`.

When a block is needed and not available in mvpblocks, search the shadcn community blocks gallery at `ui.shadcn.com/blocks` before building from scratch. Always add the source URL as a comment in the component file header.

### 15.3 Tiptap (Rich Text)

- Headless Tiptap v3 — zero bundled CSS, styled entirely with Tailwind classes.
- Extensions: StarterKit, Image (upload to R2, returns signed URL), Link, CodeBlock (highlight.js), Mention, Placeholder, CharacterCount.
- Content persisted as ProseMirror JSON in D1; serialised to HTML only at render time (no HTML in the database).
- Mobile: Tiptap React Native (experimental) — WebView editor as fallback for complex editing scenarios.

---

## 16. Payments — Polar.sh

- Polar.sh manages subscriptions, one-time purchases, and licence keys.
- Webhook handler in `apps/api` validates Polar signature → enqueues event to CF Queue → Queue consumer writes to D1. The webhook HTTP response returns immediately; DB writes are async and retried on failure.
- Frontend: `@polar-sh/nextjs` client for checkout redirect and customer portal.
- Mobile: Polar checkout opens via `expo-web-browser` (in-app browser) — complies with App Store rules on in-app purchase flows.
- Subscription status propagated through Better-Auth user metadata — used to gate features in both web and mobile.

---

## 17. Email — @slap/email

- React Email v4 — templates are React components in `packages/email/src/templates/`.
- Shared design tokens with web — same typeface, colour palette, and logo.
- Template set: Welcome, Magic Link, Password Reset, Payment Confirmation, Invoice, Admin Alert.
- Resend as transport — `RESEND_API_KEY` set as Wrangler secret.
- Send flow: API enqueues message to CF Queue → Queue consumer calls Resend API — decoupled from request path, retried automatically on failure.
- Preview: `pnpm --filter @slap/email dev` — React Email dev server at `localhost:3030` with hot reload.

---

## 18. Documentation System

### 18.1 Folder Overview

| Path | Purpose |
|---|---|
| `docs/project/` | Human-authored (or AI-assisted via explicit command). Contains: `ARCHITECTURE.md`, `STACK.md`, `MVP.md`, `FEATURES.md`, `ADR/` (Architecture Decision Records), and `EXTERNAL-SETUP.md` (GUI configuration steps for Cloudflare, EAS, Renovate, Snyk). Updated when architecture changes. |
| `docs/tasks/` | AI-managed task lifecycle. One Markdown file per task. AI creates, reads, updates, and closes these. Human-readable audit trail of every significant change. |

There is no separate `docs/ai/` folder. AI context is delivered where the AI agent actually operates — through MCP servers and editor skill files — not through a documentation folder it has to remember to read. The two mechanisms are:

- **MCP servers** — structured, queryable context: task state, project graph, schema introspection. The agent calls tools, not reads files.
- **Editor skills & rules** — `.cursorrules`, `.windsurfrules`, `AGENT.md` at the repo root define coding standards, role behaviours, and stack-specific rules. These are loaded automatically by the editor on every session.

### 18.2 AI Context Delivery

**Editor rules (repo root):**

```
.cursorrules       # Cursor — loaded automatically on every session
.windsurfrules     # Windsurf — equivalent
AGENT.md           # Generic briefing for any AI agent (Claude, GPT, etc.)
```

These files contain what was previously in `docs/ai/roles/` and `docs/ai/skills/` — coding conventions, component hierarchy rules, stack-specific patterns, security checklist. They live at the root so every editor picks them up without configuration.

**MCP servers (configured in editor MCP settings):**

```
task-server    # Reads/writes docs/tasks/ — agent queries open tasks, claims work,
               # updates status, notes blockers. See section 20 for full spec.
db-server      # Drizzle schema introspection — agent can query table structure
               # without reading source files
cf-server      # Cloudflare Workers MCP (official) — binding info, D1 schema,
               # KV namespaces available to the agent
```

**Stack skill files (loaded via editor skill system):**

```
skills/hono.md         # Hono patterns, middleware order, error handling
skills/drizzle.md      # Schema conventions, query patterns, migration rules
skills/nextjs.md       # App Router, RSC vs client, Server Actions rules
skills/betterauth.md   # Auth setup, session access, role guard patterns
skills/tiptap.md       # Editor setup, extension rules, JSON persistence
skills/expo.md         # Router, EAS, native module rules, SecureStore
```

Skill files live in a `skills/` directory at the repo root and are loaded by the editor's skill system (Cursor skills, Windsurf skills, etc.) per session or per task.

### 18.3 Task Document Schema

Tasks are the communication protocol between the human and the AI agent. The human describes what is needed; the AI creates the task file(s), plans the work, implements in steps, and keeps the document updated throughout. A task does not have to be completed in one pass — the agent notes remaining work and picks up where it left off.

```markdown
# TASK-042: Add email delivery retry via CF Queue

## Status: in-progress
## Created: 2026-03-15   ## Completed: —
## Related: TASK-039 (Queue bindings setup), TASK-041 (Resend integration)

## Goal
Decouple email sends from the HTTP request path. Failed sends must
retry automatically without manual intervention.

## Plan
1. Add CF Queue binding to apps/api/wrangler.toml
2. Replace direct Resend call with queue.send() in email route
3. Add queue consumer in apps/api/src/consumers/email.ts
4. Add integration test for retry behaviour

## Implementation
- apps/api/wrangler.toml — queue binding added ✅
- apps/api/src/routes/email.ts — enqueue instead of direct send ✅
- apps/api/src/consumers/email.ts — created ✅

## Tests
- apps/api/src/consumers/email.test.ts — 4 cases added ✅

## Remaining
- [ ] Dead-letter queue handling (low priority, can be TASK-045)
- [ ] Alert on DLQ threshold (depends on observability work in TASK-044)

## Changelog
- 2026-03-15  Created by AI from human description
- 2026-03-16  Implementation complete; DLQ work split to future task
```

**Key properties of the task format:**

- `Related` links tasks that depend on or inform each other — the agent uses this to avoid conflicts and understand context.
- `Remaining` is a first-class section — partial completion is expected and documented, not a failure state.
- The agent updates the file as it works; the human can read the current state at any time.
- Tasks live in `docs/tasks/open/` while active and move to `docs/tasks/done/` when closed.

### 18.4 Task-Driven Agent Workflow

The workflow is conversation-first. The human describes what is needed in natural language; the AI takes it from there.

1. **Human describes** the feature, bug, or task in the editor chat (no specific format required).
2. **AI creates task file(s)** in `docs/tasks/open/` — may create multiple related tasks if the work is large enough to split. Each gets an auto-incremented `TASK-NNN` ID derived from existing files.
3. **AI reads context** — queries the task MCP server for related open tasks, reads relevant skill files, checks existing schema via the db MCP server.
4. **AI implements** in steps, updating the task's `Implementation` section as each piece lands.
5. **AI notes blockers or remaining work** in the `Remaining` section rather than leaving work half-done and undocumented.
6. **Human reviews** the diff and the task file together — the task doc is the PR description.
7. **AI (or human) closes** the task — sets `Status: done`, moves to `docs/tasks/done/`.

> **Note:** There is no CLI command for task management yet — the `slap` CLI is planned post-v1. Until then, task files are created and managed directly by the AI agent in the file system. The Task MCP server (see section 20) provides the structured API layer on top of these files.

---

## 19. The slap CLI — Post-v1

The `slap` CLI is planned after the core template (v1) is stable and proven in production. It is not a prerequisite for using the template — everything the CLI automates can be done manually during v1.

### 19.1 Planned: npx slap init

Will bootstrap a fully configured app from the SLAP template in a single command.

| Step | Action |
|---|---|
| 1. Prompts | App name, slug, Cloudflare account ID, D1 database name, R2 bucket, Resend key, PostHog key, Sentry DSN, Polar org slug |
| 2. Clone | Clones SLAP template repository into the target directory |
| 3. Token replace | Substitutes all placeholder values in `wrangler.toml` files, `next.config.ts`, and `.env.example` |
| 4. Install | Runs `pnpm install` — connects Turbo remote cache automatically |
| 5. DB setup | Runs `db:migrate` on local D1 — creates tables and applies seed data |
| 6. GitHub | Creates GitHub repository and pushes initial commit (if GitHub token is provided) |
| 7. Checklist | Prints post-init checklist pointing to `docs/project/EXTERNAL-SETUP.md` |

### 19.2 Planned: Additional Commands

| Command | Description |
|---|---|
| `slap add feature <n>` | Scaffolds: API route file, Zod schema, Drizzle table file, Vitest integration test, task doc |
| `slap add page <n>` | Scaffolds: Next.js page + `loading.tsx` + `error.tsx` + Playwright test file |
| `slap add email <n>` | Scaffolds: React Email template + preview entry + send helper in `@slap/email` |
| `slap task new <title>` | Creates `docs/tasks/open/TASK-NNN.md` with auto-incremented ID |
| `slap task done <id>` | Marks task done, sets completed date, moves file to `docs/tasks/done/` |
| `slap check` | Runs full CI locally: fix + test + build — same sequence as `ci.yml` |
| `slap deploy <env>` | Deploys all apps to preview or production via wrangler |
| `slap db migrate` | Runs latest migration against local or production D1 (`--env prod` flag) |

**Until the CLI exists:** run `pnpm install`, create `.env` from `.env.example`, and run `pnpm --filter @slap/db db:migrate` manually. Task files are created directly by the AI agent. All other workflows operate the same way.

---

## 20. Beyond v1 — Planned Extensions

| Item | Description |
|---|---|
| Apple OAuth | Better-Auth Apple plugin — second OAuth provider after Google |
| MFA / TOTP | Better-Auth MFA plugin — TOTP authenticator app support |
| Passkeys | Better-Auth WebAuthn plugin — passwordless with hardware keys |
| Organisations | Better-Auth organisations plugin — multi-tenant with member roles |
| i18n | next-intl fully activated — locale routing and message files per language |
| slap CLI | `npx slap init` and scaffolding commands — see section 19 |
| Task MCP server | See expanded spec below |
| slap-orchestrate | Multi-agent task runner — reads skill files and open tasks to implement features autonomously end-to-end |
| slap-deploy | Automated App Store / Play Store pipeline — metadata, screenshots, versioning, EAS Submit from CLI |
| slap-ads | Meta Ads management — campaign creation, A/B tracking, connected to PostHog cohorts |
| slap-analytics | Cross-app AI analytics — revenue attribution, churn prediction, growth metrics dashboard |
| slap-factory | The full app factory — idea → deployed app in one command; combines all slap-* tools |

### 20.1 Task MCP Server — Expanded Spec

The Task MCP server turns the file-based `docs/tasks/` system into a structured, queryable API for AI agents and human dashboards. It is designed to be the connective tissue between the agent's work and the human's visibility.

**What it does:**

- Agents connect via the MCP protocol and call tools: `list_tasks`, `get_task`, `create_task`, `update_task`, `close_task`, `link_tasks`, `search_tasks`.
- Every mutation is written back to the `docs/tasks/` markdown files — the files remain the source of truth and are always human-readable without the server.
- Agents can query related tasks by ID, status, or tag before starting work — prevents duplicate effort and conflict.

**Self-hosted deployment:**

```yaml
# docker-compose.yml (included in the task-server repo)
services:
  task-server:
    image: ghcr.io/slap/task-server:latest
    ports:
      - "3100:3100"
    volumes:
      - ./docs/tasks:/data/tasks   # mounts your repo's task folder
    environment:
      - API_KEY=${TASK_SERVER_API_KEY}
      - DB_PATH=/data/tasks.db     # SQLite index alongside the MD files
```

Run it locally alongside the dev stack or deploy it on any VPS. The MCP client config in `.cursorrules` / `.windsurfrules` points to `http://localhost:3100`.

**Managed plan (SaaS):**

A hosted version is planned at `tasks.slap.dev` that connects directly to a GitHub repo via OAuth. Features beyond the self-hosted version:

- **Dashboard** — visual project board (Kanban), task timeline, agent activity log, and per-project status at a glance.
- **API keys** — generate per-project keys; agents authenticate with `Bearer <key>`. Revoke anytime.
- **Logs** — every agent tool call is logged with timestamp, agent identity, and the diff produced. Full audit trail without reading git history.
- **Multi-project** — one account, many repos. Cross-project task linking for work that spans apps.
- **Webhooks** — notify Slack, Discord, or a custom endpoint when a task changes status.

---

## 21. Alternative Structure — Self-hosted (Beyond v1)

The self-hosted path exists as a documented escape hatch for apps with requirements that Cloudflare Workers cannot meet: unrestricted compute time, native filesystem access, GPU workloads, or specific compliance jurisdictions. It is **not planned for v1**.

### 21.1 Stack Differences

| Concern | Self-hosted Choice |
|---|---|
| Runtime | Bun — replaces Wrangler; all scripts, API server, and test runner run on Bun natively |
| API | Elysia (Bun-native) — replaces Hono; same API design philosophy, optimised for Bun's runtime |
| Database | PostgreSQL via `bun:pg` — replaces D1; full SQL feature set, no SQLite constraints |
| Cache | Redis via ioredis — replaces KV and Durable Objects |
| File storage | Local filesystem or MinIO — replaces R2 |
| Deployment | Docker containers — one container per app, managed via Compose or a PaaS |

### 21.2 PaaS Options (Self-hosted)

- **Coolify** — open-source Heroku-like PaaS. Deploy on a Hetzner CX22 (~€4/mo). Provides automatic Docker build, reverse proxy, SSL, and a UI for managing multiple apps. Best choice for solo developers who want managed deployment without Kubernetes complexity.
- **Dokploy** — alternative to Coolify, Docker Swarm-based. Better for multi-server setups where you need basic horizontal scaling without full Kubernetes overhead. Good second option if Coolify's feature set feels limiting.
- A Hetzner CX22 baseline (~€4/mo) can comfortably serve 5–10 small apps behind Caddy or Traefik. Scale vertically to CX32/CX42 before reaching for Kubernetes.

> **Kubernetes and Kong are explicitly out of scope for this template.** The operational overhead contradicts the 1–2 apps per day production goal. K8s is only justified when you need multi-region pod scheduling or stateful workloads that neither Cloudflare nor a Coolify-managed server can serve.

---

*SLAP v2.0 Architecture & Planning · March 2026 · Stop AI Slop. Build What Works.*
