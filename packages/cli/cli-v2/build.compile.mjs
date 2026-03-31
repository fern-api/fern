import { execFileSync } from "child_process";
import { existsSync, mkdirSync, statSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * All supported Bun cross-compilation targets.
 * See: https://bun.sh/docs/bundler/executables#cross-compile
 */
const TARGETS = [
    { bunTarget: "bun-darwin-arm64", output: "fern-darwin-arm64" },
    { bunTarget: "bun-darwin-x64", output: "fern-darwin-x64" },
    { bunTarget: "bun-linux-x64", output: "fern-linux-x64" },
    { bunTarget: "bun-linux-arm64", output: "fern-linux-arm64" },
    { bunTarget: "bun-windows-x64", output: "fern-windows-x64.exe" }
];

/**
 * Format bytes into a human-readable string.
 */
function formatSize(bytes) {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
}

/**
 * Parse --target= flag from argv.
 *   --target=local        → build for current platform only
 *   --target=darwin       → build darwin-arm64 + darwin-x64
 *   --target=linux        → build linux-x64 + linux-arm64
 *   --target=windows      → build windows-x64
 *   (no flag)             → build all targets
 */
function getTargets() {
    const targetArg = process.argv.find((arg) => arg.startsWith("--target="));
    if (targetArg == null) {
        return TARGETS;
    }

    const value = targetArg.split("=")[1];
    if (value === "local") {
        const platform = process.platform === "win32" ? "windows" : process.platform;
        const arch = process.arch === "arm64" ? "arm64" : "x64";
        const localTarget = TARGETS.find((t) => t.bunTarget === `bun-${platform}-${arch}`);
        if (localTarget == null) {
            process.stderr.write(`No target found for local platform: ${platform}-${arch}\n`);
            process.exit(1);
        }
        return [localTarget];
    }

    const filtered = TARGETS.filter((t) => t.bunTarget.includes(value));
    if (filtered.length === 0) {
        process.stderr.write(`No targets match: ${value}\n`);
        process.stderr.write(`Available: ${TARGETS.map((t) => t.bunTarget).join(", ")}\n`);
        process.exit(1);
    }
    return filtered;
}

function main() {
    const inputFile = path.join(__dirname, "dist", "dev", "cli.cjs");
    const outDir = path.join(__dirname, "dist", "bin");

    if (!existsSync(inputFile)) {
        process.stderr.write(`Input file not found: ${inputFile}\n`);
        process.stderr.write("Run 'pnpm dist:cli:dev' first to build the tsup bundle.\n");
        process.exit(1);
    }

    mkdirSync(outDir, { recursive: true });

    const targets = getTargets();

    process.stdout.write(`Compiling ${targets.length} target(s)...\n\n`);

    for (const { bunTarget, output } of targets) {
        const outFile = path.join(outDir, output);
        process.stdout.write(`  ${bunTarget} → ${output}\n`);

        try {
            execFileSync(
                "bun",
                ["build", "--compile", `--target=${bunTarget}`, "--minify", inputFile, "--outfile", outFile],
                { stdio: "inherit" }
            );

            const size = statSync(outFile).size;
            process.stdout.write(`  ✓ ${output} (${formatSize(size)})\n\n`);
        } catch (error) {
            process.stderr.write(`  ✗ Failed to compile ${bunTarget}\n`);
            if (error?.code === "ENOENT") {
                process.stderr.write(
                    "  Bun is not installed. Install it with: curl -fsSL https://bun.sh/install | bash\n"
                );
            } else if (error?.stderr) {
                process.stderr.write(error.stderr.toString() + "\n");
            }
            process.exit(1);
        }
    }

    process.stdout.write("Done.\n");
}

main();
