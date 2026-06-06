const { describe, it, mock, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const checkNode = require('./check-node');

describe('checkNode', () => {
    afterEach(() => mock.restoreAll());

    it('does nothing when versions match', () => {
        const exit = mock.method(process, 'exit', () => {});
        const error = mock.method(console, 'error', () => {});

        checkNode(24, '24.1.0', 'linux');

        assert.equal(exit.mock.callCount(), 0);
        assert.equal(error.mock.callCount(), 0);
    });

    it('exits 1 with nvm hint on non-Windows mismatch', () => {
        const exit = mock.method(process, 'exit', () => {});
        const error = mock.method(console, 'error', () => {});

        checkNode(24, '22.0.0', 'linux');

        assert.equal(exit.mock.callCount(), 1);
        assert.equal(exit.mock.calls[0].arguments[0], 1);
        const msg = error.mock.calls[0].arguments[0];
        assert.ok(msg.includes('nvm use'), 'should mention nvm use');
        assert.ok(msg.includes('22.0.0'), 'should show actual version');
        assert.ok(msg.includes('24'), 'should show required version');
    });

    it('exits 1 with fnm hint on Windows mismatch', () => {
        const exit = mock.method(process, 'exit', () => {});
        const error = mock.method(console, 'error', () => {});

        checkNode(24, '22.0.0', 'win32');

        assert.equal(exit.mock.callCount(), 1);
        const msg = error.mock.calls[0].arguments[0];
        assert.ok(msg.includes('fnm use'), 'should mention fnm use');
        assert.ok(!msg.includes('nvm use'), 'should not mention nvm use');
    });

    it('does nothing when major matches despite different patch', () => {
        const exit = mock.method(process, 'exit', () => {});

        checkNode(24, '24.0.2', 'linux');

        assert.equal(exit.mock.callCount(), 0);
    });
});
