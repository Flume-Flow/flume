import type { Command } from 'commander'

export function register(program: Command): void {
    program
        .command('echo <message>')
        .description('Print a message to stdout')
        .action((message: string) => {
            console.log(message)
        })
}
