const fs = require('fs');
const path = require('path');

function checkNode(required, actual, platform) {
    const major = parseInt(actual.split('.')[0], 10);

    if (major === required) return;

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

    console.error(`
❌ Wrong Node version: ${actual} (requires ${required})

   Switch now:    ${switchCmd}
   Install:       nvm install ${required}  (or: fnm install ${required})

${persistNote}
`);
    process.exit(1);
}

if (require.main === module) {
    const nvmrc = path.join(__dirname, '..', '.nvmrc');
    const required = parseInt(fs.readFileSync(nvmrc, 'utf8').trim(), 10);
    checkNode(required, process.versions.node, process.platform);
}

function suggestInstallCmd(required, platform) {
    if (platform === 'win32') {
        return `fnm install ${required}`;
    }
    if (process.env.FNM_DIR) {
        return `fnm install ${required}`;
    }
    return `nvm install ${required}`;
}

module.exports = checkNode;
module.exports.suggestInstallCmd = suggestInstallCmd;
