const childProcess = require('child_process');

module.exports = function () {
    try {
        childProcess.execSync('corepack --version', { stdio: 'ignore' });
    } catch {
        console.error('❌ Corepack not found. It ships with Node 16.9+ — run `node scripts/setup-node.js` first.');
        process.exit(1);
        return;
    }

    try {
        console.log('Enabling Corepack (pnpm shim)...\n');
        childProcess.execSync('corepack enable', { stdio: 'inherit' });
    } catch {
        console.error(`
❌ Failed to enable Corepack.

If Node is installed system-wide (apt, pkg), the bin directory needs root:

  sudo corepack enable

If you use fnm/nvm, the bin directory should be writable — re-run without sudo.
`);
        process.exit(1);
        return;
    }

    console.log(`
✅ Corepack enabled. Inside this project, \`pnpm\` will automatically use the
   version pinned by the \`packageManager\` field in package.json — no global
   pnpm install needed.
`);
};
