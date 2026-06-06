const { execSync } = require('child_process');
const { lines, branches, functions } = require('../coverage.config.json');

try {
    execSync(
        `node --test --experimental-test-coverage ` +
        `--test-coverage-lines=${lines} ` +
        `--test-coverage-branches=${branches} ` +
        `--test-coverage-functions=${functions} ` +
        `'scripts/**/*.test.js'`,
        { stdio: 'inherit' }
    );
} catch {
    process.exit(1);
}
