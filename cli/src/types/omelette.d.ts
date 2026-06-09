declare module 'omelette' {
    interface OmeletteInstance {
        tree(obj: Record<string, unknown>): this
        init(): void
    }
    function omelette(template: string): OmeletteInstance
    export = omelette
}
