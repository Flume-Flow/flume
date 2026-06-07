module.exports = function () {
    console.log(`
Windows detected. Enable Corepack to provision yarn:

  1. In an elevated PowerShell:
       corepack enable

  2. Inside this project, \`yarn\` will then auto-use the version pinned by
     the \`packageManager\` field in package.json.
`);
    process.exit(0);
};
