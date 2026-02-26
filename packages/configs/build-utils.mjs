import nodePolyfills from "@rolldown/plugin-node-polyfills";
import { exec } from "child_process";
import { existsSync, readdirSync } from "fs";
import { cp, mkdir, readdir, rm, writeFile } from "fs/promises";
import path from "path";
import { build } from "tsdown";
import { fileURLToPath } from "url";
import { promisify } from "util";

const execAsync = promisify(exec);

function findPackageInNodeModules(startDir, packageName) {
    let dir = startDir;
    while (dir !== path.dirname(dir)) {
        const candidate = path.join(dir, "node_modules", packageName);
        if (existsSync(candidate)) {
            return candidate;
        }
        const pnpmDir = path.join(dir, "node_modules", ".pnpm");
        if (existsSync(pnpmDir)) {
            try {
                const entries = readdirSync(pnpmDir);
                for (const entry of entries) {
                    if (entry.startsWith(`${packageName}@`)) {
                        const nested = path.join(pnpmDir, entry, "node_modules", packageName);
                        if (existsSync(nested)) {
                            return nested;
                        }
                    }
                }
            } catch (_e) {
                // Continue searching up
            }
        }
        dir = path.dirname(dir);
    }
    return null;
}

/**
 * Standard build function for Fern generators
 * @param {string} dirname - The __dirname of the calling build.mjs file
 * @param {Object} options - Build options
 * @param {string} [options.entry='src/cli.ts'] - Entry point for tsdown
 * @param {Object} [options.tsdownOptions={}] - Additional tsdown configuration options to merge
 * @param {string|string[]|Object|Object[]|null} [options.copy=null] - Files/folders to copy after build
 *   Can be:
 *   - string: '../base/src/asIs' - copies to dist/
 *   - array of strings: ['../base/src/asIs', '../base/src/template'] - copies each to dist/
 *   - object: { from: '../base/src/asIs', to: 'dist/asIs' } - custom destination
 *   - array of objects: [{ from: '...', to: '...' }, ...]
 * @param {string[]} [options.copyNativeModules=[]] - Package names with native .node files to copy to dist
 */
export async function buildGenerator(dirname, options = {}) {
    const { entry = "src/cli.ts", tsdownOptions = {}, copy = null, copyNativeModules = [] } = options;

    // Build with tsdown (merge default options with custom ones)
    const defaultTsdownOptions = {
        entry: [entry],
        format: ["cjs"],
        sourcemap: true,
        clean: true,
        inlineOnly: false,
        outputOptions: {
            codeSplitting: false
        },
        inputOptions: {
            resolve: {
                conditionNames: ["development", "source", "import", "default"]
            }
        },
        outDir: "dist"
    };

    await build({
        ...defaultTsdownOptions,
        ...tsdownOptions
    });

    // Copy additional files if needed
    if (copy) {
        const copyOperations = Array.isArray(copy) ? copy : [copy];

        for (const copyOp of copyOperations) {
            if (typeof copyOp === "string") {
                // Simple string: copy to dist/
                await cp(path.join(dirname, copyOp), path.join(dirname, "dist"), { recursive: true });
            } else if (typeof copyOp === "object" && copyOp.from) {
                // Object with from/to: custom destination
                await cp(path.join(dirname, copyOp.from), path.join(dirname, copyOp.to), {
                    recursive: true,
                    force: true
                });
            }
        }
    }

    if (copyNativeModules.length > 0) {
        const outDir = tsdownOptions.outDir || defaultTsdownOptions.outDir;
        for (const moduleName of copyNativeModules) {
            const moduleDir = findPackageInNodeModules(dirname, moduleName);
            if (moduleDir) {
                const files = await readdir(moduleDir);
                for (const file of files) {
                    if (file.endsWith(".node")) {
                        await cp(path.join(moduleDir, file), path.join(dirname, outDir, file));
                    }
                }
            }
        }
    }
}

/**
 * Helper to get __dirname in ESM modules
 * @param {string} importMetaUrl - import.meta.url from the calling module
 * @returns {string} The directory name
 */
export function getDirname(importMetaUrl) {
    return path.dirname(fileURLToPath(importMetaUrl));
}

/**
 * Build function for dynamic snippets packages
 * Creates both CJS and ESM outputs with proper package.json exports
 * @param {string} dirname - The __dirname of the calling build.mjs file
 * @param {Object} packageJson - The package.json contents
 * @param {string} [versionOverride] - Optional version override from CLI args
 */
export async function buildDynamicSnippets(dirname, packageJson, versionOverride) {
    const distDir = path.join(dirname, "dist");
    const srcDir = path.join(dirname, "src");
    const tsconfigPath = path.join(dirname, "build.tsconfig.json");

    await rm(distDir, { recursive: true, force: true });
    await mkdir(distDir, { recursive: true });

    await build({
        entry: [path.join(srcDir, "index.ts")],
        target: "es2020",
        minify: true,
        dts: true,
        sourcemap: true,
        platform: "browser",
        inlineOnly: false,
        outputOptions: {
            codeSplitting: false
        },
        // Mark fs and crypto as external - they can't be polyfilled for browser
        // The polyfill plugin provides empty shims that don't export the needed functions
        // By marking as external, Node.js environments can use real fs/crypto
        // Browser environments will fail at require() time with a clear error
        external: ["fs", "crypto"],
        plugins: [nodePolyfills()],
        tsconfig: tsconfigPath,
        format: ["cjs", "esm"],
        outDir: path.join(distDir, "dist"),
        clean: false
    });

    // Write package.json to dist directory
    await writeFile(
        path.join(distDir, "package.json"),
        JSON.stringify(
            {
                name: packageJson.name,
                version: versionOverride || packageJson.version,
                repository: packageJson.repository,
                type: "module",
                exports: {
                    import: {
                        types: "./dist/index.d.ts",
                        default: "./dist/index.js"
                    },
                    require: {
                        types: "./dist/index.d.cts",
                        default: "./dist/index.cjs"
                    }
                },
                main: "./dist/index.cjs",
                module: "./dist/index.js",
                types: "./dist/index.d.cts",
                files: ["dist"]
            },
            undefined,
            2
        )
    );

    // Run npm pkg fix to format and fix the package.json
    await execAsync("npm pkg fix", { cwd: distDir });
}
