# Contributing

## Setup

Requires Node 24 (pinned in `.nvmrc`) and Yarn v4 (pinned via the `packageManager` field in `package.json` — [Corepack](https://nodejs.org/api/corepack.html) auto-provisions it; if `yarn` is missing, run `corepack enable` once). If you don't have auto-switching via nvm/fnm:

```sh
node scripts/setup-node.js
corepack enable        # one-time, enables Yarn v4 via the packageManager field
yarn install
```

[GitHub CLI](https://cli.github.com) (`gh`) is optional but recommended. The pre-push hook uses it to detect whether your PR is a draft and skip coverage enforcement while you're still working. To install:

```sh
node scripts/setup-gh.js
gh auth login
```

## Tests

```sh
yarn test                            # run all tests (all workspaces)
yarn test:coverage                   # run all tests with coverage thresholds
yarn test:ui                         # open Vitest browser UI (all workspaces)
yarn workspace @flume/cli test       # run CLI tests only
yarn workspace @flume/scripts test   # run scripts tests only
```

The test framework is **vitest** across the entire repo. Each workspace owns a `vitest.config.ts` / `vitest.config.mjs` scoped to its own files. The root `vitest.config.ts` derives `test.projects` from `workspaces` in `package.json` automatically.

Coverage thresholds, includes, and excludes are all defined in `coverage.config.json` and apply to the aggregate across all projects. CI enforces these on non-draft PRs. Locally, the pre-push hook enforces them when `gh` is installed and the PR is marked ready for review — otherwise it warns if coverage drops but doesn't block the push.

### Adding a new package

1. Add `vitest` to the package's `devDependencies` and create a `vitest.config.ts` scoped to its own files.
2. Add the package directory to `workspaces` in root `package.json` — it is automatically picked up as a vitest project.
3. Add the package's source paths to `include` and test file globs to `exclude` in `coverage.config.json`.
4. If the package is buildable, add a `build` script to its `package.json` — `yarn build` at the root runs all of them.

## Conventions

- No npm dependencies in `scripts/` — Node built-ins only
- Use **vitest** as the test framework — do not introduce Jest or other runners
- In test files: imports → tests → helpers/mocks at the bottom

## Submitting

Open an issue before starting non-trivial work. One thing per PR.
