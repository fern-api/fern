// Assembles the npm packages and GitHub Release archives for the Fern CLI v2
// from the Bun-compiled binaries in `dist/bin/`.
//
// Output:
//   dist/npm/wrapper/                         → @fern-api/fern
//   dist/npm/fern-<os>-<cpu>/                 → @fern-api/fern-<os>-<cpu>
//   dist/archives/fern-cli-v2-<v>-<plat>.tar.gz (or .zip on windows)
//   dist/archives/fern-cli-v2-<v>-<plat>.<ext>.sha256
//   dist/archives/SHA256SUMS
//
// Usage:
//   node build.npm.mjs --version=0.1.0           # full build (npm + archives)
//   node build.npm.mjs --version=0.1.0 --npm-only
//   node build.npm.mjs --version=0.1.0 --archives-only

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../../..");

// Keep this in lockstep with build.compile.mjs (TARGETS) and
// npm/wrapper/bin/fern (PLATFORM_PACKAGES).
//
//   binaryName   — file under dist/bin/ produced by build.compile.mjs
//   pkgSlug      — slug used in the platform package name (@fern-api/fern-<slug>)
//                  and in archive filenames. Must match the npm os-cpu
//                  convention (process.platform / process.arch values).
//   archiveSlug  — slug used in the archive filename (kept identical to
//                  pkgSlug for now, but we leave a separate field in case we
//                  ever want to diverge for marketing/UX reasons).
//   os           — npm `os` field value (matches process.platform).
//   cpu          — npm `cpu` field value (matches process.arch).
//   binFile      — name of the binary inside the platform package's bin/.
//   archiveType  — "tar.gz" or "zip".
const PLATFORMS = [
    {
        binaryName: "fern-darwin-arm64",
        pkgSlug: "darwin-arm64",
        archiveSlug: "darwin-arm64",
        os: "darwin",
        cpu: "arm64",
        binFile: "fern",
        archiveType: "tar.gz"
    },
    {
        binaryName: "fern-darwin-x64",
        pkgSlug: "darwin-x64",
        archiveSlug: "darwin-x64",
        os: "darwin",
        cpu: "x64",
        binFile: "fern",
        archiveType: "tar.gz"
    },
    {
        binaryName: "fern-linux-arm64",
        pkgSlug: "linux-arm64",
        archiveSlug: "linux-arm64",
        os: "linux",
        cpu: "arm64",
        binFile: "fern",
        archiveType: "tar.gz"
    },
    {
        binaryName: "fern-linux-x64",
        pkgSlug: "linux-x64",
        archiveSlug: "linux-x64",
        os: "linux",
        cpu: "x64",
        binFile: "fern",
        archiveType: "tar.gz"
    },
    {
        binaryName: "fern-windows-x64.exe",
        pkgSlug: "win32-x64",
        archiveSlug: "win32-x64",
        os: "win32",
        cpu: "x64",
        binFile: "fern.exe",
        archiveType: "zip"
    }
];

function parseArgs() {
    const args = { version: null, npmOnly: false, archivesOnly: false };
    for (const arg of process.argv.slice(2)) {
        if (arg.startsWith("--version=")) {
            args.version = arg.slice("--version=".length);
        } else if (arg === "--npm-only") {
            args.npmOnly = true;
        } else if (arg === "--archives-only") {
            args.archivesOnly = true;
        } else if (arg === "--help" || arg === "-h") {
            process.stdout.write("Usage: node build.npm.mjs --version=X.Y.Z [--npm-only|--archives-only]\n");
            process.exit(0);
        } else {
            process.stderr.write(`Unknown argument: ${arg}\n`);
            process.exit(1);
        }
    }
    if (args.version == null || args.version === "") {
        process.stderr.write("Missing required --version=X.Y.Z flag.\n");
        process.exit(1);
    }
    if (args.npmOnly && args.archivesOnly) {
        process.stderr.write("--npm-only and --archives-only are mutually exclusive.\n");
        process.exit(1);
    }
    return args;
}

function ensureBinariesExist(missingBinariesOk) {
    const binDir = path.join(__dirname, "dist", "bin");
    if (!existsSync(binDir)) {
        process.stderr.write(`Binary directory not found: ${binDir}\n`);
        process.stderr.write("Run 'pnpm dist:bin' first.\n");
        process.exit(1);
    }
    const missing = [];
    for (const platform of PLATFORMS) {
        const p = path.join(binDir, platform.binaryName);
        if (!existsSync(p)) {
            missing.push(platform.binaryName);
        }
    }
    if (missing.length > 0 && !missingBinariesOk) {
        process.stderr.write(`Missing binaries in dist/bin/: ${missing.join(", ")}\n`);
        process.stderr.write("Run 'pnpm dist:bin' first.\n");
        process.exit(1);
    }
    return missing;
}

function replacePlaceholders(content, replacements) {
    let out = content;
    for (const [from, to] of Object.entries(replacements)) {
        out = out.split(from).join(to);
    }
    return out;
}

function writeWrapperPackage(version, outDir) {
    const srcDir = path.join(__dirname, "npm", "wrapper");
    rmSync(outDir, { recursive: true, force: true });
    mkdirSync(outDir, { recursive: true });
    cpSync(srcDir, outDir, { recursive: true });

    const pkgJsonPath = path.join(outDir, "package.json");
    const pkgJson = JSON.parse(readFileSync(pkgJsonPath, "utf8"));
    pkgJson.version = version;
    for (const slug of PLATFORMS.map((p) => p.pkgSlug)) {
        pkgJson.optionalDependencies[`@fern-api/fern-${slug}`] = version;
    }
    writeFileSync(pkgJsonPath, `${JSON.stringify(pkgJson, null, 2)}\n`);

    cpSync(path.join(REPO_ROOT, "LICENSE"), path.join(outDir, "LICENSE"));

    // Make sure bin/fern is executable. npm preserves the mode bits at publish
    // time, so this matters for the published tarball.
    const launcher = path.join(outDir, "bin", "fern");
    execFileSync("chmod", ["+x", launcher]);
}

