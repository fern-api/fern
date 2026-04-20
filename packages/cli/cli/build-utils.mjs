import { exec } from "child_process";
import { existsSync } from "fs";
import { readdir, readFile, writeFile } from "fs/promises";
import path from "path";
import tsup from "tsup";
import { fileURLToPath } from "url";
import { promisify } from "util";
import packageJson from "./package.json" with { type: "json" };

const execAsync = promisify(exec);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../../..");

/**
 * Rewrite every .map file in absOutDir so each entry in `sources` is a clean
 * path relative to the repo root (e.g. "packages/cli/cli/src/cli.ts") instead
 * of a relative path like "../../src/cli.ts". This gives Sentry a tidy,
 * already-normalised filename to display and lets a single repo-root-based
 * code mapping resolve every frame regardless of package depth.
 */
async function rewriteSourceMapSources(absOutDir) {
    if (!existsSync(absOutDir)) {
        return;
    }
    const entries = await readdir(absOutDir, { withFileTypes: true });
    for (const entry of entries) {
        if (!entry.isFile() || !entry.name.endsWith(".map")) {
            continue;
        }
        const mapPath = path.join(absOutDir, entry.name);
        const mapDir = path.dirname(mapPath);
        const map = JSON.parse(await readFile(mapPath, "utf8"));
        if (!Array.isArray(map.sources)) {
            continue;
        }
        map.sources = map.sources.map((src) => {
            if (typeof src !== "string" || src === "" || src.startsWith("<") || src.startsWith("data:")) {
                return src;
            }
            return path.relative(REPO_ROOT, path.resolve(mapDir, src));
        });
        if ("sourceRoot" in map) {
            delete map.sourceRoot;
        }
        await writeFile(mapPath, JSON.stringify(map));
    }
}

/**
 * Get a dependency version from package.json, preferring dependencies over devDependencies.
 * This ensures we don't miss runtime dependencies regardless of where they're declared.
 */
function getDependencyVersion(packageName) {
    return packageJson.dependencies?.[packageName] ?? packageJson.devDependencies?.[packageName];
}

/**
 * Common external dependencies for full builds (dev/prod with extensive externals)
 */
export const FULL_EXTERNALS = [
    "@boundaryml/baml",
    /^prettier(?:\/.*)?$/,
    /^prettier2(?:\/.*)?$/,
    /^vitest(?:\/.*)?$/,
    /^depcheck(?:\/.*)?$/,
    /^tsup(?:\/.*)?$/,
    /^typescript(?:\/.*)?$/,
    /^@types\/.*$/
];

/**
 * Minimal external dependencies for local/unminified builds
 */
export const MINIMAL_EXTERNALS = ["@boundaryml/baml"];

/**
 * Common tsup overrides for production-like builds with optimization
 */
export const PRODUCTION_TSUP_OVERRIDES = {
    platform: "node",
    target: "node18",
    external: FULL_EXTERNALS,
    metafile: true
};

/**
 * Build the Fern CLI with the specified configuration
 * @param {Object} config - Build configuration
 * @param {string} config.outDir - Output directory (e.g., 'dist/prod', 'dist/dev')
 * @param {boolean} config.minify - Whether to minify the output
 * @param {Object} config.env - Environment variables to inject
 * @param {string[]} [config.runtimeDependencies] - List of runtime dependencies to include in package.json
 * @param {Object} [config.packageJsonOverrides] - Overrides for the generated package.json
 * @param {Object} [config.tsupOverrides] - Additional tsup configuration options
 */
export async function buildCli(config) {
    const {
        outDir,
        minify,
        env,
        runtimeDependencies = ["@boundaryml/baml"],
        packageJsonOverrides = {},
        tsupOverrides = {}
    } = config;
    const version = process.argv[2] || packageJson.version;

    // Build with tsup
    await tsup.build({
        entry: ["src/cli.ts"],
        format: ["cjs"],
        minify,
        outDir,
        sourcemap: true,
        clean: true,
        // Polyfill `navigator` before any bundled code runs.
        // Some browser-targeting packages (e.g. jspm process polyfill bundled into
        // @fern-api/fdr-sdk) access `navigator.language` at module-init time without
        // a `typeof` guard, causing a ReferenceError on Node.js < 21 where the
        // `navigator` global does not exist.
        banner: {
            js: `if (typeof globalThis.navigator === "undefined") { globalThis.navigator = { language: "en-US", userAgent: "node", platform: "linux" }; }`
        },
        env: {
            ...env,
            CLI_VERSION: version
        },
        ...tsupOverrides
    });

    const outDirAbs = path.join(__dirname, outDir);

    // Rewrite source map `sources` to repo-root-relative paths so Sentry
    // displays clean filenames (e.g. "packages/cli/cli/src/cli.ts") and a
    // single repo-root-based code mapping resolves every frame.
    await rewriteSourceMapSources(outDirAbs);

    // Collect runtime dependencies
    const dependencies = {};
    for (const dep of runtimeDependencies) {
        const version = getDependencyVersion(dep);
        if (version) {
            dependencies[dep] = version;
        }
    }

    // Validate that all required dependencies were found
    const missingDeps = runtimeDependencies.filter((dep) => !dependencies[dep]);
    if (missingDeps.length > 0) {
        throw new Error(
            `Missing required runtime dependencies in package.json: ${missingDeps.join(", ")}. ` +
                `These must be declared in either dependencies or devDependencies.`
        );
    }

    // Write package.json
    const outputPackageJson = {
        version,
        repository: packageJson.repository,
        files: ["cli.cjs"],
        dependencies,
        ...packageJsonOverrides
    };

    await writeFile(path.join(outDirAbs, "package.json"), JSON.stringify(outputPackageJson, undefined, 2));

    // Run npm pkg fix to format and fix the package.json
    await execAsync("npm pkg fix", { cwd: outDirAbs });
}
