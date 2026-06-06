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
yarn test           # run tests
yarn test:coverage  # run tests with coverage thresholds
```

Coverage thresholds are defined in `coverage.config.json` (lines 95%, branches 90%, functions 80%). CI enforces these on non-draft PRs. Locally, the pre-push hook enforces them when `gh` is installed and the PR is marked ready for review — otherwise it warns if coverage drops but doesn't block the push.

## Conventions

- No npm dependencies in `scripts/` — Node built-ins only
- In test files: imports → tests → helpers/mocks at the bottom

## Submitting

Open an issue before starting non-trivial work. One thing per PR.
