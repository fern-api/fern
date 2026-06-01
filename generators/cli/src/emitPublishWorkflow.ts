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
    { rustTarget: "x86_64-unknown-linux-gnu", runner: "ubuntu-latest", npmPlatformSuffix: "linux-x64" },
    { rustTarget: "aarch64-unknown-linux-gnu", runner: "ubuntu-latest", npmPlatformSuffix: "linux-arm64" },
    { rustTarget: "x86_64-apple-darwin", runner: "macos-latest", npmPlatformSuffix: "darwin-x64" },
    { rustTarget: "aarch64-apple-darwin", runner: "macos-latest", npmPlatformSuffix: "darwin-arm64" },
    { rustTarget: "x86_64-pc-windows-msvc", runner: "windows-latest", npmPlatformSuffix: "win32-x64" }
];

/**
 * Emit `.github/workflows/ci.yml` into the generated CLI output.
 *
 * The workflow:
 *   - **check / compile / test** jobs run on every push (mirror the
 *     Rust SDK's emitted `ci.yml`).
 *   - **publish** job runs only on tag pushes, builds cross-platform
 *     binaries, packages each as an embedded-binary npm platform
 *     package, assembles a thin launcher package, and publishes all
 *     to npm via `secrets.NPM_TOKEN`.
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

function constructWorkflowYaml(args: { binaryName: string; npmPublishInfo: ResolvedNpmPublishInfo }): string {
    const { binaryName, npmPublishInfo } = args;
    const tokenVar = npmPublishInfo.tokenEnvironmentVariable;

    const matrixIncludes = TARGETS.map(
        (t) =>
            `          - rust-target: ${t.rustTarget}\n` +
            `            runner: ${t.runner}\n` +
            `            npm-platform-suffix: ${t.npmPlatformSuffix}`
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
        uses: actions/checkout@v4

      - name: Set up Rust
        uses: actions-rust-lang/setup-rust-toolchain@v1

      - name: Check
        run: cargo check

  compile:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repo
        uses: actions/checkout@v4

      - name: Set up Rust
        uses: actions-rust-lang/setup-rust-toolchain@v1

      - name: Compile
        run: cargo build

  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repo
        uses: actions/checkout@v4

      - name: Set up Rust
        uses: actions-rust-lang/setup-rust-toolchain@v1

      - name: Test
        run: cargo test

  publish:
    needs: [check, compile, test]
    if: github.event_name == 'push' && contains(github.ref, 'refs/tags/')
    runs-on: \${{ matrix.runner }}
    strategy:
      fail-fast: true
      matrix:
        include:
${matrixIncludes}
    steps:
      - name: Checkout repo
        uses: actions/checkout@v4

      - name: Set up Rust
        uses: actions-rust-lang/setup-rust-toolchain@v1
        with:
          target: \${{ matrix.rust-target }}

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          registry-url: "${npmPublishInfo.registryUrl}"

      - name: Install cross-compilation tools
        if: matrix.rust-target == 'aarch64-unknown-linux-gnu'
        run: |
          sudo apt-get update
          sudo apt-get install -y gcc-aarch64-linux-gnu
          echo "CARGO_TARGET_AARCH64_UNKNOWN_LINUX_GNU_LINKER=aarch64-linux-gnu-gcc" >> $GITHUB_ENV

      - name: Build release binary
        run: cargo build --release --locked --target \${{ matrix.rust-target }}

      - name: Package and publish npm platform package
        env:
          NODE_AUTH_TOKEN: \${{ secrets.${tokenVar} }}
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
          if [[ "\${VERSION}" == *alpha* ]]; then
            npm publish --access public --tag alpha
          elif [[ "\${VERSION}" == *beta* ]]; then
            npm publish --access public --tag beta
          else
            npm publish --access public
          fi

  publish-launcher:
    needs: [publish]
    if: github.event_name == 'push' && contains(github.ref, 'refs/tags/')
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repo
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          registry-url: "${npmPublishInfo.registryUrl}"

      - name: Publish launcher package
        env:
          NODE_AUTH_TOKEN: \${{ secrets.${tokenVar} }}
        shell: bash
        run: |
          set -euo pipefail

          VERSION="\${GITHUB_REF_NAME#v}"
          PKG_DIR="npm-pkg/launcher"
          mkdir -p "\${PKG_DIR}"

          BINARY_NAME="${binaryName}"

          # Build optionalDependencies map
          OPTIONAL_DEPS=""
          OPTIONAL_DEPS="\${OPTIONAL_DEPS}\\"${npmPublishInfo.packageName}-linux-x64\\": \\"\${VERSION}\\","
          OPTIONAL_DEPS="\${OPTIONAL_DEPS}\\"${npmPublishInfo.packageName}-linux-arm64\\": \\"\${VERSION}\\","
          OPTIONAL_DEPS="\${OPTIONAL_DEPS}\\"${npmPublishInfo.packageName}-darwin-x64\\": \\"\${VERSION}\\","
          OPTIONAL_DEPS="\${OPTIONAL_DEPS}\\"${npmPublishInfo.packageName}-darwin-arm64\\": \\"\${VERSION}\\","
          OPTIONAL_DEPS="\${OPTIONAL_DEPS}\\"${npmPublishInfo.packageName}-win32-x64\\": \\"\${VERSION}\\""

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
            "linux-x64": "${npmPublishInfo.packageName}-linux-x64",
            "linux-arm64": "${npmPublishInfo.packageName}-linux-arm64",
            "darwin-x64": "${npmPublishInfo.packageName}-darwin-x64",
            "darwin-arm64": "${npmPublishInfo.packageName}-darwin-arm64",
            "win32-x64": "${npmPublishInfo.packageName}-win32-x64",
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
          if [[ "\${VERSION}" == *alpha* ]]; then
            npm publish --access public --tag alpha
          elif [[ "\${VERSION}" == *beta* ]]; then
            npm publish --access public --tag beta
          else
            npm publish --access public
          fi
`;
}
