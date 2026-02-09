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
            console.error(`No target found for local platform: ${platform}-${arch}`);
            process.exit(1);
        }
        return [localTarget];
    }

    const filtered = TARGETS.filter((t) => t.bunTarget.includes(value));
    if (filtered.length === 0) {
        console.error(`No targets match: ${value}`);
        console.error(`Available: ${TARGETS.map((t) => t.bunTarget).join(", ")}`);
        process.exit(1);
    }
    return filtered;
}

function main() {
    const inputFile = path.join(__dirname, "dist", "dev", "cli.cjs");
    const outDir = path.join(__dirname, "dist", "bin");

    if (!existsSync(inputFile)) {
        console.error(`Input file not found: ${inputFile}`);
        console.error("Run 'pnpm dist:cli:dev' first to build the tsup bundle.");
        process.exit(1);
    }

    mkdirSync(outDir, { recursive: true });

    const targets = getTargets();

    console.log(`Compiling ${targets.length} target(s)...\n`);

    for (const { bunTarget, output } of targets) {
        const outFile = path.join(outDir, output);
        console.log(`  ${bunTarget} → ${output}`);

        try {
            execFileSync(
                "bun",
                ["build", "--compile", `--target=${bunTarget}`, "--minify", inputFile, "--outfile", outFile],
                { stdio: "inherit" }
            );

            const size = statSync(outFile).size;
            console.log(`  ✓ ${output} (${formatSize(size)})\n`);
        } catch (error) {
            console.error(`  ✗ Failed to compile ${bunTarget}`);
            if (error?.code === "ENOENT") {
                console.error("  Bun is not installed. Install it with: curl -fsSL https://bun.sh/install | bash");
            } else if (error?.stderr) {
                console.error(error.stderr.toString());
            }
            process.exit(1);
        }
    }

    console.log("Done.");
}

main();
