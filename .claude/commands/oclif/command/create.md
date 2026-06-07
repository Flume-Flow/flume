---
description: Scaffold a new oclif command in cli/src/commands/
allowed-tools: Bash, Read, Write, Edit, AskUserQuestion
---

You are scaffolding a new oclif v4 command for the `flume` CLI.

**Fixed context (do not discover, do not ask):**
- CLI package: `cli/`
- Commands directory: `cli/src/commands/`
- TypeScript, oclif v4 (`@oclif/core ^4`)
- Topic separator is a **space** (e.g. `flume config set`, not `flume config:set`)
- Test framework: vitest with co-located `*.test.ts` files

## Step 1 — Parse arguments

The user may have passed: `$ARGUMENTS`

Extract from `$ARGUMENTS`:
- First token → command name (e.g. `deploy`, `config set`, `logs tail`)
- Remaining text → summary/description (optional)

If the command name is missing, ask the user for it before continuing.

## Step 2 — Collect metadata

Ask the user for anything not already provided. Collect all required info in **one** `AskUserQuestion` call:
- Summary (one-line description shown in `--help`) — required
- Flags — ask: "List any flags, one per line, format: `--name type [required] description`. Leave blank if none." (types: `boolean`, `string`, `integer`)
- Args — ask: "List positional args, one per line, format: `name [required] description`. Leave blank if none."

If the summary was already given in `$ARGUMENTS`, skip asking for it.

## Step 3 — Generate the scaffold

Convert the command name to oclif format: spaces → colons (e.g. `config set` → `config:set`).

Run from the repo root:
```bash
cd cli && npx oclif generate command <name-with-colons> 2>&1
```

Then read the generated file at `cli/src/commands/<path>.ts`.

## Step 4 — Enhance the command file

Edit the generated file to add the metadata collected in Step 2:

1. Set `static summary` and `static description` from the user's input.
2. Remove boilerplate example flags/args from the scaffold.
3. Add each flag to `static flags` using the appropriate `Flags.*` helper:
   - `boolean` → `Flags.boolean({ description })`
   - `string`  → `Flags.string({ description, required? })`
   - `integer` → `Flags.integer({ description, required? })`
4. Add each arg to `static args` as `{ name: Arg.string({ description, required? }) }`.
5. Update `run()` with destructuring for all flags and args, add a `this.log(...)` placeholder, and a `// TODO` comment for the actual implementation.

Import `Args` from `@oclif/core` only if there are positional args.

## Step 5 — Write the test file

Create `cli/src/commands/<path>.test.ts` co-located with the command file.

**Critical patterns** (learned from this repo's setup):
- oclif's `this.log()` routes through `console.log` internally — spy on `console.log`, NOT `process.stdout.write`
- Pass `import.meta.url` as the second arg to `Command.run()` so oclif loads the CLI's `package.json` (without it, oclif loads `@oclif/core`'s own config and emits plugin-not-found warnings)

Test template:
```typescript
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import MyCommand from './<filename>.js'   // .js extension required (NodeNext)

describe('<command-name>', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('runs successfully', async () => {
    await MyCommand.run([], import.meta.url)
    const output = vi.mocked(console.log).mock.calls.flat().join(' ')
    expect(output).toContain('...')
  })

  // Add tests for each required flag/arg combination
})
```

Write tests for: happy path (no args), each required flag/arg, and at least one invalid usage that expects an error.

## Step 6 — Verify

Run the tests:
```bash
cd cli && yarn test 2>&1
```

Fix any TypeScript or test errors before reporting done.

## Step 7 — Report

Show the user:
- Paths of the created/modified files
- How to try it: `cd cli && node bin/dev.js <command-name> --help`
- How to run tests: `cd cli && yarn test`
