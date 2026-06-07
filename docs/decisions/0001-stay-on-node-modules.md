# ADR 0001 — Stay on `nodeLinker: node-modules` (don't migrate to Yarn PnP)

- **Status:** Accepted
- **Date:** 2026-06-08
- **Exploration PR:** [#19 — experiment: try Yarn PnP (no node_modules)](https://github.com/Flume-Flow/flume/pull/19)

## Context

We migrated from Yarn v1 to Yarn v4 in PR #17. Yarn v4 supports three module
linkers via the `nodeLinker` setting in `.yarnrc.yml`:

1. **`node-modules`** — classic hoisted `node_modules` tree (what we have)
2. **`pnpm`** — partial `node_modules` with symlinks to a content-addressed store
3. **`pnp` (Plug'n'Play)** — no `node_modules` at all; Node resolves modules through
   a generated `.pnp.cjs` at runtime

PnP is the headline Yarn v4 feature: it removes the `node_modules` tree, enforces
strict dependency resolution, and speeds up installs. The trade-off is that every
tool in the toolchain has to understand the PnP runtime — anything that does
direct `node_modules` lookup or spawns raw `node` will break or need a wrapper.

PR #19 prototyped the switch end-to-end to make this decision evidence-based
rather than vibes-based.

## Decision

**Keep `nodeLinker: node-modules`** for now.

## Why

What worked under PnP (verified in PR #19):
- `yarn install`, `yarn lint`, `yarn build`, `yarn test` (39/39) all pass
- The built oclif CLI runs correctly through PnP resolution

What didn't work cleanly:
- **`yarn dev`** (the ts-node/esm loader path we use for the oclif dev loop) emits
  a `.pnp.cjs` resolution stack trace before printing output. The command works
  but the noise will confuse contributors.
- Yarn itself flags PnP's ESM loader as `YN0092: experimental`.
- Persistent peer-dep warnings at install/runtime
  (`@oclif/core → typescript`, `vite → ms`, `@typescript-eslint/* → typescript`).
  Each needs a separate `packageExtensions` entry in `.yarnrc.yml` — ongoing
  whack-a-mole as deps churn.
- IDE setup becomes a per-collaborator manual step
  (`yarn dlx @yarnpkg/sdks vscode` / `jetbrains`).

The benefits PnP unlocks — faster installs and strict dep resolution — are
real, but they're benefits this project doesn't currently feel.
At 13 direct deps and 254 resolved deps (as of 2026-06-08), install time is
already negligible and we've had zero hoisting bugs. Paying daily cost for a
benefit we don't feel is a bad trade.

## Revisit when

This decision should be re-evaluated when **any** of the following holds.
These are concrete, observable triggers — not "feels like time to look again."

| Trigger | Threshold | Why |
|---------|-----------|-----|
| **Direct dependencies** across all workspaces | **≥ 75** (currently 13) | Project has grown materially; dep hygiene becomes a real concern. |
| **Resolved dependencies** in `yarn.lock` | **≥ 1500** (currently 254) | Cold install time crosses ~30s; hoisting risk surface area grows. |
| **`@oclif/core` documents native PnP support** | qualitative | The single tool that hurt most under PnP. If oclif supports it, the math changes. |
| **A real bug is traced to a hoisting / undeclared-peer-dep issue** | qualitative | PnP's strictness would have caught it. The benefit becomes tangible. |

The first two are checked automatically by
[`.github/workflows/decisions-revisit.yml`](../../.github/workflows/decisions-revisit.yml)
on a monthly schedule. The workflow opens a tracking issue when a threshold is
crossed and an issue isn't already open.

## Consequences

We keep:
- Universal tooling compatibility (every Node tool assumes `node_modules` works)
- Quiet, friction-free `yarn dev` for the oclif loop
- Zero per-IDE setup
- Familiar mental model for new contributors

We give up:
- ~80–150 MB of `node_modules` on disk (vs. ~28 MB of `.yarn/` under PnP)
- Strict dep resolution as a guard rail
- A modest install-speed improvement

The PnP exploration branch (`experiment/yarn-pnp`, PR #19) is preserved on
GitHub. If we revisit, that branch is the starting point: the structural
changes are already worked out, only the sharp edges need re-evaluating against
whatever the toolchain looks like at the time.
