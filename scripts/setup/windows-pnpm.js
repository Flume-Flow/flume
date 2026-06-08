module.exports = () => {
    console.log(`
Windows detected. Enable Corepack to provision pnpm:

  1. In an elevated PowerShell:
       corepack enable

  2. Inside this project, \`pnpm\` will then auto-use the version pinned by
     the \`packageManager\` field in package.json.
`);
    process.exit(0);
};
