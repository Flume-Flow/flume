const windowsSetup = require('./windows-node');

describe('windowsSetup', () => {
    afterEach(() => vi.restoreAllMocks());

    it('logs instructions containing the required Node version', () => {
        vi.spyOn(process, 'exit').mockImplementation(() => {});
        const log = vi.spyOn(console, 'log').mockImplementation(() => {});

        windowsSetup({ requiredNode: 24 });

        expect(log).toHaveBeenCalledTimes(1);
        const msg = log.mock.calls[0][0];
        expect(msg).toContain('24');
        expect(msg).toContain('fnm');
    });

    it('calls process.exit(0)', () => {
        const exit = vi.spyOn(process, 'exit').mockImplementation(() => {});
        vi.spyOn(console, 'log').mockImplementation(() => {});

        windowsSetup({ requiredNode: 24 });

        expect(exit).toHaveBeenCalledWith(0);
    });
});
