import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['src/main.ts'],
    format: ['esm'],
    target: 'node18',
    banner: {
        js: '#!/usr/bin/env node',
    },
    esbuildOptions(options) {
        options.jsx = 'automatic'
    },
})
