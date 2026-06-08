const windowsPnpmSetup = require('./windows-pnpm');

describe('windowsPnpmSetup', () => {
    afterEach(() => vi.restoreAllMocks());

    it('logs instructions containing `corepack enable`', () => {
        vi.spyOn(process, 'exit').mockImplementation(() => {});
        const log = vi.spyOn(console, 'log').mockImplementation(() => {});

        windowsPnpmSetup();

        const msg = log.mock.calls[0][0];
        expect(msg).toContain('corepack enable');
        expect(msg).toContain('packageManager');
    });

    it('calls process.exit(0)', () => {
        const exit = vi.spyOn(process, 'exit').mockImplementation(() => {});
        vi.spyOn(console, 'log').mockImplementation(() => {});

        windowsPnpmSetup();

        expect(exit).toHaveBeenCalledWith(0);
    });
});
