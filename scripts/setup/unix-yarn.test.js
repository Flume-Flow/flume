const childProcess = require('child_process');
const unixYarnSetup = require('./unix-yarn');

describe('unixYarnSetup', () => {
    afterEach(() => vi.restoreAllMocks());

    it('errors and exits 1 when corepack is missing', () => {
        const { errMock, exitMock } = setupMocks({ corepackInstalled: false });

        unixYarnSetup();

        expect(exitMock).toHaveBeenCalledWith(1);
        expect(errMock.mock.calls[0][0]).toContain('Corepack not found');
    });

    it('runs `corepack enable` when corepack is present', () => {
        setupMocks({ corepackInstalled: true });

        unixYarnSetup();

        const calls = vi.mocked(childProcess.execSync).mock.calls;
        expect(calls.some(([cmd]) => cmd === 'corepack enable')).toBe(true);
    });

    it('logs success and does not exit when corepack enable succeeds', () => {
        const { exitMock, logMock } = setupMocks({ corepackInstalled: true });

        unixYarnSetup();

        expect(exitMock).not.toHaveBeenCalled();
        const lastLog = logMock.mock.calls.at(-1)[0];
        expect(lastLog).toContain('Corepack enabled');
        expect(lastLog).toContain('packageManager');
    });

    it('exits 1 with sudo hint when `corepack enable` fails', () => {
        const { errMock, exitMock } = setupMocks({ corepackInstalled: true, enableFails: true });

        unixYarnSetup();

        expect(exitMock).toHaveBeenCalledWith(1);
        expect(errMock.mock.calls[0][0]).toContain('sudo corepack enable');
    });
});

// --- test infrastructure ---

function setupMocks({ corepackInstalled = true, enableFails = false } = {}) {
    vi.spyOn(childProcess, 'execSync').mockImplementation((cmd) => {
        if (cmd === 'corepack --version') {
            if (!corepackInstalled) throw new Error('not found');
            return;
        }
        if (cmd === 'corepack enable') {
            if (enableFails) throw new Error('EACCES: permission denied');
            return;
        }
    });

    const logMock = vi.spyOn(console, 'log').mockImplementation(() => {});
    const errMock = vi.spyOn(console, 'error').mockImplementation(() => {});
    const exitMock = vi.spyOn(process, 'exit').mockImplementation(() => {});

    return { logMock, errMock, exitMock };
}
