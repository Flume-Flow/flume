import { createRequire } from 'module'
import { defineConfig } from 'vitest/config'

const require = createRequire(import.meta.url)
const { lines, branches, functions, exclude } = require('./coverage.config.json')

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'scripts',
          globals: true,
          include: ['scripts/**/*.test.js'],
        },
      },
      {
        test: {
          name: 'cli',
          include: ['cli/src/**/*.test.ts'],
        },
      },
    ],
    coverage: {
      provider: 'v8',
      include: ['scripts/**/*.js', 'cli/src/**/*.ts'],
      exclude: [...exclude, 'cli/src/**/*.test.ts'],
      reporter: ['text', 'json-summary', 'json'],
      reportsDirectory: './coverage',
      thresholds: { lines, branches, functions },
    },
  },
})
