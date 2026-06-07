import {Args, Command} from '@oclif/core'

export default class Example extends Command {
  static override summary = 'Shows how to build a flume command'

  static override args = {
    name: Args.string({description: 'Name to greet', required: true}),
  }

  static override examples = [
    '<%= config.bin %> <%= command.id %> Samsonov',
  ]

  public async run(): Promise<void> {
    const {args} = await this.parse(Example)
    this.log(`Hello Mr. ${args.name}`)
  }
}
