import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Example from './example.js'

describe('example', () => {
    beforeEach(() => {
        vi.spyOn(console, 'log').mockImplementation(() => {})
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('greets by name', async () => {
        await Example.run(['Samsonov'], import.meta.url)
        const output = vi.mocked(console.log).mock.calls.flat().join(' ')
        expect(output).toContain('Hello Mr. Samsonov')
    })

    it('fails when name is missing', async () => {
        const { error } = await Example.run([], import.meta.url).then(
            () => ({ error: undefined }),
            (error: unknown) => ({ error }),
        )
        expect(error).toBeDefined()
    })
})
