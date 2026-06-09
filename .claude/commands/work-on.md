---
description: Start work on a GitHub issue and open a PR that closes it.
allowed-tools: Bash, Read, Edit, Write, AskUserQuestion
---

You are starting issue-driven work that ends in a PR linked to a GitHub issue.

**Fixed context (do not discover, do not ask):**
- Branch convention: `i-<N>-<slug>` where slug = first ~4 meaningful title words, lowercased, kebab-cased (skip stop-words like `add`, `the`, `a`, `for`, `to`).
- PR body must contain `Closes #N` (ready) or `Refs #N` (draft / partial).
- Honor `.github/PULL_REQUEST_TEMPLATE.md` when present.

## Step 1 — Resolve the issue

The user may have passed: `$ARGUMENTS`

**Case A — explicit issue number** (e.g. `#42`, `42`, `issue 42`):
Run `gh issue view <N> --json number,title,body,labels,state` and continue with that issue.

**Case B — free-text description or empty `$ARGUMENTS`:**
Ask a single `AskUserQuestion` offering: "Search existing issues", "Create a new issue", "Paste a number".

### Case B.1 — Search existing

```bash
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
gh search issues --repo "$REPO" "<terms>" --state open --limit 10 \
  --json number,title,labels \
  --jq '.[] | "#\(.number) \(.title) [\([.labels[].name] | join(","))]"'
```

Present the numbered list with `AskUserQuestion`. Options: each result, "None match — create new", "Search again with different terms". On pick, run `gh issue view <N> --json number,title,body,labels,state` for full details. Drop the search-results list from context — don't keep it.

### Case B.2 — Create new

1. Draft a title and body from the user's description.
2. Show the draft, confirm or accept edits via `AskUserQuestion`.
3. `gh issue create --title "<title>" --body "<body>"` and capture the new number.

## Step 2 — Branch

1. Slugify the issue title per the convention above.
2. Look for an existing branch: `git branch --list "i-<N>-*"`.
3. If found → `git checkout` it and tell the user you're resuming.
4. If not → `git fetch origin main && git checkout -b i-<N>-<slug> origin/main`.

## Step 3 — Scope check

Read the issue body. Judge whether the work fits one PR (one cohesive change, ≲300 lines net diff, doesn't span unrelated subsystems).

**Fits** → continue to Step 4.

**Doesn't fit** → stop, propose a split (2–5 child tasks, each shippable on its own) via `AskUserQuestion`. On approval:

1. Append a sub-tasks checklist to the parent issue body via `gh issue edit <parent-N> --body-file <tmp>`:
   ```
   ## Sub-tasks
   - [ ] <child-1-title>
   - [ ] <child-2-title>
   ```
2. Tell the user: parent updated; create child issues manually and re-run `/work-on #<child-N>` to start the first.
3. Stop. Do not create children. Do not implement.

## Step 4 — Implement

Carry out the work, following the conventions in `CLAUDE.md`.

## Step 5 — Pre-PR gates

```bash
pnpm lint && pnpm test
```

Fix any failure before opening the PR.

## Step 6 — Open the PR

1. Read `.github/PULL_REQUEST_TEMPLATE.md` if present and fill `## What`, `## Why`, leave `## Checklist` as-is.
2. Append `Closes #<N>` (or `Refs #<N>` for `--draft`). Multi-issue PR: stack `Closes #N, Closes #M`.
3. Push if needed: `git push -u origin <branch>`.
4. Create:
   ```bash
   gh pr create --base main --head <branch> --title "<conventional commit title>" --body "$(cat <<'EOF'
   <filled template>

   Closes #<N>
   EOF
   )"
   ```
5. Report the PR URL.

## Token-efficiency notes

- Never run `gh issue list` without `--search` or `--label`. Use `gh search issues` for free-text (server-side).
- Always `--limit 10` and `--jq` to strip JSON down to bare strings.
- Fetch issue bodies only for the chosen issue.
- Drop the search-results list after the user picks — re-fetch by number.
