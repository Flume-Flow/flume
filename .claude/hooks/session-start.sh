#!/bin/bash
# SessionStart hook for Claude Code on the web.
#
# This repo pins a Node major in .nvmrc and enforces it via the `preinstall`
# check (scripts/check-node.js). The remote container ships a different Node,
# so a plain `pnpm install` fails. This hook installs the pinned Node major
# (downloaded straight from nodejs.org — the only reachable source in the
# sandbox), puts it on the session PATH, then provisions pnpm via Corepack and
# installs dependencies so tests and linters work out of the box.
#
# Runs only in the remote/web environment; local sessions are left untouched.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
    exit 0
fi

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
REQUIRED="$(tr -dc '0-9' < "$PROJECT_DIR/.nvmrc")"

current_major() {
    command -v node >/dev/null 2>&1 && node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo ""
}

if [ "$(current_major)" != "$REQUIRED" ]; then
    case "$(uname -m)" in
        x86_64) ARCH=x64 ;;
        aarch64 | arm64) ARCH=arm64 ;;
        *) echo "session-start: unsupported arch $(uname -m)" >&2; exit 1 ;;
    esac

    # Resolve the latest release for the pinned major from the dist index.
    VER="$(curl -fsSL https://nodejs.org/dist/index.json | node -e '
        let d = "";
        process.stdin.on("data", (c) => (d += c)).on("end", () => {
            const want = process.argv[1];
            const v = JSON.parse(d).map((x) => x.version).find((x) => x.startsWith("v" + want + "."));
            process.stdout.write(v || "");
        });
    ' "$REQUIRED")"

    if [ -z "$VER" ]; then
        echo "session-start: could not resolve a Node $REQUIRED.x release" >&2
        exit 1
    fi

    # Install once; cached container state reuses it on later sessions.
    DEST="$HOME/.local/node-$VER"
    if [ ! -x "$DEST/bin/node" ]; then
        echo "session-start: installing Node $VER ($ARCH)..."
        mkdir -p "$DEST"
        curl -fsSL "https://nodejs.org/dist/$VER/node-$VER-linux-$ARCH.tar.xz" \
            | tar -xJ -C "$DEST" --strip-components=1
    fi

    export PATH="$DEST/bin:$PATH"
    if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
        echo "export PATH=\"$DEST/bin:\$PATH\"" >> "$CLAUDE_ENV_FILE"
    fi
fi

echo "session-start: using Node $(node --version)"

# Provision the pinned package manager (pnpm) and install dependencies.
corepack enable
pnpm install

echo "session-start: dependencies ready"
