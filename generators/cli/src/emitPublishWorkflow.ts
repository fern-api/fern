import { mkdir, writeFile } from "fs/promises";
import path from "path";
import type { ResolvedNpmPublishInfo } from "./resolveOutputConfig.js";

/**
 * Cross-compilation targets for the CLI binary. Each entry maps a
 * Rust target triple to the npm platform package suffix that cargo-dist
 * / the npm embedded-binary convention expects.
 */
const TARGETS: ReadonlyArray<{
    rustTarget: string;
    runner: string;
    npmPlatformSuffix: string;
}> = [
    { rustTarget: "x86_64-unknown-linux-musl", runner: "ubuntu-latest", npmPlatformSuffix: "linux-x64" },
    { rustTarget: "aarch64-unknown-linux-musl", runner: "ubuntu-24.04-arm", npmPlatformSuffix: "linux-arm64" },
    { rustTarget: "x86_64-apple-darwin", runner: "macos-latest", npmPlatformSuffix: "darwin-x64" },
    { rustTarget: "aarch64-apple-darwin", runner: "macos-latest", npmPlatformSuffix: "darwin-arm64" },
    { rustTarget: "x86_64-pc-windows-msvc", runner: "windows-latest", npmPlatformSuffix: "win32-x64" }
];

/**
 * Emit `.github/workflows/ci.yml` with only build+test jobs (check,
 * compile, test). Used when the output mode is `github` but no npm
 * publish info is configured.
 */
export async function emitCiWorkflow(args: { outputDir: string; binaryName: string }): Promise<void> {
    const { outputDir, binaryName } = args;
    const workflowsDir = path.join(outputDir, ".github", "workflows");
    await mkdir(workflowsDir, { recursive: true });
    const yaml = constructBuildTestYaml({ binaryName });
    await writeFile(path.join(workflowsDir, "ci.yml"), yaml);
}

/**
 * Emit `.github/workflows/ci.yml` into the generated CLI output.
 *
 * The workflow:
 *   - **check / compile / test** jobs run on every push (mirror the
 *     Rust SDK's emitted `ci.yml`).
 *   - **publish** job runs only on tag pushes, builds cross-platform
 *     binaries, packages each as an embedded-binary npm platform
 *     package, assembles a thin launcher package, and publishes all
 *     to npm via OIDC or `secrets.NPM_TOKEN`.
 *
 * The embedded-binary packaging model (the esbuild/swc pattern) means
 * the binary bytes live *inside* the npm tarball. This decouples
 * artifact distribution from GitHub source-repo visibility — a
 * customer can keep their CLI source private and still have a freely
 * `npm i -g` / `npx`-installable CLI.
 */
export async function emitPublishWorkflow(args: {
    outputDir: string;
    binaryName: string;
    npmPublishInfo: ResolvedNpmPublishInfo;
}): Promise<void> {
    const { outputDir, binaryName, npmPublishInfo } = args;
    const workflowsDir = path.join(outputDir, ".github", "workflows");
    await mkdir(workflowsDir, { recursive: true });
    const yaml = constructWorkflowYaml({ binaryName, npmPublishInfo });
    await writeFile(path.join(workflowsDir, "ci.yml"), yaml);
}

/**
 * Build+test-only workflow YAML — the `check`, `compile`, and `test`
 * jobs with no publish steps.
 */
function constructBuildTestYaml(args: { binaryName: string }): string {
    return `name: ci

on: [push]

concurrency:
  group: \${{ github.workflow }}-\${{ github.ref }}
  cancel-in-progress: false

env:
  RUSTFLAGS: "-A warnings"

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repo
        uses: actions/checkout@v6

      - name: Set up Rust
        uses: actions-rust-lang/setup-rust-toolchain@v1

      - name: Check
        run: cargo check --locked

  compile:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repo
        uses: actions/checkout@v6

      - name: Set up Rust
        uses: actions-rust-lang/setup-rust-toolchain@v1

      - name: Compile
        run: cargo build --locked

  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repo
        uses: actions/checkout@v6

      - name: Set up Rust
        uses: actions-rust-lang/setup-rust-toolchain@v1

      - name: Test
        run: cargo test --locked
`;
}

