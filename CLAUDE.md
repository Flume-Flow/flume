# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
yarn install          # install dependencies (triggers Node version check)
yarn lint             # ESLint across the whole repo
yarn lint:fix         # ESLint with auto-fix
yarn build            # compile all buildable workspaces
yarn test             # run all tests (scripts/ + cli/) with vitest
yarn test:coverage    # run all tests with coverage report
yarn workspace @flume/cli build   # compile flume-cli TypeScript only
yarn workspace @flume/cli dev     # run flume-cli in dev mode
```

Run tests for a single project or file:
```sh
npx vitest run --project cli                      # CLI tests only
npx vitest run --project scripts                  # scripts tests only
npx vitest run scripts/setup/unix-node.test.js   # single file
```

## Architecture

This is a Yarn workspaces monorepo. The root holds shared tooling; the CLI lives in `cli/`.

**Root `scripts/`** — Node 24 CJS utility scripts, no npm dependencies allowed. Run directly by npm lifecycle hooks (`preinstall`) and manually by developers. `check-node.js` enforces the Node version on every `yarn install`. `setup-node.js` is a one-time developer setup that installs a version manager and configures shell auto-switching.

**`cli/`** — an [oclif](https://oclif.io)-based CLI, TypeScript, compiled to `dist/`. Commands go in `src/commands/` (oclif convention).

## Conventions

**`scripts/`**: The scripts themselves are CommonJS only, Node built-ins only, no npm dependencies — they run in `preinstall` hooks before `node_modules` exists. Test files are dev-only and use vitest.

**Test files**: co-located with source (e.g. `unix-node.test.js` next to `unix-node.js`). File order: imports → `describe`/`it` blocks → test infrastructure (helpers, mocks, `afterEach`) at the bottom under a `// --- test infrastructure ---` comment.

**Test framework**: vitest across the whole repo, using workspace mode.
- `vitest.config.ts` — the single file that registers all test projects (`test.projects`) and holds coverage settings and thresholds. Add new packages here.
- `scripts/*.test.js` — CJS files using vitest globals (`describe`, `it`, `expect`, `vi` — no imports needed, `globals: true` is set in `vitest.workspace.ts` for the `scripts` project).
- `cli/src/**/*.test.ts` — TypeScript files with explicit vitest imports.

When adding a new workspace package: add vitest to its devDeps, create its test files, and register it in `vitest.workspace.ts` with its include pattern. Also add its source paths to the `coverage.include` list in `vitest.config.ts`.

**Mocking in scripts tests**: use `vi.spyOn(obj, 'method').mockImplementation(fn)` and `vi.restoreAllMocks()` in `afterEach`.

**CLI command tests**: oclif's `this.log()` routes through `console.log` — spy on `console.log`, not `process.stdout.write`. Always pass `import.meta.url` as the second arg to `Command.run()` so oclif loads the correct `package.json`.
