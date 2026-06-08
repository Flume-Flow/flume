const fs = require('node:fs');
const path = require('node:path');
const childProcess = require('node:child_process');

const unixSetup = require('./unix-node');

describe('manager detection', () => {
    it('uses fnm when fnm --version succeeds', () => {
        const { appendMock } = setupMocks({ fnmInstalled: true });

        unixSetup(baseArgs());

        expect(appendMock.mock.calls[0][1]).toContain('fnm env --use-on-cd');
    });

    it('uses nvm when fnm not found but .nvm/nvm.sh exists', () => {
        const { appendMock } = setupMocks({ fnmInstalled: false, nvmInstalled: true });

        unixSetup(baseArgs());

        expect(appendMock.mock.calls[0][1]).toContain('load-nvmrc');
        expect(appendMock.mock.calls[0][1]).not.toContain('fnm env');
    });

    it('installs fnm when neither manager is found', () => {
        const { appendMock } = setupMocks({ fnmInstalled: false, nvmInstalled: false });

        unixSetup(baseArgs({ platform: 'linux' }));

        const calls = vi.mocked(childProcess.execSync).mock.calls;
        expect(calls.some(([cmd]) => cmd === 'curl -fsSL https://fnm.vercel.app/install | bash')).toBe(true);
        expect(appendMock.mock.calls[0][1]).toContain('fnm env --use-on-cd');
    });

    it('installs fnm via brew on darwin', () => {
        setupMocks({ fnmInstalled: false, nvmInstalled: false });

        unixSetup(baseArgs({ platform: 'darwin' }));

        const calls = vi.mocked(childProcess.execSync).mock.calls;
        expect(calls.some(([cmd]) => cmd === 'brew install fnm')).toBe(true);
    });

    it('exits 1 and errors when fnm install fails', () => {
        const { exitMock, errorMock } = setupMocks({
            fnmInstalled: false,
            nvmInstalled: false,
            fnmInstallFails: true,
        });

        unixSetup(baseArgs());

        expect(exitMock).toHaveBeenCalledWith(1);
        expect(errorMock.mock.calls[0][0]).toContain('Failed to install fnm');
    });
});

describe('config file paths', () => {
    it('uses .zshrc for zsh', () => {
        const { appendMock } = setupMocks();

        unixSetup(baseArgs({ shell: 'zsh' }));

        expect(appendMock.mock.calls[0][0]).toBe(path.join(HOME, '.zshrc'));
    });

    it('uses .bash_profile for bash on darwin', () => {
        const { appendMock } = setupMocks();

        unixSetup(baseArgs({ shell: 'bash', platform: 'darwin' }));

        expect(appendMock.mock.calls[0][0]).toBe(path.join(HOME, '.bash_profile'));
    });

    it('uses .bashrc for bash on linux', () => {
        const { appendMock } = setupMocks();

        unixSetup(baseArgs({ shell: 'bash', platform: 'linux' }));

        expect(appendMock.mock.calls[0][0]).toBe(path.join(HOME, '.bashrc'));
    });

    it('uses config.fish for fish', () => {
        const { appendMock } = setupMocks();

        unixSetup(baseArgs({ shell: 'fish' }));

        expect(appendMock.mock.calls[0][0]).toBe(path.join(HOME, '.config', 'fish', 'config.fish'));
    });
});

describe('hook management', () => {
    it('appends hook when marker is absent', () => {
        const { appendMock } = setupMocks({ existingConfig: '# existing config' });

        unixSetup(baseArgs());

        expect(appendMock).toHaveBeenCalledTimes(1);
    });

    it('skips append when fnm marker already present', () => {
        const { appendMock } = setupMocks({
            existingConfig: 'eval "$(fnm env --use-on-cd)"',
        });

        unixSetup(baseArgs());

        expect(appendMock).not.toHaveBeenCalled();
    });

    it('skips append when nvm marker already present', () => {
        const { appendMock } = setupMocks({
            fnmInstalled: false,
            nvmInstalled: true,
            existingConfig: 'load-nvmrc',
        });

        unixSetup(baseArgs());

        expect(appendMock).not.toHaveBeenCalled();
    });

    it('appends correct hook strings per manager and shell', () => {
        const cases = [
            { manager: 'fnm', shell: 'zsh', expected: 'eval "$(fnm env --use-on-cd)"' },
            { manager: 'fnm', shell: 'fish', expected: 'fnm env --use-on-cd | source' },
            { manager: 'nvm', shell: 'bash', expected: 'cdnvm()' },
        ];

        for (const { manager, shell, expected } of cases) {
            const { appendMock } = setupMocks({
                fnmInstalled: manager === 'fnm',
                nvmInstalled: manager === 'nvm',
            });

            unixSetup(baseArgs({ shell }));

            expect(appendMock.mock.calls[0][1]).toContain(expected);
            vi.restoreAllMocks();
        }
    });
});

