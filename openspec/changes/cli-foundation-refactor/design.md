## Context

The `@flume/cli` package was scaffolded with oclif, which imposes a convention-heavy framework (auto-discovery, plugin system, `bin/` bootstrap shims, `oclif` config block in `package.json`). None of these conventions are used or needed. The package currently contains one dummy command and no real functionality. This is the ideal moment — before real code accumulates — to swap the entire foundation cleanly.

The new stack: **commander** for command routing, **ink + react** for terminal UI, **omelette** for shell autocomplete, and **tsup** for building.

## Goals / Non-Goals

**Goals:**
- Remove all oclif artifacts (deps, config, `bin/`, source files, `.claude` command)
- Establish a three-layer `src/` structure that separates command wiring, UI, and core logic
- Build with tsup (esbuild-backed, handles JSX for ink, fast)
- Have one working command (`echo`) as proof the new foundation runs
- Shell autocomplete via omelette registered at startup
- Keep CI and tooling working with the new build setup

**Non-Goals:**
- Migrating any existing oclif command behavior
- Implementing any real flume features
- Changing anything outside `cli/` except docs, `.claude/commands/oclif/`, and CI adjustments

## Decisions

### 1. tsup as the build tool

**Decision**: Replace `tsc -b` with `tsup`.

tsup uses esbuild internally (fast) and natively handles JSX compilation needed for ink without extra babel config. It also injects the `#!/usr/bin/env node` shebang in the output via its `banner` option, eliminating the need for a `bin/run.js` wrapper.

tsconfig.json is kept but simplified to type-checking only (no `composite`, no `outDir` — tsup owns the output). tsup.config.ts specifies: single entry (`src/main.ts`), ESM format, Node target, react-jsx transform.

**Alternative considered**: Keep tsc + add `@babel/preset-react`. Rejected — two compilation tools for one output is unnecessary complexity.

### 2. commander as the command router

**Decision**: Use commander with explicit command registration.

Each command file exports a `register(program: Command): void` function. `src/main.ts` imports and calls them. This is explicit, testable, and has no magic auto-discovery.

```
src/main.ts          ← creates Program, registers commands, calls program.parse()
src/commands/echo.ts ← exports register(program)
```

**Alternative considered**: yargs. Rejected — commander's API is simpler for this use case and has better TypeScript types out of the box.

### 3. Directory structure

**Decision**: Three layers under `src/`:

```
src/
  main.ts          ← entry point: program setup + omelette init
  commands/        ← commander command definitions (one file per command)
  ui/              ← ink React components (pure UI, no business logic)
  core/            ← shared logic, utilities, data access
```

Commands import from `ui/` and `core/`; `ui/` and `core/` never import from `commands/`. This boundary keeps UI components reusable and core logic independently testable.

### 4. Omelette integration

**Decision**: Initialize omelette in `src/main.ts` before `program.parse()`.

Omelette follows a tree-based API where you declare completions for each command/subcommand. It hooks into shell completion via `complete()` call and a one-time `install()` (run manually by the user or via a `flume completion install` command in future). For now, the echo command is registered in the completion tree.

**Alternative considered**: commander's built-in `createCommand().addHelpText()` is not completion — omelette is the right tool.

### 5. ink as UI framework

**Decision**: ink + react for all terminal UI. `src/ui/` contains React components rendered with ink's `render()`.

Commands that need interactive UI call `render(<Component />)` from their handler. Non-interactive commands (like `echo`) just use `console.log` or ink's `<Text>` with a one-shot render.

tsup is configured with `esbuildOptions: { jsx: 'automatic' }` (react-jsx transform) so no explicit `import React from 'react'` is needed in components.

### 6. Entry point and `bin` field

**Decision**: `src/main.ts` compiles to `dist/main.js`. `package.json` sets:
```json
"bin": { "flume": "dist/main.js" }
```

tsup injects `#!/usr/bin/env node` as a banner in the output file. No `bin/` folder.

### 7. TypeScript config split

**Decision**: tsconfig.json is kept for editor support and type-checking (`tsc --noEmit` in lint/CI), updated to add `"jsx": "react-jsx"` and remove build-specific options (`composite`, `declaration`, `declarationMap`, `outDir`, `rootDir`, `importHelpers`). tsup owns compilation.

## Risks / Trade-offs

- **ink ESM requirements** → ink v5 is ESM-only; the package is already `"type": "module"` so this is compatible. `tsup` with `format: ['esm']` aligns.
- **omelette completion requires user action** → Shell completion only works after `flume --completion` is run once. This is expected omelette behavior, not a bug.
- **Coverage baseline reset** → Deleting example.ts and its test will change coverage numbers. The CI coverage ratchet may need its baseline files reset after this change lands.
- **react peer dep** → ink v5 requires react 18. If a future workspace package also depends on react, version alignment is needed. Not an issue now.

## Migration Plan

1. Remove oclif: delete `cli/bin/`, update `cli/package.json` (deps, scripts, bin field, remove oclif block)
2. Update `cli/tsconfig.json` for type-checking only + JSX support
3. Add `cli/tsup.config.ts`
4. Create new `src/` structure with `main.ts`, `commands/echo.ts`, empty `ui/` and `core/` index files
5. Remove `.claude/commands/oclif/` directory
6. Update `CLAUDE.md` (build commands, architecture section)
7. Reset coverage baseline files if the ratchet workflow stores them
8. Verify: `pnpm build`, `pnpm test`, `pnpm lint` all pass

Rollback: git revert. No database or infra changes.

## Open Questions

*(none — scope is fully bounded)*
