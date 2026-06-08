const fs = require('fs');
const path = require('path');

// Lower bound: oldest still-maintained LTS major accepted for development.
// Upper bound comes from .nvmrc (Node 26 had build issues; 24 is the pinned ceiling).
const NODE_FLOOR = 20;

function checkNode({ min, max }, actual, platform) {
    const major = parseInt(actual.split('.')[0], 10);

    if (major >= min && major <= max) return;

    const isWindows = platform === 'win32';

    let switchCmd;
    let persistNote;

    if (isWindows) {
        switchCmd = 'fnm use';
        persistNote = `   To make it automatic, install fnm and configure PowerShell:
     winget install Schniz.fnm
     Then add to $PROFILE: fnm env --use-on-cd | Out-String | Invoke-Expression`;
    } else {
        switchCmd = 'nvm use  (or: fnm use)';
        persistNote = `   To make it switch automatically on cd, run:
     node scripts/setup-node.js`;
    }

    const range = min === max ? `${min}` : `${min}–${max}`;

    console.error(`
❌ Wrong Node version: ${actual}
   This project requires Node ${range}.

   Right now:     ${switchCmd}
   If not installed: nvm install ${max}  (or: fnm install ${max})

${persistNote}
`);
    process.exit(1);
}

if (require.main === module) {
    const nvmrc = path.join(__dirname, '..', '.nvmrc');
    const max = parseInt(fs.readFileSync(nvmrc, 'utf8').trim(), 10);
    checkNode({ min: NODE_FLOOR, max }, process.versions.node, process.platform);
}

module.exports = checkNode;
