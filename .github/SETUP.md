# Workflow Setup

## `track-unlinked-commits` workflow

This workflow detects commits pushed directly to `main` without a linked PR and creates a draft issue in the **Flume** GitHub Project.

### Required secret: `GH_PAT`

1. Create a Personal Access Token at **GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens** (or classic tokens).
2. The token must have these scopes:
   - `repo` — to read commits and associated pull requests
   - `project` — to read and write GitHub Projects
3. Add the token to this repository:
   **Repository → Settings → Secrets and variables → Actions → New repository secret**
   - Name: `GH_PAT`
   - Value: the token you created

### ⚠️ If the project is renamed

The workflow resolves the project by matching the title `"Flume"` via GraphQL. If the project is renamed, the "Resolve project node ID" step will produce an empty ID and the "Create draft issue" step will fail. Update the title string in `track-unlinked-commits.yml` to match the new name.
