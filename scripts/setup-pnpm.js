const platform = process.platform;

if (platform === 'win32') {
    require('./setup/windows-pnpm')();
} else {
    require('./setup/unix-pnpm')({ platform });
}
