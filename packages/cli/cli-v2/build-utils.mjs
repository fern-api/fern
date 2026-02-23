import { exec } from "child_process";
import { readFileSync } from "fs";
import { writeFile } from "fs/promises";
import path from "path";
import tsup from "tsup";
import { fileURLToPath } from "url";
import { promisify } from "util";
import YAML from "yaml";
import packageJson from "./package.json" with { type: "json" };

const execAsync = promisify(exec);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read the pnpm catalog from pnpm-workspace.yaml to resolve "catalog:" references
const workspaceYamlPath = path.join(__dirname, "../../../pnpm-workspace.yaml");
const workspaceYaml = YAML.parse(readFileSync(workspaceYamlPath, "utf-8"));
const pnpmCatalog = workspaceYaml.catalog ?? {};

/**
 * Resolve a version string, replacing pnpm "catalog:" protocol references
 * with the actual version from the pnpm-workspace.yaml catalog.
 */
function resolveCatalogVersion(packageName, version) {
    if (version === "catalog:") {
        const catalogVersion = pnpmCatalog[packageName];
        if (!catalogVersion) {
            throw new Error(
                `Package "${packageName}" uses "catalog:" protocol but is not defined in the pnpm-workspace.yaml catalog.`
            );
        }
        return catalogVersion;
    }
    return version;
}

/**
 * Get a dependency version from package.json, preferring dependencies over devDependencies.
 * Resolves pnpm "catalog:" protocol references to actual versions.
 */
function getDependencyVersion(packageName) {
    const version = packageJson.dependencies?.[packageName] ?? packageJson.devDependencies?.[packageName];
    if (version == null) {
        return undefined;
    }
    return resolveCatalogVersion(packageName, version);
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
            CLI_VERSION: process.argv[2] || packageJson.version
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
