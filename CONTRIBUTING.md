# Contributing

## Setup

Requires Node 24 (pinned in `.nvmrc`). If you don't have auto-switching via nvm/fnm:

```sh
node scripts/setup-node.js
yarn install
```

[GitHub CLI](https://cli.github.com) (`gh`) is optional but recommended. The pre-push hook uses it to detect whether your PR is a draft and skip coverage enforcement while you're still working. To install:

```sh
node scripts/setup-gh.js
gh auth login
```

## Tests

```sh
yarn test                          # run all tests (scripts/ + all workspaces)
yarn test:coverage                 # run all tests with coverage thresholds
yarn workspace @flume/cli test     # run CLI tests only
```

The test framework is **vitest** across the entire repo. `vitest.config.ts` registers all test projects (via `test.projects`) and holds coverage settings.

Coverage thresholds are defined in `coverage.config.json` and apply to the aggregate across all projects. CI enforces these on non-draft PRs. Locally, the pre-push hook enforces them when `gh` is installed and the PR is marked ready for review — otherwise it warns if coverage drops but doesn't block the push.

### Adding a new package

1. Add `vitest` to the package's `devDependencies`.
2. Add a new entry to `test.projects` in `vitest.config.ts` with the package's `include` pattern and a unique `name`.
3. Add the package's source paths to `coverage.include` in `vitest.config.ts`.
4. If the package is buildable, add a `build` script to its `package.json` — `yarn build` at the root runs all of them.

## Conventions

- No npm dependencies in `scripts/` — Node built-ins only
- Use **vitest** as the test framework — do not introduce Jest or other runners
- In test files: imports → tests → helpers/mocks at the bottom

## Submitting

Open an issue before starting non-trivial work. One thing per PR.
