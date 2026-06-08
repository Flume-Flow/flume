const checkNode = require('./check-node');

describe('checkNode', () => {
    afterEach(() => vi.restoreAllMocks());

    it('does nothing when major is inside the range', () => {
        const exit = vi.spyOn(process, 'exit').mockImplementation(() => {});
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});

        checkNode({ min: 20, max: 24 }, '24.1.0', 'linux');

        expect(exit).not.toHaveBeenCalled();
        expect(error).not.toHaveBeenCalled();
    });

    it('accepts the lower bound', () => {
        const exit = vi.spyOn(process, 'exit').mockImplementation(() => {});

        checkNode({ min: 20, max: 24 }, '20.10.0', 'linux');

        expect(exit).not.toHaveBeenCalled();
    });

    it('accepts the upper bound', () => {
        const exit = vi.spyOn(process, 'exit').mockImplementation(() => {});

        checkNode({ min: 20, max: 24 }, '24.0.2', 'linux');

        expect(exit).not.toHaveBeenCalled();
    });

    it('exits 1 below the floor with nvm hint on non-Windows', () => {
        const exit = vi.spyOn(process, 'exit').mockImplementation(() => {});
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});

        checkNode({ min: 20, max: 24 }, '18.0.0', 'linux');

        expect(exit).toHaveBeenCalledWith(1);
        const msg = error.mock.calls[0][0];
        expect(msg).toContain('nvm use');
        expect(msg).toContain('18.0.0');
        expect(msg).toContain('20–24');
    });

    it('exits 1 above the ceiling with nvm hint on non-Windows', () => {
        const exit = vi.spyOn(process, 'exit').mockImplementation(() => {});
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});

        checkNode({ min: 20, max: 24 }, '25.0.0', 'linux');

        expect(exit).toHaveBeenCalledWith(1);
        const msg = error.mock.calls[0][0];
        expect(msg).toContain('25.0.0');
        expect(msg).toContain('20–24');
    });

    it('exits 1 with fnm hint on Windows mismatch', () => {
        const exit = vi.spyOn(process, 'exit').mockImplementation(() => {});
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});

        checkNode({ min: 20, max: 24 }, '18.0.0', 'win32');

        expect(exit).toHaveBeenCalledWith(1);
        const msg = error.mock.calls[0][0];
        expect(msg).toContain('fnm use');
        expect(msg).not.toContain('nvm use');
    });

    it('shows single version when min equals max', () => {
        const exit = vi.spyOn(process, 'exit').mockImplementation(() => {});
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});

        checkNode({ min: 24, max: 24 }, '22.0.0', 'linux');

        expect(exit).toHaveBeenCalledWith(1);
        const msg = error.mock.calls[0][0];
        expect(msg).toContain('Node 24.');
        expect(msg).not.toContain('20–24');
    });
});
