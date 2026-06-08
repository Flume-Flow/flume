# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
pnpm install          # install dependencies (triggers Node version check)
pnpm lint             # ESLint across the whole repo
pnpm lint:fix         # ESLint with auto-fix
pnpm build            # compile all buildable workspaces
pnpm test             # run all tests (scripts/ + cli/) with vitest
pnpm test:coverage    # run all tests with coverage report
pnpm test:ui          # open Vitest browser UI (all projects)
pnpm --filter @flume/cli build      # compile flume-cli TypeScript only
pnpm --filter @flume/cli dev        # run flume-cli in dev mode
pnpm --filter @flume/cli test       # cli tests only
pnpm --filter @flume/cli test:ui    # open Vitest browser UI (cli only)
pnpm --filter @flume/scripts test   # scripts tests only
pnpm --filter @flume/scripts test:ui # open Vitest browser UI (scripts only)
```

Run tests for a single project or file:
```sh
npx vitest run --project cli                      # CLI tests only (from root)
npx vitest run --project scripts                  # scripts tests only
npx vitest run scripts/setup/unix-node.test.js   # single file
```

## Architecture

This is a pnpm workspaces monorepo (pnpm version pinned via the `packageManager` field in root `package.json`; Corepack auto-provisions it). Workspace packages are listed in `pnpm-workspace.yaml`. The root holds shared tooling; the CLI lives in `cli/`.

**Root `scripts/`** — Node 24 CJS utility scripts, no npm dependencies allowed. Run directly by npm lifecycle hooks (`preinstall`) and manually by developers. `check-node.js` enforces the Node version on every `pnpm install`. `setup-node.js` is a one-time developer setup that installs a version manager and configures shell auto-switching. `setup-pnpm.js` is a one-time `corepack enable` helper so the pinned pnpm resolves inside the project. `setup-gh.js` is a one-time GitHub CLI installer used by the pre-push hook.

**`cli/`** — an [oclif](https://oclif.io)-based CLI, TypeScript, compiled to `dist/`. Commands go in `src/commands/` (oclif convention).

## Conventions

**`scripts/`**: The scripts themselves are CommonJS only, Node built-ins only, no npm dependencies — they run in `preinstall` hooks before `node_modules` exists. Test files are dev-only and use vitest.

**Test files**: co-located with source (e.g. `unix-node.test.js` next to `unix-node.js`). File order: imports → `describe`/`it` blocks → test infrastructure (helpers, mocks, `afterEach`) at the bottom under a `// --- test infrastructure ---` comment.

**Test framework**: vitest across the whole repo, using workspace mode.
- `vitest.config.ts` — root config that registers all workspace packages as projects (`test.projects`) and holds global coverage settings and thresholds.
- Each workspace package owns its own `vitest.config.ts` / `vitest.config.mjs` scoped to its own files.
- `scripts/*.test.js` — CJS files using vitest globals (`describe`, `it`, `expect`, `vi` — no imports needed, `globals: true` is set in `scripts/vitest.config.mjs`).
- `cli/src/**/*.test.ts` — TypeScript files with explicit vitest imports.

When adding a new workspace package: create a `vitest.config.ts` inside it (scoped to that package's files) and add its directory name to `packages` in `pnpm-workspace.yaml` (projects are derived from there automatically). The root `coverage.config.json` already includes `*/src/**/*.ts` and `scripts/**/*.js` and excludes `**/*.test.{js,ts}`, so a conventional package layout needs no changes there — only add to `exclude` if the package has source files that should not be measured.

**Mocking in scripts tests**: use `vi.spyOn(obj, 'method').mockImplementation(fn)` and `vi.restoreAllMocks()` in `afterEach`.

**CLI command tests**: oclif's `this.log()` routes through `console.log` — spy on `console.log`, not `process.stdout.write`. Always pass `import.meta.url` as the second arg to `Command.run()` so oclif loads the correct `package.json`.
