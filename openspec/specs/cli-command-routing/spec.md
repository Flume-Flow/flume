# Capability: cli-command-routing

## Purpose

Command routing architecture for the Flume CLI, using commander as the sole CLI framework with a register-pattern for extensibility.

## Requirements

### Requirement: commander is the CLI framework
The CLI SHALL use commander as its command routing library. There SHALL be no dependency on oclif or any other CLI framework. The `package.json` `dependencies` SHALL include `commander` and SHALL NOT include any `@oclif/*` package.

#### Scenario: No oclif at runtime
- **WHEN** `dist/main.js` is executed
- **THEN** it does not import or require any `@oclif/*` module

### Requirement: src/main.ts is the CLI entry point
`cli/src/main.ts` SHALL be the sole entry point for the CLI. It SHALL create a commander `Program`, register all commands, initialize omelette, and call `program.parse(process.argv)`. The `bin` field in `cli/package.json` SHALL point to `dist/main.js`.

#### Scenario: CLI is invokable via bin name
- **WHEN** `flume --help` is run after install
- **THEN** commander prints the program help text and exits 0

#### Scenario: Unknown command shows error
- **WHEN** `flume unknowncmd` is run
- **THEN** commander exits with a non-zero code and prints an error message

### Requirement: Commands use a register pattern
Each command file in `cli/src/commands/` SHALL export a `register(program: Command): void` function that attaches the command to the commander program. `main.ts` SHALL call each command's `register` with the program instance.

#### Scenario: Command is reachable after registration
- **WHEN** a command file exports `register` and main.ts calls it
- **THEN** the command is listed in `flume --help` output

### Requirement: echo command is implemented
A `flume echo <message>` command SHALL exist. It SHALL print `message` to stdout and exit 0. This is the baseline proof-of-life command.

#### Scenario: Echo prints the argument
- **WHEN** `flume echo hello` is run
- **THEN** stdout contains `hello` and the process exits 0

#### Scenario: Echo with no argument shows usage
- **WHEN** `flume echo` is run with no argument
- **THEN** commander exits with a non-zero code and prints usage for the echo command
