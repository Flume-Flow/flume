import { Command } from 'commander'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { register } from './echo.js'

describe('echo command', () => {
    it('prints the message argument to stdout', async () => {
        const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
        const program = new Command()
        program.exitOverride()
        register(program)

        await program.parseAsync(['node', 'flume', 'echo', 'hello'])

        expect(spy).toHaveBeenCalledWith('hello')
    })

    it('exits non-zero when message argument is missing', () => {
        const program = new Command()
        program.exitOverride()
        register(program)

        expect(() => program.parse(['node', 'flume', 'echo'])).toThrow()
    })
})

// --- test infrastructure ---

afterEach(() => {
    vi.restoreAllMocks()
})
