# Capability: cli-ui-framework

## Purpose

Terminal UI framework conventions for the Flume CLI. ink and React are the mandated rendering stack; ink-testing-library is the mandated test approach for UI components.

## Requirements

### Requirement: ink and react are the terminal UI dependencies
The CLI package `dependencies` SHALL include `ink`, `ink-select-input`, `ink-text-input`, and `react`. The `devDependencies` SHALL include `@types/react` and `ink-testing-library`. No other terminal UI library SHALL be used.

#### Scenario: ink renders without error
- **WHEN** a component from `src/ui/` is rendered via ink's `render()`
- **THEN** it outputs to the terminal without throwing

### Requirement: src/ui/ contains ink React components
All ink-based React components SHALL live under `cli/src/ui/`. Components in `src/ui/` SHALL be pure UI: they receive props and render output. They SHALL NOT import from `src/commands/`.

#### Scenario: UI components are isolated from command layer
- **WHEN** any file in `src/ui/` is statically analyzed
- **THEN** it contains no imports from `src/commands/`

### Requirement: tsup compiles JSX for ink
The tsup config SHALL set the JSX transform to `automatic` (react-jsx) so components do not need an explicit `import React from 'react'` statement.

#### Scenario: Component without React import compiles
- **WHEN** a `.tsx` component in `src/ui/` omits `import React from 'react'`
- **THEN** `pnpm build` succeeds and the component renders correctly at runtime

### Requirement: ink-testing-library is used for UI tests
Tests for components in `src/ui/` SHALL use `ink-testing-library` to render and assert on output. Tests SHALL NOT use `console.log` interception as a proxy for ink render output.

#### Scenario: Component test uses renderInk
- **WHEN** a test for a component in `src/ui/` is run
- **THEN** it uses `render` from `ink-testing-library` and asserts on `lastFrame()` output
