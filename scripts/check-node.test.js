const checkNode = require('./check-node');

describe('checkNode', () => {
    afterEach(() => vi.restoreAllMocks());

    it('does nothing when versions match', () => {
        const exit = vi.spyOn(process, 'exit').mockImplementation(() => {});
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});

        checkNode(24, '24.1.0', 'linux');

        expect(exit).not.toHaveBeenCalled();
        expect(error).not.toHaveBeenCalled();
    });

    it('exits 1 with nvm hint on non-Windows mismatch', () => {
        const exit = vi.spyOn(process, 'exit').mockImplementation(() => {});
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});

        checkNode(24, '22.0.0', 'linux');

        expect(exit).toHaveBeenCalledWith(1);
        const msg = error.mock.calls[0][0];
        expect(msg).toContain('nvm use');
        expect(msg).toContain('22.0.0');
        expect(msg).toContain('24');
    });

    it('exits 1 with fnm hint on Windows mismatch', () => {
        const exit = vi.spyOn(process, 'exit').mockImplementation(() => {});
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});

        checkNode(24, '22.0.0', 'win32');

        expect(exit).toHaveBeenCalledWith(1);
        const msg = error.mock.calls[0][0];
        expect(msg).toContain('fnm use');
        expect(msg).not.toContain('nvm use');
    });

    it('does nothing when major matches despite different patch', () => {
        const exit = vi.spyOn(process, 'exit').mockImplementation(() => {});

        checkNode(24, '24.0.2', 'linux');

        expect(exit).not.toHaveBeenCalled();
    });
});
