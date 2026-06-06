module.exports = function ({ requiredNode }) {
  console.log(`
Windows detected. Auto-switching requires fnm + PowerShell setup:

  1. Install fnm:
       winget install Schniz.fnm

  2. Install Node ${requiredNode}:
       fnm install ${requiredNode}

  3. Add to your PowerShell $PROFILE:
       fnm env --use-on-cd | Out-String | Invoke-Expression

  4. Restart PowerShell.
`);
  process.exit(0);
};
