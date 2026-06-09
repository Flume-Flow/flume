import { Command } from 'commander'
import omelette from 'omelette'
import { register as registerEcho } from './commands/echo.js'

const program = new Command()

program.name('flume').description('Flume CLI').version('0.0.1')

registerEcho(program)

const completion = omelette('flume <command>').tree({
    echo: [],
})
completion.init()

program.parse(process.argv)
