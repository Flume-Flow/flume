# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
yarn install          # install dependencies (triggers Node version check)
yarn lint             # ESLint across the whole repo
yarn lint:fix         # ESLint with auto-fix
yarn test             # run scripts/ tests with Node built-in runner
yarn workspace flume-cli build   # compile flume-cli TypeScript
yarn workspace flume-cli dev     # run flume-cli in dev mode
```

Run a single test file:
```sh
node --test scripts/setup/unix.test.js
```

## Architecture

This is a Yarn workspaces monorepo. The root holds shared tooling; the CLI lives in `flume-cli/`.

**Root `scripts/`** — Node 24 CJS utility scripts, no npm dependencies allowed. Run directly by npm lifecycle hooks (`preinstall`) and manually by developers. `check-node.js` enforces the Node version on every `yarn install`. `setup-node.js` is a one-time developer setup that installs a version manager and configures shell auto-switching.

**`flume-cli/`** — an [oclif](https://oclif.io)-based CLI, TypeScript, compiled to `dist/`. Commands go in `src/commands/` (oclif convention). Currently a skeleton.

## Conventions

**`scripts/`**: CommonJS only, Node built-ins only, no new npm packages.

**Test files**: co-located with source (e.g. `unix.test.js` next to `unix.js`). File order: imports → `describe`/`it` blocks → test infrastructure (helpers, mocks, `afterEach`) at the bottom under a `// --- test infrastructure ---` comment. Tests use Node's built-in `node:test` runner and `node:assert` — no test framework needed.
