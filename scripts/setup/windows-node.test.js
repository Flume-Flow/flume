const { describe, it, mock, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const windowsSetup = require('./windows-node');

describe('windowsSetup', () => {
    afterEach(() => mock.restoreAll());

    it('logs instructions containing the required Node version', () => {
        mock.method(process, 'exit', () => {});
        const log = mock.method(console, 'log', () => {});

        windowsSetup({ requiredNode: 24 });

        assert.equal(log.mock.callCount(), 1);
        const msg = log.mock.calls[0].arguments[0];
        assert.ok(msg.includes('24'), 'should mention required Node version');
        assert.ok(msg.includes('fnm'), 'should mention fnm');
    });

    it('calls process.exit(0)', () => {
        const exit = mock.method(process, 'exit', () => {});
        mock.method(console, 'log', () => {});

        windowsSetup({ requiredNode: 24 });

        assert.equal(exit.mock.callCount(), 1);
        assert.equal(exit.mock.calls[0].arguments[0], 0);
    });
});
