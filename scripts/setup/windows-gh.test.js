const windowsGhSetup = require('./windows-gh');

describe('windowsGhSetup', () => {
    afterEach(() => vi.restoreAllMocks());

    it('logs instructions containing winget and gh auth login', () => {
        vi.spyOn(process, 'exit').mockImplementation(() => {});
        const log = vi.spyOn(console, 'log').mockImplementation(() => {});

        windowsGhSetup();

        const msg = log.mock.calls[0][0];
        expect(msg).toContain('winget install GitHub.cli');
        expect(msg).toContain('gh auth login');
    });

    it('calls process.exit(0)', () => {
        const exit = vi.spyOn(process, 'exit').mockImplementation(() => {});
        vi.spyOn(console, 'log').mockImplementation(() => {});

        windowsGhSetup();

        expect(exit).toHaveBeenCalledWith(0);
    });
});
