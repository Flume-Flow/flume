const { describe, it, mock, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const windowsGhSetup = require('./windows-gh');

describe('windowsGhSetup', () => {
    afterEach(() => mock.restoreAll());

    it('logs instructions containing winget and gh auth login', () => {
        mock.method(process, 'exit', () => {});
        const log = mock.method(console, 'log', () => {});

        windowsGhSetup();

        const msg = log.mock.calls[0].arguments[0];
        assert.ok(msg.includes('winget install GitHub.cli'));
        assert.ok(msg.includes('gh auth login'));
    });

    it('calls process.exit(0)', () => {
        const exit = mock.method(process, 'exit', () => {});
        mock.method(console, 'log', () => {});

        windowsGhSetup();

        assert.equal(exit.mock.calls[0].arguments[0], 0);
    });
});
