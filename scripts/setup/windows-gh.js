module.exports = function () {
    console.log(`
Windows detected. Install gh CLI:

  1. Install gh:
       winget install GitHub.cli

  2. Authenticate:
       gh auth login
`);
    process.exit(0);
};
