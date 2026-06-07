const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const configPath = path.join(root, 'coverage.config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const { lines, branches, functions, statements, gap } = config;

execSync('yarn test:coverage', { stdio: 'inherit', cwd: root });

const summaryPath = path.join(root, 'coverage', 'coverage-summary.json');
const { total } = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));

const ratchet = (current, actual) => Math.max(current, Math.floor(actual - gap));

const updated = {
    ...config,
    lines: ratchet(lines, total.lines.pct),
    branches: ratchet(branches, total.branches.pct),
    functions: ratchet(functions, total.functions.pct),
    statements: ratchet(statements, total.statements.pct),
};

const changed =
    updated.lines !== lines ||
    updated.branches !== branches ||
    updated.functions !== functions ||
    updated.statements !== statements;

if (!changed) {
    console.log(`\nThresholds unchanged (gap: ${gap}%): lines ${lines}%, branches ${branches}%, functions ${functions}%, statements ${statements}%`);
} else {
    fs.writeFileSync(configPath, JSON.stringify(updated, null, 4) + '\n');
    console.log(`\nUpdated thresholds (gap: ${gap}%):`);
    if (updated.lines !== lines)
        console.log(`  lines:      ${lines}% → ${updated.lines}%  (actual: ${total.lines.pct}%)`);
    if (updated.branches !== branches)
        console.log(`  branches:   ${branches}% → ${updated.branches}%  (actual: ${total.branches.pct}%)`);
    if (updated.functions !== functions)
        console.log(`  functions:  ${functions}% → ${updated.functions}%  (actual: ${total.functions.pct}%)`);
    if (updated.statements !== statements)
        console.log(`  statements: ${statements}% → ${updated.statements}%  (actual: ${total.statements.pct}%)`);
}
