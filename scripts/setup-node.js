const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const platform = process.platform;
const shell = (process.env.SHELL || '').split('/').pop();
const home = os.homedir();
const nvmrc = path.join(__dirname, '..', '.nvmrc');
const requiredNode = parseInt(fs.readFileSync(nvmrc, 'utf8').trim(), 10);

if (platform === 'win32') {
    require('./setup/windows-node')({ requiredNode });
} else {
    require('./setup/unix-node')({ requiredNode, platform, shell, home });
}
