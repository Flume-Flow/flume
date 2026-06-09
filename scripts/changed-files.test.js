const { parseArgs, listChanged } = require('./changed-files');

describe('parseArgs', () => {
    it('defaults to non-staged, origin/main base, biome-lintable extensions', () => {
        expect(parseArgs([])).toEqual({
            staged: false,
            base: 'origin/main',
            ext: ['js', 'ts', 'mjs', 'cjs', 'json'],
        });
    });

    it('flips staged flag', () => {
        expect(parseArgs(['--staged']).staged).toBe(true);
    });

    it('takes a custom base ref', () => {
        expect(parseArgs(['--base', 'origin/release']).base).toBe('origin/release');
    });

    it('takes a custom extension list', () => {
        expect(parseArgs(['--ext', 'ts,tsx']).ext).toEqual(['ts', 'tsx']);
    });

    it('trims and ignores empty extensions', () => {
        expect(parseArgs(['--ext', ' ts , , tsx ']).ext).toEqual(['ts', 'tsx']);
    });
});

describe('listChanged', () => {
    it('uses staged diff when staged=true', () => {
        const calls = [];
        const runGit = (args) => {
            calls.push(args);
            return 'a.ts\n';
        };

        listChanged({ staged: true, base: 'origin/main', ext: ['ts'] }, runGit);

        expect(calls[0]).toEqual(['diff', '--cached', '--name-only', '--diff-filter=d']);
    });

    it('uses base..HEAD diff when staged=false', () => {
        const calls = [];
        const runGit = (args) => {
            calls.push(args);
            return '';
        };

        listChanged({ staged: false, base: 'origin/main', ext: ['ts'] }, runGit);

        expect(calls[0]).toEqual(['diff', '--name-only', '--diff-filter=d', 'origin/main..HEAD']);
    });

    it('filters files by extension', () => {
        const runGit = () => ['src/a.ts', 'README.md', 'src/b.js', 'cli/c.mjs', 'd.txt'].join('\n');
        const result = listChanged({ staged: false, base: 'origin/main', ext: ['js', 'ts', 'mjs'] }, runGit);
        expect(result).toEqual(['src/a.ts', 'src/b.js', 'cli/c.mjs']);
    });

    it('returns empty array when nothing changed', () => {
        const runGit = () => '';
        expect(listChanged({ staged: false, base: 'origin/main', ext: ['ts'] }, runGit)).toEqual([]);
    });

    it('ignores empty lines from git output', () => {
        const runGit = () => 'a.ts\n\n\nb.ts\n';
        expect(listChanged({ staged: false, base: 'origin/main', ext: ['ts'] }, runGit)).toEqual(['a.ts', 'b.ts']);
    });
});