function writePlatformPackage(version, platform, outDir) {
    const srcDir = path.join(__dirname, "npm", "platform");
    rmSync(outDir, { recursive: true, force: true });
    mkdirSync(path.join(outDir, "bin"), { recursive: true });

    const replacements = {
        PLATFORM_PLACEHOLDER: platform.pkgSlug,
        OS_PLACEHOLDER: platform.os,
        CPU_PLACEHOLDER: platform.cpu,
        "0.0.0-PLACEHOLDER": version
    };

    const pkgJson = replacePlaceholders(readFileSync(path.join(srcDir, "package.json"), "utf8"), replacements);
    writeFileSync(path.join(outDir, "package.json"), pkgJson);

    const readme = replacePlaceholders(readFileSync(path.join(srcDir, "README.md"), "utf8"), replacements);
    writeFileSync(path.join(outDir, "README.md"), readme);

    cpSync(path.join(REPO_ROOT, "LICENSE"), path.join(outDir, "LICENSE"));

    const binSrc = path.join(__dirname, "dist", "bin", platform.binaryName);
    const binDst = path.join(outDir, "bin", platform.binFile);
    cpSync(binSrc, binDst);
    if (platform.os !== "win32") {
        execFileSync("chmod", ["+x", binDst]);
    }
}

function sha256(filePath) {
    const buf = readFileSync(filePath);
    return createHash("sha256").update(buf).digest("hex");
}

function writeArchive(version, platform, archivesDir) {
    mkdirSync(archivesDir, { recursive: true });

    const archiveStem = `fern-cli-v2-${version}-${platform.archiveSlug}`;
    const archiveName = `${archiveStem}.${platform.archiveType}`;
    const archivePath = path.join(archivesDir, archiveName);

    // Stage the contents in a tmp dir so the archive root is a clean
    // (binary + LICENSE + README) bundle.
    const stagingDir = path.join(archivesDir, `staging-${platform.archiveSlug}`);
    rmSync(stagingDir, { recursive: true, force: true });
    mkdirSync(stagingDir, { recursive: true });

    cpSync(path.join(__dirname, "dist", "bin", platform.binaryName), path.join(stagingDir, platform.binFile));
    if (platform.os !== "win32") {
        execFileSync("chmod", ["+x", path.join(stagingDir, platform.binFile)]);
    }
    cpSync(path.join(REPO_ROOT, "LICENSE"), path.join(stagingDir, "LICENSE"));

    const readmePath = path.join(__dirname, "npm", "wrapper", "README.md");
    if (existsSync(readmePath)) {
        cpSync(readmePath, path.join(stagingDir, "README.md"));
    }

    if (platform.archiveType === "tar.gz") {
        execFileSync("tar", ["-czf", archivePath, "-C", stagingDir, "."]);
    } else if (platform.archiveType === "zip") {
        // -j strips leading directories so the binary is at the archive root.
        execFileSync("zip", ["-j", "-q", archivePath, ...readdirSync(stagingDir).map((f) => path.join(stagingDir, f))]);
    } else {
        throw new Error(`Unknown archive type: ${platform.archiveType}`);
    }

    rmSync(stagingDir, { recursive: true, force: true });

    const checksum = sha256(archivePath);
    writeFileSync(path.join(archivesDir, `${archiveName}.sha256`), `${checksum}  ${archiveName}\n`);

    return { archiveName, checksum, size: statSync(archivePath).size };
}

function formatSize(bytes) {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
}

function main() {
    const args = parseArgs();
    const version = args.version;

    process.stdout.write(`Building Fern CLI v2 npm packages and archives @ ${version}\n\n`);

    ensureBinariesExist(false);

    const distNpm = path.join(__dirname, "dist", "npm");
    const distArchives = path.join(__dirname, "dist", "archives");

    if (!args.archivesOnly) {
        rmSync(distNpm, { recursive: true, force: true });
        process.stdout.write("npm packages:\n");
        const wrapperDir = path.join(distNpm, "wrapper");
        writeWrapperPackage(version, wrapperDir);
        process.stdout.write(`  ✓ @fern-api/fern → ${path.relative(REPO_ROOT, wrapperDir)}\n`);
        for (const platform of PLATFORMS) {
            const platformDir = path.join(distNpm, `fern-${platform.pkgSlug}`);
            writePlatformPackage(version, platform, platformDir);
            process.stdout.write(`  ✓ @fern-api/fern-${platform.pkgSlug} → ${path.relative(REPO_ROOT, platformDir)}\n`);
        }
        process.stdout.write("\n");
    }

    if (!args.npmOnly) {
        rmSync(distArchives, { recursive: true, force: true });
        mkdirSync(distArchives, { recursive: true });
        process.stdout.write("archives:\n");
        const sumsLines = [];
        for (const platform of PLATFORMS) {
            const { archiveName, checksum, size } = writeArchive(version, platform, distArchives);
            process.stdout.write(`  ✓ ${archiveName} (${formatSize(size)})\n`);
            sumsLines.push(`${checksum}  ${archiveName}`);
        }
        writeFileSync(path.join(distArchives, "SHA256SUMS"), sumsLines.join("\n") + "\n");
        process.stdout.write(`  ✓ SHA256SUMS\n`);
        process.stdout.write("\n");
    }

    process.stdout.write("Done.\n");
}

main();
