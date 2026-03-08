# @slap/config

Shared TypeScript, lint, formatter, and test configs for the SLAP monorepo. Every app and package extends from here — no duplication, no drift.

## TypeScript

Four configs are available. Each extends `base.json` and only overrides what it needs.

| Config | Use for |
|---|---|
| `@slap/config/tsconfig/base` | Shared packages with no DOM or runtime-specific APIs |
| `@slap/config/tsconfig/nextjs` | `apps/web` — adds DOM libs, `jsx: preserve`, Next.js plugin |
| `@slap/config/tsconfig/expo` | `apps/mobile` — adds `jsx: react-native` |
| `@slap/config/tsconfig/worker` | `apps/api` — adds `@cloudflare/workers-types` |

```jsonc
// apps/web/tsconfig.json
{
  "extends": "@slap/config/tsconfig/nextjs",
  "compilerOptions": {
    "paths": { "@/*": ["./*"] }
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

> **Note:** `paths` aliases are intentionally omitted from the shared base — define them per-project since they are relative to each consuming `tsconfig.json`.
>
> Consumers of `tsconfig/worker` must install `@cloudflare/workers-types` as a dev dependency.

## Lint (Oxlint via Ultracite)

Three configs are available. Each is an `.oxlintrc.json`-compatible preset.

| Config | Use for |
|---|---|
| `@slap/config/ultracite/base` | Shared packages, `apps/api` |
| `@slap/config/ultracite/nextjs` | `apps/web` — adds Next.js rules |
| `@slap/config/ultracite/expo` | `apps/mobile` — React rules (RN preset pending, see [#29](https://github.com/Ouzx/slap/issues/29)) |

```jsonc
// apps/web/.oxlintrc.json
{
  "extends": ["@slap/config/ultracite/nextjs"]
}
```

```jsonc
// apps/api/.oxlintrc.json
{
  "extends": ["@slap/config/ultracite/base"]
}
```

## Formatter (oxfmt)

A single `.oxfmtrc.jsonc` lives at the repo root and applies to all packages. No per-package config needed.

## Tests (Vitest)

```ts
// packages/ui/vitest.config.ts
import { mergeConfig } from 'vitest/config';
import base from '@slap/config/vitest/base';

export default mergeConfig(base, {
  test: {
    environment: 'jsdom',          // override from default 'node'
    setupFiles: ['./src/test-setup.ts'],  // opt in per-package
  },
});
```

The base config sets:
- `globals: true`
- `environment: 'node'`
- `coverage: v8` with `text` + `lcov` reporters
- `include: ['src/**/*.test.ts', 'src/**/*.spec.ts']`
