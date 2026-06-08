# Contributing

## Setup

Requires Node 24 (pinned in `.nvmrc`) and pnpm (pinned via the `packageManager` field in `package.json` — [Corepack](https://nodejs.org/api/corepack.html) provisions it on demand). For a fresh machine:

```sh
node scripts/setup-node.js   # installs/uses fnm + Node 24, sets up auto-switch
node scripts/setup-pnpm.js   # one-time `corepack enable` so pnpm maps to the pinned version here
pnpm install
```

You don't need a global pnpm install — inside this project, Corepack reads the `packageManager` field and runs the pinned pnpm automatically. Outside the project, whatever global default you had still applies.

[GitHub CLI](https://cli.github.com) (`gh`) is optional but recommended. The pre-push hook uses it to detect whether your PR is a draft and skip coverage enforcement while you're still working. To install:

```sh
node scripts/setup-gh.js
gh auth login
```

## Tests

```sh
pnpm test                            # run all tests (all workspaces)
pnpm test:coverage                   # run all tests with coverage thresholds
pnpm test:ui                         # open Vitest browser UI (all workspaces)
pnpm --filter @flume/cli test        # run CLI tests only
pnpm --filter @flume/scripts test    # run scripts tests only
```

The test framework is **vitest** across the entire repo. Each workspace owns a `vitest.config.ts` / `vitest.config.mjs` scoped to its own files. The root `vitest.config.ts` discovers `test.projects` by globbing each package's vitest config automatically.

Coverage thresholds, includes, and excludes are all defined in `coverage.config.json` and apply to the aggregate across all projects. CI enforces these on non-draft PRs. Locally, the pre-push hook enforces them when `gh` is installed and the PR is marked ready for review — otherwise it warns if coverage drops but doesn't block the push.

### Adding a new package

1. Add `vitest` to the package's `devDependencies` and create a `vitest.config.ts` scoped to its own files.
2. Add the package directory to `packages` in `pnpm-workspace.yaml`. With its own vitest config from step 1, the root config globs it in as a project automatically.
3. Follow the convention `<package>/src/**/*.ts` for source files and `**/*.test.{js,ts}` for tests — both are already covered by the root `coverage.config.json` globs, so no edits are needed. Only add to `exclude` if the package contains source files that should not be measured (e.g. one-off setup scripts).
4. If the package is buildable, add a `build` script to its `package.json` — `pnpm build` at the root iterates all workspaces and skips the ones without a `build` script.

## Conventions

- No npm dependencies in `scripts/` — Node built-ins only
- Use **vitest** as the test framework — do not introduce Jest or other runners
- In test files: imports → tests → helpers/mocks at the bottom

## Submitting

Open an issue before starting non-trivial work. One thing per PR.
