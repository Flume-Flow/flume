const { describe, it, mock, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

const unixSetup = require('./unix');

describe('manager detection', () => {
    it('uses fnm when fnm --version succeeds', () => {
        const { appendMock } = setupMocks({ fnmInstalled: true });

        unixSetup(baseArgs());

        const content = appendMock.mock.calls[0].arguments[1];
        assert.ok(content.includes('fnm env --use-on-cd'), 'should append fnm hook');
    });

    it('uses nvm when fnm not found but .nvm/nvm.sh exists', () => {
        const { appendMock } = setupMocks({ fnmInstalled: false, nvmInstalled: true });

        unixSetup(baseArgs());

        const content = appendMock.mock.calls[0].arguments[1];
        assert.ok(content.includes('load-nvmrc'), 'should append nvm hook');
        assert.ok(!content.includes('fnm env'), 'should not use fnm hook');
    });

    it('installs fnm when neither manager is found', () => {
        const { appendMock } = setupMocks({ fnmInstalled: false, nvmInstalled: false });
        const execSpy = childProcess.execSync;

        unixSetup(baseArgs({ platform: 'linux' }));

        const installCall = execSpy.mock.calls.find(c =>
            c.arguments[0] === 'curl -fsSL https://fnm.vercel.app/install | bash'
        );
        assert.ok(installCall, 'should install fnm via curl on linux');
        const content = appendMock.mock.calls[0].arguments[1];
        assert.ok(content.includes('fnm env --use-on-cd'), 'should use fnm hook after install');
    });

    it('installs fnm via brew on darwin', () => {
        setupMocks({ fnmInstalled: false, nvmInstalled: false });
        const execSpy = childProcess.execSync;

        unixSetup(baseArgs({ platform: 'darwin' }));

        const brewInstall = execSpy.mock.calls.find(c => c.arguments[0] === 'brew install fnm');
        assert.ok(brewInstall, 'should install fnm via brew on darwin');
    });

    it('exits 1 and errors when fnm install fails', () => {
        const { exitMock, errorMock } = setupMocks({
            fnmInstalled: false,
            nvmInstalled: false,
            fnmInstallFails: true,
        });

        unixSetup(baseArgs());

        assert.ok(exitMock.mock.callCount() >= 1);
        assert.equal(exitMock.mock.calls[0].arguments[0], 1);
        const msg = errorMock.mock.calls[0].arguments[0];
        assert.ok(msg.includes('Failed to install fnm'));
    });
});

describe('config file paths', () => {
    it('uses .zshrc for zsh', () => {
        const { appendMock } = setupMocks();

        unixSetup(baseArgs({ shell: 'zsh' }));

        assert.equal(appendMock.mock.calls[0].arguments[0], path.join(HOME, '.zshrc'));
    });

    it('uses .bash_profile for bash on darwin', () => {
        const { appendMock } = setupMocks();

        unixSetup(baseArgs({ shell: 'bash', platform: 'darwin' }));

        assert.equal(appendMock.mock.calls[0].arguments[0], path.join(HOME, '.bash_profile'));
    });

    it('uses .bashrc for bash on linux', () => {
        const { appendMock } = setupMocks();

        unixSetup(baseArgs({ shell: 'bash', platform: 'linux' }));

        assert.equal(appendMock.mock.calls[0].arguments[0], path.join(HOME, '.bashrc'));
    });

    it('uses config.fish for fish', () => {
        const { appendMock } = setupMocks();

        unixSetup(baseArgs({ shell: 'fish' }));

        assert.equal(
            appendMock.mock.calls[0].arguments[0],
            path.join(HOME, '.config', 'fish', 'config.fish')
        );
    });
});

describe('hook management', () => {
    it('appends hook when marker is absent', () => {
        const { appendMock } = setupMocks({ existingConfig: '# existing config' });

        unixSetup(baseArgs());

        assert.equal(appendMock.mock.callCount(), 1);
    });

    it('skips append when fnm marker already present', () => {
        const { appendMock } = setupMocks({
            existingConfig: 'eval "$(fnm env --use-on-cd)"',
        });

        unixSetup(baseArgs());

        assert.equal(appendMock.mock.callCount(), 0);
    });

    it('skips append when nvm marker already present', () => {
        const { appendMock } = setupMocks({
            fnmInstalled: false,
            nvmInstalled: true,
            existingConfig: 'load-nvmrc',
        });

        unixSetup(baseArgs());

        assert.equal(appendMock.mock.callCount(), 0);
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

            const content = appendMock.mock.calls[0].arguments[1];
            assert.ok(content.includes(expected), `${manager}/${shell} hook should include: ${expected}`);
            mock.restoreAll();
        }
    });
});

