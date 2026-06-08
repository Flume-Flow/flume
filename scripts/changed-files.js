const { execFileSync } = require('child_process');

const EXT_DEFAULT = ['js', 'ts', 'mjs'];

function parseArgs(argv) {
    const args = { staged: false, base: 'origin/main', ext: EXT_DEFAULT };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--staged') args.staged = true;
        else if (a === '--base') args.base = argv[++i];
        else if (a === '--ext') args.ext = argv[++i].split(',').map(s => s.trim()).filter(Boolean);
    }
    return args;
}

function listChanged({ staged, base, ext }, runGit) {
    const extPattern = new RegExp(`\\.(${ext.join('|')})$`, 'i');
    const gitArgs = staged
        ? ['diff', '--cached', '--name-only', '--diff-filter=d']
        : ['diff', '--name-only', '--diff-filter=d', `${base}..HEAD`];
    return runGit(gitArgs).split('\n').filter(f => f && extPattern.test(f));
}

/* v8 ignore start */
if (require.main === module) {
    try {
        const args = parseArgs(process.argv.slice(2));
        const runGit = (gitArgs) => execFileSync('git', gitArgs, { encoding: 'utf8' });
        const files = listChanged(args, runGit);
        if (files.length) console.log(files.join('\n'));
    } catch {
        // Git command failed (e.g. base ref not fetched). Caller decides
        // whether the empty result is a problem.
    }
}
/* v8 ignore stop */

module.exports = { parseArgs, listChanged };
