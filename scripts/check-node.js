const fs = require('fs');
const path = require('path');
const nvmrc = path.join(__dirname, '..', '.nvmrc');
const required = parseInt(fs.readFileSync(nvmrc, 'utf8').trim(), 10);
const actual = process.versions.node;
const major = parseInt(actual.split('.')[0], 10);

if (major !== required) {
  const isWindows = process.platform === 'win32';
  const shell = (process.env.SHELL || '').split('/').pop();

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
❌ Wrong Node version: ${actual}
   This project requires Node ${required}.

   Right now:     ${switchCmd}
   If not installed: nvm install ${required}  (or: fnm install ${required})

${persistNote}
`);
  process.exit(1);
}
