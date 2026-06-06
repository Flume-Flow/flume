const platform = process.platform;

if (platform === 'win32') {
    require('./setup/windows-gh')();
} else {
    require('./setup/unix-gh')({ platform });
}
