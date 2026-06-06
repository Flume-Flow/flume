# Workflow Setup

## `track-unlinked-commits` workflow

This workflow detects commits pushed directly to `main` without a linked PR and creates a draft issue in the **Flume** GitHub Project under the `Flume-Flow` organization.

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

The workflow finds the project by matching the title `"Flume"`. If the project is renamed, the workflow will fail. Update the title string in `track-unlinked-commits.yml` to match the new name.
