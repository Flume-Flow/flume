import { readFileSync } from 'node:fs'
import { createRequire } from 'module'
import { defineConfig } from 'vitest/config'

const require = createRequire(import.meta.url)
const { lines, branches, functions, statements, include, exclude } = require('./coverage.config.json')

// pnpm keeps the workspace package list in pnpm-workspace.yaml. Parse the
// `packages:` block so vitest projects stay derived from a single source.
function readWorkspacePackages(file: string): string[] {
    const packages: string[] = []
    let inPackages = false
    for (const line of readFileSync(file, 'utf8').split('\n')) {
        if (/^packages:/.test(line)) {
            inPackages = true
            continue
        }
        if (!inPackages) continue
        const item = line.match(/^\s*-\s*['"]?([^'"#\s]+)['"]?/)
        if (item) packages.push(item[1])
        else if (/^\S/.test(line)) break // next top-level key ends the block
    }
    return packages
}

const workspaces = readWorkspacePackages('./pnpm-workspace.yaml')

export default defineConfig({
    test: {
        projects: workspaces,
        coverage: {
            provider: 'v8',
            include,
            exclude,
            reporter: ['text', 'json-summary', 'json'],
            reportsDirectory: './coverage',
            thresholds: { lines, branches, functions, statements },
        },
    },
})