function constructWorkflowYaml(args: { binaryName: string; npmPublishInfo: ResolvedNpmPublishInfo }): string {
    const { binaryName, npmPublishInfo } = args;
    const { useOidc } = npmPublishInfo;
    const tokenVar = npmPublishInfo.tokenEnvironmentVariable;

    const oidcPermissions = useOidc ? `\n    permissions:\n      contents: read\n      id-token: write` : "";
    const tokenEnvBlock = useOidc ? "" : `\n        env:\n          NODE_AUTH_TOKEN: \${{ secrets.${tokenVar} }}`;

    const matrixIncludes = TARGETS.map(
        (t) =>
            `          - rust-target: ${t.rustTarget}\n` +
            `            runner: ${t.runner}\n` +
            `            npm-platform-suffix: ${t.npmPlatformSuffix}`
    ).join("\n");

    // Bash lines that build up the launcher's optionalDependencies map.
    // Each entry ends with a trailing comma except the last — JSON
    // forbids trailing commas inside `{ ... }`.
    const optionalDepsLines = TARGETS.map((t, i) => {
        const trailingComma = i === TARGETS.length - 1 ? "" : ",";
        return `          OPTIONAL_DEPS="\${OPTIONAL_DEPS}\\"${npmPublishInfo.packageName}-${t.npmPlatformSuffix}\\": \\"\${VERSION}\\"${trailingComma}"`;
    }).join("\n");

    // JavaScript object-literal entries for the launcher's PLATFORMS
    // map. Trailing commas are legal in ES5+ object literals so every
    // entry gets one — keeps diffs small when targets are added.
    const launcherPlatformEntries = TARGETS.map(
        (t) => `            "${t.npmPlatformSuffix}": "${npmPublishInfo.packageName}-${t.npmPlatformSuffix}",`
    ).join("\n");

    return `name: ci

on: [push]

concurrency:
  group: \${{ github.workflow }}-\${{ github.ref }}
  cancel-in-progress: false

env:
  RUSTFLAGS: "-A warnings"

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repo
        uses: actions/checkout@v6

      - name: Set up Rust
        uses: actions-rust-lang/setup-rust-toolchain@v1

      - name: Check
        run: cargo check --locked

  compile:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repo
        uses: actions/checkout@v6

      - name: Set up Rust
        uses: actions-rust-lang/setup-rust-toolchain@v1

      - name: Compile
        run: cargo build --locked

  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repo
        uses: actions/checkout@v6

      - name: Set up Rust
        uses: actions-rust-lang/setup-rust-toolchain@v1

      - name: Test
        run: cargo test --locked

  publish:
    needs: [check, compile, test]
    if: github.event_name == 'push' && contains(github.ref, 'refs/tags/')
    runs-on: \${{ matrix.runner }}${oidcPermissions}
    strategy:
      # Don't cancel sibling matrix jobs on first failure — a transient
      # failure on one platform would otherwise leave npm in a partial
      # state (some platform packages published, others not, launcher
      # never published), with no clean re-run since the already-
      # published versions reject re-publish.
      fail-fast: false
      matrix:
        include:
${matrixIncludes}
    steps:
      - name: Checkout repo
        uses: actions/checkout@v6

      - name: Set up Rust
        uses: actions-rust-lang/setup-rust-toolchain@v1
        with:
          target: \${{ matrix.rust-target }}

      - name: Set up Node.js
        uses: actions/setup-node@v6
        with:
          registry-url: "${npmPublishInfo.registryUrl}"

      - name: Install musl build tools
        if: contains(matrix.rust-target, '-linux-musl')
        run: |
          sudo apt-get update
          sudo apt-get install -y musl-tools

      - name: Build release binary
        shell: bash
        run: |
          if [[ "\${{ matrix.rust-target }}" == *-linux-musl ]]; then
            cargo build --release --locked --target \${{ matrix.rust-target }} \\
              --no-default-features --features rustls
          else
            cargo build --release --locked --target \${{ matrix.rust-target }}
          fi

      - name: Package and publish npm platform package${tokenEnvBlock}
        shell: bash
        run: |
          set -euo pipefail

          VERSION="\${GITHUB_REF_NAME#v}"
          PLATFORM_PKG="${npmPublishInfo.packageName}-\${{ matrix.npm-platform-suffix }}"
          PKG_DIR="npm-pkg/\${PLATFORM_PKG}"
          mkdir -p "\${PKG_DIR}"

          # Locate the compiled binary
          BINARY_NAME="${binaryName}"
          if [[ "\${{ matrix.rust-target }}" == *"windows"* ]]; then
            BINARY_NAME="${binaryName}.exe"
          fi
          cp "target/\${{ matrix.rust-target }}/release/\${BINARY_NAME}" "\${PKG_DIR}/"

          # Write platform package.json
          cat > "\${PKG_DIR}/package.json" <<PKGJSON
          {
            "name": "\${PLATFORM_PKG}",
            "version": "\${VERSION}",
            "description": "Platform-specific binary for ${binaryName} (\${{ matrix.npm-platform-suffix }})",
            "os": ["\$(echo \${{ matrix.npm-platform-suffix }} | cut -d- -f1)"],
            "cpu": ["\$(echo \${{ matrix.npm-platform-suffix }} | cut -d- -f2)"],
            "main": "\${BINARY_NAME}",
            "files": ["\${BINARY_NAME}"]
          }
          PKGJSON

          cd "\${PKG_DIR}"
          publish() {  # use latest npm to ensure OIDC support
            npx -y npm@latest publish "\$@"
          }
          # Pre-release detection — require the semver "-" separator so a
          # release tag like v1.0.0 for a package whose version string
          # happens to contain "alpha"/"beta" as a substring isn't
          # mis-tagged on npm.
          if [[ "\${VERSION}" == *-alpha* ]]; then
            publish --access public --tag alpha
          elif [[ "\${VERSION}" == *-beta* ]]; then
            publish --access public --tag beta
          else
            PKG_NAME=\$(node -p "require('./package.json').name")
            PKG_VERSION=\$(node -p "require('./package.json').version")
            CURRENT_LATEST=\$(npm view "\${PKG_NAME}" dist-tags.latest 2>/dev/null || echo "0.0.0")
            if npx -y semver@7.8.1 "\${PKG_VERSION}" -r "<\${CURRENT_LATEST}" > /dev/null 2>&1; then
              echo "Publishing \${PKG_VERSION} with --tag backport (current latest is \${CURRENT_LATEST})"
              publish --access public --tag backport
            else
              publish --access public
            fi
          fi

  publish-launcher:
    needs: [publish]
    if: github.event_name == 'push' && contains(github.ref, 'refs/tags/')
    runs-on: ubuntu-latest${oidcPermissions}
    steps:
      - name: Checkout repo
        uses: actions/checkout@v6

      - name: Set up Node.js
        uses: actions/setup-node@v6
        with:
          registry-url: "${npmPublishInfo.registryUrl}"

      - name: Publish launcher package${tokenEnvBlock}
        shell: bash
        run: |
          set -euo pipefail

          VERSION="\${GITHUB_REF_NAME#v}"
          PKG_DIR="npm-pkg/launcher"
          mkdir -p "\${PKG_DIR}"

          BINARY_NAME="${binaryName}"

          # Build optionalDependencies map
          OPTIONAL_DEPS=""
${optionalDepsLines}

          cat > "\${PKG_DIR}/package.json" <<PKGJSON
          {
            "name": "${npmPublishInfo.packageName}",
            "version": "\${VERSION}",
            "description": "CLI for ${binaryName}",
            "bin": {
              "${binaryName}": "bin/cli.js"
            },
            "optionalDependencies": {
              \${OPTIONAL_DEPS}
            },
            "files": ["bin/"]
          }
          PKGJSON

          # Write launcher script
          mkdir -p "\${PKG_DIR}/bin"
          cat > "\${PKG_DIR}/bin/cli.js" <<'LAUNCHER'
          #!/usr/bin/env node
          "use strict";
          const { execFileSync } = require("child_process");
          const path = require("path");
          const os = require("os");

          const PLATFORMS = {
${launcherPlatformEntries}
          };

          const platformKey = os.platform() + "-" + os.arch();
          const pkg = PLATFORMS[platformKey];
          if (!pkg) {
            console.error("Unsupported platform: " + platformKey);
            process.exit(1);
          }

          const binName = os.platform() === "win32" ? "${binaryName}.exe" : "${binaryName}";
          const binPath = path.join(require.resolve(pkg + "/package.json"), "..", binName);

          try {
            execFileSync(binPath, process.argv.slice(2), { stdio: "inherit" });
          } catch (e) {
            if (e && typeof e === "object" && "status" in e) {
              process.exit(e.status);
            }
            throw e;
          }
          LAUNCHER

          cd "\${PKG_DIR}"
          publish() {  # use latest npm to ensure OIDC support
            npx -y npm@latest publish "\$@"
          }
          # Pre-release detection — require the semver "-" separator so a
          # release tag like v1.0.0 for a package whose version string
          # happens to contain "alpha"/"beta" as a substring isn't
          # mis-tagged on npm.
          if [[ "\${VERSION}" == *-alpha* ]]; then
            publish --access public --tag alpha
          elif [[ "\${VERSION}" == *-beta* ]]; then
            publish --access public --tag beta
          else
            PKG_NAME=\$(node -p "require('./package.json').name")
            PKG_VERSION=\$(node -p "require('./package.json').version")
            CURRENT_LATEST=\$(npm view "\${PKG_NAME}" dist-tags.latest 2>/dev/null || echo "0.0.0")
            if npx -y semver@7.8.1 "\${PKG_VERSION}" -r "<\${CURRENT_LATEST}" > /dev/null 2>&1; then
              echo "Publishing \${PKG_VERSION} with --tag backport (current latest is \${CURRENT_LATEST})"
              publish --access public --tag backport
            else
              publish --access public
            fi
          fi
`;
}
