import { exec } from "child_process";
import { writeFile } from "fs/promises";
import path from "path";
import tsup from "tsup";
import { fileURLToPath } from "url";
import { promisify } from "util";
import packageJson from "./package.json" with { type: "json" };

const execAsync = promisify(exec);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
 * Build the Fern CLI v2 with the specified configuration
 * @param {Object} config - Build configuration
 * @param {string} config.outDir - Output directory (e.g., 'dist/prod', 'dist/dev')
 * @param {boolean} config.minify - Whether to minify the output
 * @param {Object} [config.env] - Environment variables to inject
 * @param {string[]} [config.runtimeDependencies] - List of runtime dependencies to include in package.json
 * @param {Object} [config.packageJsonOverrides] - Overrides for the generated package.json
 * @param {Object} [config.tsupOverrides] - Additional tsup configuration options
 */
export async function buildCli(config) {
    const {
        outDir,
        minify,
        env = {},
        runtimeDependencies = [],
        packageJsonOverrides = {},
        tsupOverrides = {}
    } = config;

    const version = process.argv[2] || packageJson.version;

    // Build with tsup
    await tsup.build({
        entry: { cli: "src/main.ts" },
        format: ["cjs"],
        minify,
        outDir,
        sourcemap: true,
        clean: true,
        env: {
            ...env,
            CLI_VERSION: version
        },
        ...tsupOverrides
    });

    const outDirAbs = path.join(__dirname, outDir);

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
        version: process.argv[2] || packageJson.version,
        repository: packageJson.repository,
        files: ["cli.cjs"],
        ...(Object.keys(dependencies).length > 0 && { dependencies }),
        ...packageJsonOverrides
    };

    await writeFile(path.join(outDirAbs, "package.json"), JSON.stringify(outputPackageJson, undefined, 2));

    // Run npm pkg fix to format and fix the package.json
    await execAsync("npm pkg fix", { cwd: outDirAbs });
}

/**
 * Build the tiny completion helper binary (complete.cjs).
 *
 * This bundles only completion-main.ts → complete.cjs, which is ~200KB
 * instead of the full 29MB CLI bundle. The shell completion script calls
 * this binary directly for content-aware flag completions so TAB is fast.
 *
 * @param {Object} config
 * @param {string} config.outDir - Output directory (same as the CLI build)
 * @param {boolean} config.minify - Whether to minify the output
 */
export async function buildCompletionHelper({ outDir, minify }) {
    await tsup.build({
        entry: { complete: "src/completion-main.ts" },
        format: ["cjs"],
        minify,
        outDir,
        sourcemap: true,
        clean: false,
        platform: "node",
        target: "node18"
    });
}
