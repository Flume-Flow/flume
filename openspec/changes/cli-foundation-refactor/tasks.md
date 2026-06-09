## 1. Remove oclif artifacts

- [x] 1.1 Delete `cli/bin/` directory entirely
- [x] 1.2 Delete `cli/src/commands/example.ts` and `cli/src/commands/example.test.ts`
- [x] 1.3 Delete `.claude/commands/oclif/` directory
- [x] 1.4 Delete stale `cli/tsconfig.tsbuildinfo` if present
- [x] 1.5 Delete stale `cli/coverage/` directory if present

## 2. Update cli/package.json

- [x] 2.1 Remove `@oclif/core` and `@oclif/test` from `dependencies`/`devDependencies`; remove `ts-node` from `devDependencies`
- [x] 2.2 Remove the `oclif` config block from `package.json`
- [x] 2.3 Add runtime dependencies: `commander@^12.0.0`, `omelette@^0.4.14`, `ink@^5.0.0`, `ink-select-input@^6.0.0`, `ink-text-input@^6.0.0`, `react@^18.2.0`
- [x] 2.4 Add dev dependencies: `tsup@^8.0.0`, `@types/react@^18.2.0`, `ink-testing-library@^4.0.0`
- [x] 2.5 Update `bin` field to `{ "flume": "dist/main.js" }`
- [x] 2.6 Update `build` script to `pnpm run clean && tsup`; update `dev` script to `tsup --watch`; remove the `prepublishOnly`/`postpublish` oclif scripts
- [x] 2.7 Run `pnpm install` from repo root to update lockfile

## 3. Build toolchain

- [x] 3.1 Create `cli/tsup.config.ts`: entry `src/main.ts`, format `esm`, target `node18`, `esbuildOptions` with `jsx: 'automatic'`, banner `#!/usr/bin/env node` on `js` output
- [x] 3.2 Update `cli/tsconfig.json`: remove `composite`, `outDir`, `rootDir`, `declarationMap`, `declaration`, `importHelpers`; add `"jsx": "react-jsx"`; keep `strict`, `skipLibCheck`, `esModuleInterop`

## 4. Source structure

- [x] 4.1 Create `cli/src/ui/index.ts` (empty barrel export as placeholder)
- [x] 4.2 Create `cli/src/core/index.ts` (empty barrel export as placeholder)

## 5. CLI entry point and commands

- [x] 5.1 Create `cli/src/main.ts`: instantiate commander `Program`, set name/version/description, call `register` for each command, initialize omelette with the command tree, call `program.parse(process.argv)`
- [x] 5.2 Create `cli/src/commands/echo.ts`: export `register(program: Command): void` that adds an `echo <message>` command which prints `message` to stdout

## 6. Tests

- [x] 6.1 Create `cli/src/commands/echo.test.ts`: test that `register` attaches the echo command and that invoking it with a message argument outputs that message

## 7. Documentation

- [x] 7.1 Update `CLAUDE.md`: replace build command (`tsc -b` → `tsup`), update architecture section (remove oclif references, describe three-layer `src/` structure and tsup convention), update CLI command test convention (spy on `console.log`, no `import.meta.url` arg needed with commander), add note about omelette completion install

## 8. CI and coverage

- [x] 8.1 Manually reset `coverage.config.json` thresholds to 0 (or a safe floor) so the ratchet can re-baseline after the PR merges — deleting the old test drops prior coverage numbers
- [x] 8.2 Verify `pnpm build` passes from the repo root (tsup produces `cli/dist/main.js` with shebang)
- [x] 8.3 Verify `pnpm test` passes (new echo test green, no stale oclif tests)
- [x] 8.4 Verify `pnpm lint` passes (no oclif references, no biome errors)
- [x] 8.5 Smoke-test: `node cli/dist/main.js echo hello` prints `hello`
