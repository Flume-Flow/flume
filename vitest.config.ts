import { createRequire } from 'module'
import { defineConfig } from 'vitest/config'

const require = createRequire(import.meta.url)
const { lines, branches, functions, statements, include, exclude } = require('./coverage.config.json')

export default defineConfig({
    test: {
        // Each workspace package owns a vitest config; let vitest discover them
        // so the project list stays derived rather than duplicated.
        projects: ['./*/vitest.config.{mjs,ts}'],
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
