# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
pnpm install          # install dependencies (triggers Node version check)
pnpm lint             # Biome check across the whole repo
pnpm lint:fix         # Biome check with safe auto-fix
pnpm format           # Biome formatter, write changes
pnpm build            # compile all buildable workspaces
pnpm test             # run all tests (scripts/ + cli/) with vitest
pnpm test:coverage    # run all tests with coverage report
pnpm test:ui          # open Vitest browser UI (all projects)
pnpm --filter @flume/cli build      # bundle flume-cli with tsup
pnpm --filter @flume/cli dev        # watch mode (tsup --watch)
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

**`cli/`** — a [commander](https://github.com/tj/commander.js)-based CLI, TypeScript, bundled to `dist/main.js` by [tsup](https://tsup.egoist.dev). Terminal UI is built with [ink](https://github.com/vadimdemedes/ink) (React for CLIs). Shell tab-completion is provided by [omelette](https://github.com/f/omelette).

`cli/src/` has three layers — import direction is `commands/ → ui/ → core/`, never reversed:

- **`commands/`** — one file per CLI command; each exports `register(program: Command): void` that attaches the command to the commander program.
- **`ui/`** — ink React components (pure UI, no business logic, no imports from `commands/`).
- **`core/`** — shared utilities and logic (no imports from `commands/` or `ui/`).

The entry point is `src/main.ts` (compiled to `dist/main.js`). Every TypeScript workspace package uses tsup for builds; `pnpm build` from the root runs `pnpm -r run build` which auto-discovers all packages with a `build` script — no package names are hard-coded. Plain CJS `scripts/` is exempt (no compilation needed).

## Conventions

**`scripts/`**: The scripts themselves are CommonJS only, Node built-ins only, no npm dependencies — they run in `preinstall` hooks before `node_modules` exists. Test files are dev-only and use vitest.

**Test files**: co-located with source (e.g. `unix-node.test.js` next to `unix-node.js`). File order: imports → `describe`/`it` blocks → test infrastructure (helpers, mocks, `afterEach`) at the bottom under a `// --- test infrastructure ---` comment.

**Test framework**: vitest across the whole repo, using workspace mode.
- `vitest.config.ts` — root config that registers all workspace packages as projects (`test.projects`) and holds global coverage settings and thresholds.
- Each workspace package owns its own `vitest.config.ts` / `vitest.config.mjs` scoped to its own files.
- `scripts/*.test.js` — CJS files using vitest globals (`describe`, `it`, `expect`, `vi` — no imports needed, `globals: true` is set in `scripts/vitest.config.mjs`).
- `cli/src/**/*.test.ts` — TypeScript files with explicit vitest imports.

When adding a new workspace package: create a `vitest.config.ts` inside it (scoped to that package's files) and add its directory name to `packages` in `pnpm-workspace.yaml`. The root `vitest.config.ts` globs each package's vitest config, so a new package becomes a project automatically once it has one. The root `coverage.config.json` already includes `*/src/**/*.ts` and `scripts/**/*.js` and excludes `**/*.test.{js,ts}`, so a conventional package layout needs no changes there — only add to `exclude` if the package has source files that should not be measured.

**Mocking in scripts tests**: use `vi.spyOn(obj, 'method').mockImplementation(fn)` and `vi.restoreAllMocks()` in `afterEach`.

**CLI command tests**: commander output goes through `console.log` — spy on `console.log`, not `process.stdout.write`. Call `program.exitOverride()` before parsing in tests so commander throws instead of calling `process.exit`. Use `program.parseAsync` for async actions, `program.parse` for sync. No `import.meta.url` argument needed (that was an oclif convention).

**ink component tests**: use `render` from `ink-testing-library` and assert on `lastFrame()` output. Do not intercept `console.log` as a proxy for ink render output.

**Shell completion**: omelette completion requires a one-time manual install by the user — run `node dist/main.js --completion >> ~/.zshrc` (or `~/.bashrc`) once. Normal CLI invocations never modify shell config files.

## Issue & PR policy

Before running `gh pr create`, the PR body must include `Closes #N` or `Refs #N` (use `Refs` for drafts or partial work toward an issue). If neither, run `/work-on` first to resolve or create an issue.

**Exempt** (don't require a linked issue):
- Typo / formatting-only diffs.
- Docs-only diffs (CLAUDE.md, README, code comments).
- Semver-patch dep bumps (no API change).
- CI / tooling config (`.github/workflows`, `.editorconfig`, `.vscode`, etc.).

Branch naming for issue-driven work: `i-<N>-<slug>` (slug = first ~4 meaningful title words, kebab-cased).
