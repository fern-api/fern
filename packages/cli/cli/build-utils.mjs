import { exec } from "child_process";
import { readFileSync } from "fs";
import { writeFile } from "fs/promises";
import path from "path";
import tsup from "tsup";
import { fileURLToPath } from "url";
import { promisify } from "util";
import packageJson from "./package.json" with { type: "json" };

const execAsync = promisify(exec);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Parse the pnpm-workspace.yaml catalog section to resolve catalog: references.
 * This is a lightweight parser that handles the simple `key: value` format used in the catalog.
 */
function loadPnpmCatalog() {
    const workspaceRoot = path.resolve(__dirname, "../../..");
    const workspacePath = path.join(workspaceRoot, "pnpm-workspace.yaml");
    try {
        const content = readFileSync(workspacePath, "utf-8");
        const catalog = {};
        let inCatalog = false;
        for (const line of content.split("\n")) {
            if (/^catalog:/.test(line)) {
                inCatalog = true;
                continue;
            }
            if (inCatalog) {
                // Stop when we hit a non-indented line (new top-level key)
                if (line.length > 0 && !line.startsWith(" ") && !line.startsWith("\t")) {
                    break;
                }
                const match = line.match(/^\s+["']?([^"':]+)["']?:\s*["']?([^"'\s]+)["']?/);
                if (match) {
                    catalog[match[1]] = match[2];
                }
            }
        }
        return catalog;
    } catch {
        return {};
    }
}

const pnpmCatalog = loadPnpmCatalog();

/**
 * Get a dependency version from package.json, preferring dependencies over devDependencies.
 * Resolves pnpm catalog: references to actual version specifiers.
 */
function getDependencyVersion(packageName) {
    const version = packageJson.dependencies?.[packageName] ?? packageJson.devDependencies?.[packageName];
    if (version === "catalog:" || version === "catalog:default") {
        const catalogVersion = pnpmCatalog[packageName];
        if (!catalogVersion) {
            throw new Error(
                `Dependency "${packageName}" uses catalog: but was not found in pnpm-workspace.yaml catalog`
            );
        }
        return catalogVersion;
    }
    return version;
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
