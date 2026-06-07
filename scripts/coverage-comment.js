const fs = require('fs');
const path = require('path');
const readline = require('readline');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'coverage.config.json'), 'utf8'));
const summary = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'coverage', 'coverage-summary.json'), 'utf8'));
const final = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'coverage', 'coverage-final.json'), 'utf8'));

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
    const pct = (val) => `${val}%`;

    // Overall table
    let out = `## Coverage\n\n`;
    out += `| Metric | Value | vs threshold |\n`;
    out += `|--------|-------|--------------|\n`;
    out += `| Lines | ${pct(total.lines.pct)} | ${fmt(total.lines.pct, lT)} |\n`;
    out += `| Branches | ${pct(total.branches.pct)} | ${fmt(total.branches.pct, bT)} |\n`;
    out += `| Functions | ${pct(total.functions.pct)} | ${fmt(total.functions.pct, fT)} |\n`;

    // Per-file table for changed files
    const cwd = process.cwd();
    const touched = changedFiles
        .map(f => ({ rel: f, abs: path.resolve(cwd, f) }))
        .filter(({ abs }) => summary[abs])
        .map(({ rel, abs }) => ({ rel, data: summary[abs], finalData: final[abs] }));

    if (touched.length > 0) {
        out += `\n**Changed files**\n\n`;
        out += `| File | % Stmts | % Branch | % Funcs | % Lines | Uncovered Lines |\n`;
        out += `|------|---------|----------|---------|---------|----------------|\n`;
        for (const { rel, data, finalData } of touched) {
            const uncovered = finalData ? formatLineRanges(getUncoveredLines(finalData)) : '';
            out += `| \`${rel}\` | ${pct(data.statements.pct)} | ${pct(data.branches.pct)} | ${pct(data.functions.pct)} | ${pct(data.lines.pct)} | ${uncovered} |\n`;
        }
    }

    process.stdout.write(out);
});

function getUncoveredLines(fileData) {
    const uncovered = new Set();
    if (fileData.s && fileData.statementMap) {
        for (const [id, count] of Object.entries(fileData.s)) {
            if (count === 0) {
                const loc = fileData.statementMap[id];
                if (loc) {
                    for (let l = loc.start.line; l <= loc.end.line; l++) {
                        uncovered.add(l);
                    }
                }
            }
        }
    }
    return [...uncovered].sort((a, b) => a - b);
}

function formatLineRanges(lines) {
    if (!lines.length) return '';
    const ranges = [];
    let start = lines[0], end = lines[0];
    for (let i = 1; i < lines.length; i++) {
        if (lines[i] === end + 1) {
            end = lines[i];
        } else {
            ranges.push(start === end ? `${start}` : `${start}-${end}`);
            start = end = lines[i];
        }
    }
    ranges.push(start === end ? `${start}` : `${start}-${end}`);
    return ranges.join(', ');
}
