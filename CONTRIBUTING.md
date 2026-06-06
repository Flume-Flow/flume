# Contributing

## Setup

Requires Node 24 (pinned in `.nvmrc`). If you don't have auto-switching via nvm/fnm:

```sh
node scripts/setup-node.js  # one-time setup
yarn install
```

## Tests

```sh
yarn test
```

## Conventions

- No npm dependencies in `scripts/` — Node built-ins only
- In test files: imports → tests → helpers/mocks at the bottom

## Submitting

Open an issue before starting non-trivial work. One thing per PR.
