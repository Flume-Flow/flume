const { execSync } = require('child_process');
const { lines, branches, functions } = require('../coverage.config.json');

const exclude = [
    'scripts/**/*.test.js',
    'scripts/setup-gh.js',
    'scripts/setup-node.js',
    'scripts/test-coverage.js',
].map(p => `--exclude='${p}'`).join(' ');

try {
    execSync(
        `c8 --all --check-coverage ` +
        `--include='scripts/**/*.js' ${exclude} ` +
        `--lines=${lines} --branches=${branches} --functions=${functions} ` +
        `node --test 'scripts/**/*.test.js'`,
        { stdio: 'inherit' }
    );
} catch {
    process.exit(1);
}
