# Capability: cli-build-toolchain

## Purpose

Build toolchain conventions for TypeScript workspace packages in the monorepo. tsup is the mandated bundler; tsc is restricted to type-checking only.

## Requirements

### Requirement: tsup is the monorepo-wide build tool for TypeScript packages
Every TypeScript workspace package in the monorepo SHALL use tsup as its sole compilation and bundling tool. The raw `tsc` compiler SHALL NOT be used for producing build output in any TypeScript package. Non-TypeScript packages (e.g. `scripts/`, which is plain CJS and runs before `node_modules` exists) are explicitly exempt.

#### Scenario: Root build runs without naming any package
- **WHEN** `pnpm build` is run from the monorepo root
- **THEN** it runs `pnpm -r run build`, which discovers and builds every workspace package that declares a `build` script — no package names are hard-coded in the root command

#### Scenario: New TypeScript package is built without changing root config
- **WHEN** a new TypeScript workspace package is added with a `build` script that runs `tsup`
- **THEN** `pnpm build` from the root automatically includes it with no changes to the root `package.json` or any other shared config

### Requirement: Each TypeScript package owns its tsup config
Every TypeScript workspace package SHALL contain a `tsup.config.ts` that defines its build: entry point(s), output format, target, and any package-specific options (e.g. shebang injection for CLI packages, JSX transform for packages using React). There SHALL be no shared root-level tsup config.

#### Scenario: Package builds independently
- **WHEN** `pnpm build` is run inside a TypeScript workspace package
- **THEN** tsup reads that package's own `tsup.config.ts` and produces output in its local `dist/`

### Requirement: cli package tsup config
`cli/tsup.config.ts` SHALL configure: `entry` as `src/main.ts`, `format` as `esm`, Node target, JSX transform set to `automatic` (react-jsx), and a shebang banner (`#!/usr/bin/env node`) injected into `dist/main.js`.

#### Scenario: Output file has shebang
- **WHEN** `dist/main.js` is produced by the build
- **THEN** its first line is `#!/usr/bin/env node`

#### Scenario: Output is ESM
- **WHEN** `dist/main.js` is inspected
- **THEN** it uses ESM syntax (`import`/`export`), not CommonJS (`require`)

### Requirement: tsconfig.json is type-checking only
Each TypeScript workspace package SHALL keep a `tsconfig.json` for editor support and `tsc --noEmit` type-checking only. It SHALL NOT include build-output options (`composite`, `outDir`, `rootDir`, `declarationMap`, `declaration`, `importHelpers`). TypeScript packages using React/ink SHALL include `"jsx": "react-jsx"`.

#### Scenario: Type check passes without build output
- **WHEN** `tsc --noEmit` is run inside a TypeScript workspace package
- **THEN** it exits 0 and produces no files in `dist/`

#### Scenario: No tsc build artifacts
- **WHEN** `pnpm build` completes in any TypeScript workspace package
- **THEN** no `tsconfig.tsbuildinfo` project-reference file is produced (composite mode is off)

### Requirement: Clean script removes dist
Every TypeScript workspace package SHALL have a `clean` script that removes its `dist/` directory. Its `build` script SHALL invoke `clean` before running tsup.

#### Scenario: Fresh build after clean
- **WHEN** `pnpm build` is run after a previous build in a TypeScript package
- **THEN** stale files in `dist/` from the prior build are absent in the new output
