const childProcess = require('node:child_process');

module.exports = ({ platform }) => {
    try {
        childProcess.execSync('gh --version', { stdio: 'ignore' });
        console.log('✅ gh is already installed');
        return;
    } catch {
        /* not installed */
    }

    const hasBrew =
        platform === 'darwin' ||
        (() => {
            try {
                childProcess.execSync('brew --version', { stdio: 'ignore' });
                return true;
            } catch {
                return false;
            }
        })();

    if (hasBrew) {
        console.log('Installing gh via brew...\n');
        childProcess.execSync('brew install gh', { stdio: 'inherit' });
        console.log('\n✅ gh installed. Run: gh auth login\n');
    } else {
        console.log(`
gh CLI is not installed. Install it manually:

  apt:   sudo apt install gh
  dnf:   sudo dnf install gh
  any:   https://cli.github.com

Then run: gh auth login
`);
        process.exit(1);
    }
};
