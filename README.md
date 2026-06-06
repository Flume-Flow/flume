<div align="center">
  <picture>
    <source srcset="icon_transparent.svg" media="(prefers-color-scheme: dark)">
    <source srcset="icon_transparent.svg" media="(prefers-color-scheme: light)">
    <img src="icon_square.svg" alt="Flume logo" width="80" height="80">
  </picture>

  <h1>Flume</h1>
  <p>A workflow engine for verified AI development.</p>
  <p><strong>🚧 Work in progress — nothing working yet.</strong></p>
</div>

---

## What is this

Flume is an open-source engine for building deterministic development flows. Steps, gates, verification, and artifacts are the primitives. Your methodology — SDD, TDD, BDD, or anything else AI brings tomorrow — is a **preset** on top, not a hardcode.

Think of it like `make` for development workflows: `make` doesn't know about C or Rust, it knows about targets and dependencies. Flume doesn't know about SDD — it knows about steps, gates, and verification. Methodologies are just config.

Built first for dogfooding in my own startup, open-sourced to gather feedback and help the community.

---

## Goals

### Trust
- SHA-256 hash tamper detection on artifacts (verify → implementation integrity)
- Verification as a declared step in the artifact graph, not post-hoc
- Clean subagent context on every verification (no context rot)

### Scale
- Multi-repo / cross-repo support
- Feature dependency graph (not just artifact-level dependencies)
- Parallel agents in git worktrees

### Maintainability
- Incremental step editing without cascading regeneration of downstream artifacts
- Per-artifact model selection (Haiku for simple, Opus for critical)
- Cascade config overrides: `default → global → local → param`

### Flexibility
- Methodology as a preset — swap SDD / TDD / BDD without rewriting the engine
- Granular adoption — works even if your team hasn't bought in; fully local

---

## Why

The AI era brought speed. It also brought three documented failures:

1. **Verification gap** — LLMs introduce vulnerable code in 9.8–42.1% of cases. Agents that self-verify are an antipattern.
2. **Context rot** — quality degrades as context fills. Unstructured sessions make agents slower, not faster.
3. **Maintenance tax** — changing one step forces regeneration of everything downstream. SDD often doubles overhead instead of reducing it.

These aren't three separate problems. They share one root: there's no engine that makes any development process explicit and verifiable. Flume is that engine.

---

## Non-goals

- Not a commercial product. Goal is to learn, get experience, and help the community.
- Not a competitor to OpenSpec or GSD. If they copy a feature — that's a win, not a failure.
- Not a bet that SDD wins. The engine abstraction survives any methodology shift.

---

*Living document. Updated as the project moves.*
