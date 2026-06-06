const fs = require('fs');
const path = require('path');
const os = require('os');

const platform = process.platform;
const shell = (process.env.SHELL || '').split('/').pop();
const home = os.homedir();
const nvmrc = path.join(__dirname, '..', '.nvmrc');
const requiredNode = parseInt(fs.readFileSync(nvmrc, 'utf8').trim(), 10);

if (platform === 'win32') {
  require('./setup/windows')({ requiredNode });
} else {
  require('./setup/unix')({ requiredNode, platform, shell, home });
}
