## Why

The CLI package was bootstrapped with oclif as a placeholder, but oclif's conventions (auto-loading, plugin architecture, heavy abstraction) are misaligned with the project's actual needs. Replacing it with commander gives explicit, lightweight routing; ink provides a proper React-based terminal UI layer; and tsup replaces the raw tsc build with a faster, zero-config bundler — establishing a foundation the project can actually build on.

## What Changes

- **BREAKING** Remove `@oclif/core`, `@oclif/test`, `ts-node`, and all oclif config (`oclif` key in `package.json`)
- **BREAKING** Delete the entire `cli/bin/` folder (all oclif-generated bootstrap files)
- **BREAKING** Delete the existing dummy oclif command (`src/commands/example.ts` and its test) — no migration
- Replace `tsc -b` build with `tsup` (bundles ESM output, handles TypeScript)
- Add `commander` as the CLI entry point and command router
- Add `omelette` for shell tab-completion registration
- Add `ink`, `ink-select-input`, `ink-text-input`, and `react` as the terminal UI framework
- Restructure `cli/src/` into three layers: `commands/`, `ui/`, and `core/`; entry point becomes `src/main.ts`, compiled to `dist/main.js` (referenced by `bin` in `package.json`)
- Create a single `echo` command with commander as the baseline working implementation
- Remove `.claude/commands/oclif/` slash command (no longer relevant)
- Update `CLAUDE.md` and any other docs to reflect the new stack and directory layout
- Audit and update GitHub Actions workflows and CI config as needed

## Capabilities

### New Capabilities

- `cli-build-toolchain`: tsup replaces tsc as the build tool; covers `tsup.config.ts`, updated build scripts, and TypeScript config alignment
- `cli-command-routing`: commander wires up the CLI entry point and command dispatch; covers `src/main.ts`, `src/commands/`, and the `echo` command
- `cli-autocomplete`: omelette integration for shell tab-completion; covers setup, registration, and the completion hook in the entry point
- `cli-ui-framework`: ink + react as the terminal UI layer; covers the `src/ui/` directory structure and conventions
- `cli-directory-structure`: the three-layer `src/` layout (`commands/`, `ui/`, `core/`) and what belongs in each

### Modified Capabilities

*(none — no existing specs exist)*

## Impact

- **`cli/package.json`**: full dependency swap to match the target manifest; `bin` field updated to `dist/main.js`; `oclif` config block removed
- **`cli/bin/`**: entire folder deleted
- **`cli/src/`**: all existing source deleted and replaced with the new three-layer structure
- **`cli/tsconfig.json`**: simplified or replaced by tsup config
- **`.claude/commands/oclif/`**: directory removed
- **`CLAUDE.md`**: build commands, dev workflow, and architecture section updated
- **`.github/workflows/ci.yml`** and related: build step updated, coverage thresholds re-baselined if needed
- **Root `vitest.config.ts`**: no structural change expected; cli project registration stays
