const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'coverage.config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const { lines, branches, functions, gap, exclude } = config;

const excludeFlags = exclude.map(p => `--exclude='${p}'`).join(' ');

execSync(
    `c8 --all --reporter=json-summary --reporter=text ` +
    `--include='scripts/**/*.js' ${excludeFlags} ` +
    `node --test 'scripts/**/*.test.js'`,
    { stdio: 'inherit' }
);

const summaryPath = path.join(__dirname, '..', 'coverage', 'coverage-summary.json');
const { total } = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));

const ratchet = (current, actual) => Math.max(current, Math.floor(actual - gap));

const updated = {
    ...config,
    lines: ratchet(lines, total.lines.pct),
    branches: ratchet(branches, total.branches.pct),
    functions: ratchet(functions, total.functions.pct),
};

const changed =
    updated.lines !== lines ||
    updated.branches !== branches ||
    updated.functions !== functions;

if (!changed) {
    console.log(`\nThresholds unchanged (gap: ${gap}%): lines ${lines}%, branches ${branches}%, functions ${functions}%`);
} else {
    fs.writeFileSync(configPath, JSON.stringify(updated, null, 4) + '\n');
    console.log(`\nUpdated thresholds (gap: ${gap}%):`);
    if (updated.lines !== lines)
        console.log(`  lines:     ${lines}% → ${updated.lines}%  (actual: ${total.lines.pct}%)`);
    if (updated.branches !== branches)
        console.log(`  branches:  ${branches}% → ${updated.branches}%  (actual: ${total.branches.pct}%)`);
    if (updated.functions !== functions)
        console.log(`  functions: ${functions}% → ${updated.functions}%  (actual: ${total.functions.pct}%)`);
}