describe('unsupported shell', () => {
    it('exits 1 with error for unknown shell', () => {
        const { exitMock, errorMock } = setupMocks();

        unixSetup(baseArgs({ shell: 'tcsh' }));

        assert.equal(exitMock.mock.callCount(), 1);
        assert.equal(exitMock.mock.calls[0].arguments[0], 1);
        const msg = errorMock.mock.calls[0].arguments[0];
        assert.ok(msg.includes('Unsupported shell'));
        assert.ok(msg.includes('tcsh'));
    });
});

describe('fnm node install', () => {
    it('calls fnm install <version> when using fnm', () => {
        setupMocks({ fnmInstalled: true });
        const execSpy = childProcess.execSync;

        unixSetup(baseArgs({ requiredNode: 24 }));

        const installCall = execSpy.mock.calls.find(c => c.arguments[0] === 'fnm install 24');
        assert.ok(installCall, 'should call fnm install 24');
    });

    it('warns but does not crash when fnm install fails', () => {
        const { warnMock, exitMock } = setupMocks({ fnmInstalled: true, fnmNodeInstallFails: true });

        unixSetup(baseArgs());

        assert.equal(exitMock.mock.callCount(), 0);
        assert.equal(warnMock.mock.callCount(), 1);
        assert.ok(warnMock.mock.calls[0].arguments[0].includes('Could not install Node'));
    });

    it('does not call fnm install when using nvm', () => {
        setupMocks({ fnmInstalled: false, nvmInstalled: true });
        const execSpy = childProcess.execSync;

        unixSetup(baseArgs());

        const installCall = execSpy.mock.calls.find(c =>
            typeof c.arguments[0] === 'string' && c.arguments[0].startsWith('fnm install')
        );
        assert.equal(installCall, undefined, 'should not call fnm install when using nvm');
    });
});

// --- test infrastructure ---

const HOME = '/home/testuser';

afterEach(() => mock.restoreAll());

function setupMocks({
    fnmInstalled = true,
    nvmInstalled = false,
    existingConfig = '',
    fnmInstallFails = false,
    fnmNodeInstallFails = false,
} = {}) {
    mock.method(childProcess, 'execSync', (cmd) => {
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

    mock.method(fs, 'existsSync', (p) => {
        if (p?.includes('.nvm/nvm.sh')) return nvmInstalled;
        return p ? existingConfig.length > 0 : false;
    });
    mock.method(fs, 'readFileSync', () => existingConfig);

    const appendMock = mock.method(fs, 'appendFileSync', () => {});
    const exitMock = mock.method(process, 'exit', () => {});
    const errorMock = mock.method(console, 'error', () => {});
    const warnMock = mock.method(console, 'warn', () => {});
    mock.method(console, 'log', () => {});
    mock.method(process, 'kill', () => {});
    mock.method(global, 'setTimeout', () => {});

    return { appendMock, exitMock, errorMock, warnMock };
}

function baseArgs(overrides = {}) {
    return { requiredNode: 24, platform: 'linux', shell: 'zsh', home: HOME, ...overrides };
}