describe('unsupported shell', () => {
    it('exits 1 with error for unknown shell', () => {
        const { exitMock, errorMock } = setupMocks();

        unixSetup(baseArgs({ shell: 'tcsh' }));

        expect(exitMock).toHaveBeenCalledWith(1);
        const msg = errorMock.mock.calls[0][0];
        expect(msg).toContain('Unsupported shell');
        expect(msg).toContain('tcsh');
    });
});

describe('fnm node install', () => {
    it('calls fnm install <version> when using fnm', () => {
        setupMocks({ fnmInstalled: true });

        unixSetup(baseArgs({ requiredNode: 24 }));

        const calls = vi.mocked(childProcess.execSync).mock.calls;
        expect(calls.some(([cmd]) => cmd === 'fnm install 24')).toBe(true);
    });

    it('warns but does not crash when fnm install fails', () => {
        const { warnMock, exitMock } = setupMocks({ fnmInstalled: true, fnmNodeInstallFails: true });

        unixSetup(baseArgs());

        expect(exitMock).not.toHaveBeenCalled();
        expect(warnMock).toHaveBeenCalledTimes(1);
        expect(warnMock.mock.calls[0][0]).toContain('Could not install Node');
    });

    it('does not call fnm install when using nvm', () => {
        setupMocks({ fnmInstalled: false, nvmInstalled: true });

        unixSetup(baseArgs());

        const calls = vi.mocked(childProcess.execSync).mock.calls;
        const installCall = calls.find(([cmd]) => typeof cmd === 'string' && cmd.startsWith('fnm install'));
        expect(installCall).toBeUndefined();
    });
});

// --- test infrastructure ---

const HOME = '/home/testuser';

afterEach(() => vi.restoreAllMocks());

function setupMocks({
    fnmInstalled = true,
    nvmInstalled = false,
    existingConfig = '',
    fnmInstallFails = false,
    fnmNodeInstallFails = false,
} = {}) {
    vi.spyOn(childProcess, 'execSync').mockImplementation((cmd) => {
        if (cmd === 'fnm --version') {
            if (!fnmInstalled) throw new Error('not found');
            return;
        }
        if (cmd === 'brew --version') return;
        if (cmd === 'brew install fnm' || cmd.startsWith('curl')) {
            if (fnmInstallFails) throw new Error('install failed');
            return;
        }
        if (cmd.startsWith('fnm install')) {
            if (fnmNodeInstallFails) throw new Error('install failed');
            return;
        }
    });

    vi.spyOn(fs, 'existsSync').mockImplementation((p) => {
        if (p?.includes('.nvm/nvm.sh')) return nvmInstalled;
        return p ? existingConfig.length > 0 : false;
    });
    vi.spyOn(fs, 'readFileSync').mockImplementation(() => existingConfig);

    const appendMock = vi.spyOn(fs, 'appendFileSync').mockImplementation(() => {});
    const exitMock = vi.spyOn(process, 'exit').mockImplementation(() => {});
    const errorMock = vi.spyOn(console, 'error').mockImplementation(() => {});
    const warnMock = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(process, 'kill').mockImplementation(() => {});
    vi.spyOn(global, 'setTimeout').mockImplementation(() => {});

    return { appendMock, exitMock, errorMock, warnMock };
}

function baseArgs(overrides = {}) {
    return { requiredNode: 24, platform: 'linux', shell: 'zsh', home: HOME, ...overrides };
}
