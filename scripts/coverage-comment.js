const fs = require('fs');
const path = require('path');
const readline = require('readline');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'coverage.config.json'), 'utf8'));
const summary = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'coverage', 'coverage-summary.json'), 'utf8'));

const rl = readline.createInterface({ input: process.stdin, terminal: false });
const changedFiles = [];

rl.on('line', line => { if (line.trim()) changedFiles.push(line.trim()); });

rl.on('close', () => {
    const { total } = summary;
    const { lines: lT, branches: bT, functions: fT } = config;

    const fmt = (pct, threshold) => {
        const diff = (pct - threshold).toFixed(2);
        return pct >= threshold ? `✅ +${diff}%` : `❌ ${diff}%`;
    };

    let out = `## Coverage\n\n`;
    out += `| Metric | Value | vs threshold |\n`;
    out += `|--------|-------|--------------|\n`;
    out += `| Lines | ${total.lines.pct}% | ${fmt(total.lines.pct, lT)} |\n`;
    out += `| Branches | ${total.branches.pct}% | ${fmt(total.branches.pct, bT)} |\n`;
    out += `| Functions | ${total.functions.pct}% | ${fmt(total.functions.pct, fT)} |\n`;

    const cwd = process.cwd();
    const touched = changedFiles
        .map(f => ({ rel: f, abs: path.resolve(cwd, f) }))
        .filter(({ abs }) => summary[abs])
        .map(({ rel, abs }) => ({ rel, data: summary[abs] }));

    if (touched.length > 0) {
        out += `\n**Changed files**\n\n`;
        out += `| File | Lines | Branches | Functions |\n`;
        out += `|------|-------|----------|-----------|\n`;
        for (const { rel, data } of touched) {
            out += `| \`${rel}\` | ${data.lines.pct}% | ${data.branches.pct}% | ${data.functions.pct}% |\n`;
        }
    }

    process.stdout.write(out);
});
