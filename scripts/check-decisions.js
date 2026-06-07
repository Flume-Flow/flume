const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const DIRECT_THRESHOLD = 75;
const RESOLVED_THRESHOLD = 1500;

const rootPkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const workspacePkgs = (rootPkg.workspaces || []).map(w => path.join(ROOT, w, 'package.json'));

const direct = new Set();
for (const file of [path.join(ROOT, 'package.json'), ...workspacePkgs]) {
    if (!fs.existsSync(file)) continue;
    const j = JSON.parse(fs.readFileSync(file, 'utf8'));
    for (const k of ['dependencies', 'devDependencies']) {
        Object.keys(j[k] || {}).forEach(d => direct.add(d));
    }
}

const lockfile = fs.readFileSync(path.join(ROOT, 'yarn.lock'), 'utf8');
const resolved = (lockfile.match(/^ {2}version:/gm) || []).length;

const triggered = direct.size >= DIRECT_THRESHOLD || resolved >= RESOLVED_THRESHOLD;

console.log(`Direct deps:   ${direct.size} / ${DIRECT_THRESHOLD}`);
console.log(`Resolved deps: ${resolved} / ${RESOLVED_THRESHOLD}`);
console.log(`Triggered:     ${triggered}`);

if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(
        process.env.GITHUB_OUTPUT,
        [
            `triggered=${triggered}`,
            `direct=${direct.size}`,
            `resolved=${resolved}`,
            `direct_threshold=${DIRECT_THRESHOLD}`,
            `resolved_threshold=${RESOLVED_THRESHOLD}`,
        ].join('\n') + '\n'
    );
}
