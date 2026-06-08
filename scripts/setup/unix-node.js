const fs = require('node:fs');
const path = require('node:path');
const childProcess = require('node:child_process');

const hooks = {
    fnm: {
        zsh: 'eval "$(fnm env --use-on-cd)"',
        bash: 'eval "$(fnm env --use-on-cd)"',
        fish: 'fnm env --use-on-cd | source',
    },
    nvm: {
        zsh: [
            'autoload -U add-zsh-hook',
            'load-nvmrc() {',
            '  local nvmrc_path=$(nvm_find_nvmrc)',
            '  if [ -n "$nvmrc_path" ]; then',
            '    local nvmrc_node=$(nvm version "$(cat "$nvmrc_path")")',
            '    if [ "$nvmrc_node" != "$(nvm version)" ]; then nvm use; fi',
            '  fi',
            '}',
            'add-zsh-hook chpwd load-nvmrc',
            'load-nvmrc',
        ].join('\n'),
        bash: ['cdnvm() { builtin cd "$@" && [ -f .nvmrc ] && nvm use; }', 'alias cd=cdnvm'].join('\n'),
        fish: '# nvm does not support fish — consider switching to fnm',
    },
};

function installFnm(platform) {
    const hasBrew =
        platform === 'darwin' &&
        (() => {
            try {
                childProcess.execSync('brew --version', { stdio: 'ignore' });
                return true;
            } catch {
                return false;
            }
        })();

    if (hasBrew) {
        childProcess.execSync('brew install fnm', { stdio: 'inherit' });
    } else {
        childProcess.execSync('curl -fsSL https://fnm.vercel.app/install | bash', { stdio: 'inherit', shell: true });
    }
}

module.exports = ({ requiredNode, platform, shell, home }) => {
    // Detect version manager
    let manager = null;
    try {
        childProcess.execSync('fnm --version', { stdio: 'ignore' });
        manager = 'fnm';
    } catch {
        /* fnm not installed */
    }

    if (!manager && fs.existsSync(path.join(home, '.nvm', 'nvm.sh'))) {
        manager = 'nvm';
    }

    if (!manager) {
        console.log('No Node version manager found. Installing fnm...\n');
        try {
            installFnm(platform);
            manager = 'fnm';
            console.log('');
        } catch {
            console.error('❌ Failed to install fnm. Please install it manually: https://github.com/Schniz/fnm');
            process.exit(1);
        }
    }

    // Resolve shell config file
    const configs = {
        zsh: path.join(home, '.zshrc'),
        bash: path.join(home, platform === 'darwin' ? '.bash_profile' : '.bashrc'),
        fish: path.join(home, '.config', 'fish', 'config.fish'),
    };

    const configFile = configs[shell];
    const hook = hooks[manager]?.[shell];

    if (!configFile || !hook) {
        console.error(`Unsupported shell: ${shell || 'unknown'}. Supported: zsh, bash, fish.`);
        process.exit(1);
    }

    // Add hook if not already present
    const existing = fs.existsSync(configFile) ? fs.readFileSync(configFile, 'utf8') : '';
    const marker = manager === 'fnm' ? 'fnm env --use-on-cd' : 'load-nvmrc';

    if (existing.includes(marker)) {
        console.log(`✅ Auto-switching already configured in ${configFile}`);
    } else {
        fs.appendFileSync(
            configFile,
            `\n# Auto-switch Node version based on .nvmrc (added by setup-node.js)\n${hook}\n`,
        );
        console.log(`✅ Auto-switching configured in ${configFile}`);
    }

    // Install required Node version
    if (manager === 'fnm') {
        try {
            console.log(`Installing Node ${requiredNode} via fnm...\n`);
            childProcess.execSync(`fnm install ${requiredNode}`, { stdio: 'inherit' });
        } catch {
            console.warn(`⚠️  Could not install Node ${requiredNode} automatically. Run: fnm install ${requiredNode}`);
        }
    }

    console.log(`
Closing this terminal — please open a new one and cd into the project.
`);
    setTimeout(() => process.kill(process.ppid), 500);
};
