## ADDED Requirements

### Requirement: src/ has three application layers
`cli/src/` SHALL contain three subdirectories for application code: `commands/`, `ui/`, and `core/`. `main.ts` SHALL live at the root of `src/`. No application source files SHALL be placed directly in `src/` other than `main.ts`. A `types/` subdirectory MAY exist solely for ambient module declarations (`.d.ts` shims for third-party packages that ship no TypeScript types); it SHALL NOT contain application logic.

#### Scenario: Three application subdirectories exist after setup
- **WHEN** `cli/src/` is listed
- **THEN** `commands/`, `ui/`, and `core/` are present as directories

#### Scenario: types/ contains only ambient declarations
- **WHEN** `src/types/` exists and any file within it is inspected
- **THEN** every file is a `.d.ts` file containing only `declare module` blocks and no runtime code

### Requirement: commands/ contains commander command files
Each file in `cli/src/commands/` SHALL define exactly one CLI command and SHALL export a `register(program: Command): void` function. Command files SHALL be named after the command they implement (e.g., `echo.ts` for the `echo` command).

#### Scenario: Each command file has a register export
- **WHEN** any file in `src/commands/` is imported
- **THEN** it exports a function named `register` compatible with `(program: Command) => void`

### Requirement: ui/ contains ink React components only
`cli/src/ui/` SHALL contain only React components intended for terminal rendering with ink. It SHALL NOT contain command routing logic, business logic, or direct process I/O calls.

#### Scenario: ui/ files are TSX or TS
- **WHEN** `src/ui/` is listed
- **THEN** all files have a `.ts` or `.tsx` extension

### Requirement: core/ contains shared business logic
`cli/src/core/` SHALL contain utilities, data access helpers, and shared logic that is not UI or command-routing specific. `core/` files SHALL NOT import from `commands/` or `ui/`.

#### Scenario: core/ has no dependency on commands or ui
- **WHEN** any file in `src/core/` is statically analyzed
- **THEN** it contains no imports from `src/commands/` or `src/ui/`

### Requirement: Dependency direction is enforced
The allowed import directions are: `commands/` → `ui/`, `commands/` → `core/`, `ui/` → `core/`. Reverse imports SHALL NOT exist. `main.ts` MAY import from all three layers.

#### Scenario: ui/ does not import commands
- **WHEN** any file in `src/ui/` is statically analyzed
- **THEN** it contains no imports from `src/commands/`

#### Scenario: core/ does not import ui or commands
- **WHEN** any file in `src/core/` is statically analyzed
- **THEN** it contains no imports from `src/ui/` or `src/commands/`
