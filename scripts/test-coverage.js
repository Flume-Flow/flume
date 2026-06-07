const { execSync } = require('child_process');
const { lines, branches, functions, exclude } = require('../coverage.config.json');

const excludeFlags = exclude.map(p => `--exclude='${p}'`).join(' ');

try {
    execSync(
        `c8 --all --check-coverage --reporter=text --reporter=json-summary --reporter=json ` +
        `--include='scripts/**/*.js' ${excludeFlags} ` +
        `--lines=${lines} --branches=${branches} --functions=${functions} ` +
        `node --test 'scripts/**/*.test.js'`,
        { stdio: 'inherit' }
    );
} catch {
    process.exit(1);
}
