const childProcess = require('child_process');
const unixGhSetup = require('./unix-gh');

describe('unixGhSetup', () => {
    afterEach(() => vi.restoreAllMocks());

    it('does nothing when gh is already installed', () => {
        const { logMock, exitMock } = setupMocks({ ghInstalled: true });

        unixGhSetup({ platform: 'linux' });

        expect(exitMock).not.toHaveBeenCalled();
        expect(logMock.mock.calls[0][0]).toContain('already installed');
    });

    it('installs via brew on macOS', () => {
        setupMocks({ ghInstalled: false });

        unixGhSetup({ platform: 'darwin' });

        const calls = vi.mocked(childProcess.execSync).mock.calls;
        expect(calls.some(([cmd]) => cmd === 'brew install gh')).toBe(true);
    });

    it('installs via brew on linux when brew is available', () => {
        setupMocks({ ghInstalled: false, brewInstalled: true });

        unixGhSetup({ platform: 'linux' });

        const calls = vi.mocked(childProcess.execSync).mock.calls;
        expect(calls.some(([cmd]) => cmd === 'brew install gh')).toBe(true);
    });

    it('logs manual instructions and exits 1 on linux without brew', () => {
        const { logMock, exitMock } = setupMocks({ ghInstalled: false, brewInstalled: false });

        unixGhSetup({ platform: 'linux' });

        expect(exitMock).toHaveBeenCalledWith(1);
        expect(logMock.mock.calls[0][0]).toContain('https://cli.github.com');
    });
});

// --- test infrastructure ---

function setupMocks({ ghInstalled = true, brewInstalled = false } = {}) {
    vi.spyOn(childProcess, 'execSync').mockImplementation((cmd) => {
        if (cmd === 'gh --version') {
            if (!ghInstalled) throw new Error('not found');
            return;
        }
        if (cmd === 'brew --version') {
            if (!brewInstalled) throw new Error('not found');
            return;
        }
    });

    const logMock = vi.spyOn(console, 'log').mockImplementation(() => {});
    const exitMock = vi.spyOn(process, 'exit').mockImplementation(() => {});

    return { logMock, exitMock };
}
