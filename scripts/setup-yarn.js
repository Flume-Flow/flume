const platform = process.platform;

if (platform === 'win32') {
    require('./setup/windows-yarn')();
} else {
    require('./setup/unix-yarn')({ platform });
}
