import { createRequire } from 'module'
import { defineConfig } from 'vitest/config'

const require = createRequire(import.meta.url)
const { lines, branches, functions, statements, include, exclude } = require('./coverage.config.json')
const { workspaces } = require('./package.json')

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
