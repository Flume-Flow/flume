const { describe, it, mock, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const childProcess = require('child_process');

const unixGhSetup = require('./unix-gh');

describe('unixGhSetup', () => {
    it('does nothing when gh is already installed', () => {
        const { logMock, exitMock } = setupMocks({ ghInstalled: true });

        unixGhSetup({ platform: 'linux' });

        assert.equal(exitMock.mock.callCount(), 0);
        assert.ok(logMock.mock.calls[0].arguments[0].includes('already installed'));
    });

    it('installs via brew on macOS', () => {
        setupMocks({ ghInstalled: false });
        const execSpy = childProcess.execSync;

        unixGhSetup({ platform: 'darwin' });

        const brewInstall = execSpy.mock.calls.find(c => c.arguments[0] === 'brew install gh');
        assert.ok(brewInstall, 'should call brew install gh');
    });

    it('installs via brew on linux when brew is available', () => {
        setupMocks({ ghInstalled: false, brewInstalled: true });
        const execSpy = childProcess.execSync;

        unixGhSetup({ platform: 'linux' });

        const brewInstall = execSpy.mock.calls.find(c => c.arguments[0] === 'brew install gh');
        assert.ok(brewInstall, 'should call brew install gh on linux with brew');
    });

    it('logs manual instructions and exits 1 on linux without brew', () => {
        const { logMock, exitMock } = setupMocks({ ghInstalled: false, brewInstalled: false });

        unixGhSetup({ platform: 'linux' });

        assert.equal(exitMock.mock.callCount(), 1);
        assert.equal(exitMock.mock.calls[0].arguments[0], 1);
        const msg = logMock.mock.calls[0].arguments[0];
        assert.ok(msg.includes('https://cli.github.com'));
    });
});

// --- test infrastructure ---

afterEach(() => mock.restoreAll());

function setupMocks({ ghInstalled = true, brewInstalled = false } = {}) {
    mock.method(childProcess, 'execSync', (cmd) => {
        if (cmd === 'gh --version') {
            if (!ghInstalled) throw new Error('not found');
            return;
        }
        if (cmd === 'brew --version') {
            if (!brewInstalled) throw new Error('not found');
            return;
        }
        if (cmd === 'brew install gh') return;
    });

    const logMock = mock.method(console, 'log', () => {});
    const exitMock = mock.method(process, 'exit', () => {});

    return { logMock, exitMock };
}
