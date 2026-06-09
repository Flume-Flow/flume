# Capability: cli-autocomplete

## Purpose

Shell tab-completion support for the Flume CLI, powered by omelette. Completion is opt-in and requires an explicit user action to install.

## Requirements

### Requirement: omelette is initialized in the entry point
`cli/src/main.ts` SHALL initialize an omelette instance that reflects the CLI's command tree. Initialization SHALL happen before `program.parse()` is called. The `package.json` `dependencies` SHALL include `omelette`.

#### Scenario: Omelette initializes without error
- **WHEN** `dist/main.js` is executed with any valid argument
- **THEN** omelette initialization does not throw and does not print unexpected output

### Requirement: echo command is registered in the completion tree
The omelette completion tree SHALL include `echo` as a top-level command entry. As new commands are added to the CLI they SHALL be added to the completion tree in the same commit.

#### Scenario: Completion tree includes echo
- **WHEN** the omelette instance is inspected at runtime
- **THEN** `echo` appears as a registered completion option

### Requirement: Shell completion install is a documented manual step
The CLI SHALL NOT automatically install shell completion on first run. Completion setup SHALL require an explicit user action (running `flume --completion` or a documented shell snippet). The completion install mechanism SHALL be documented in `CLAUDE.md` or a README.

#### Scenario: Normal CLI invocation does not modify shell config
- **WHEN** `flume echo hello` is run
- **THEN** no `.bashrc`, `.zshrc`, or other shell config file is modified
