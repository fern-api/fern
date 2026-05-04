import { exec } from "child_process";
import { existsSync } from "fs";
import { cp, mkdir, readdir, readFile, rm, writeFile } from "fs/promises";
import path from "path";
import tsup from "tsup";
import { fileURLToPath } from "url";
import { promisify } from "util";

const execAsync = promisify(exec);

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

/**
 * Rewrite every .map file in absOutDir so each entry in `sources` is a clean
 * path relative to the repo root (e.g. "packages/cli/cli/src/cli.ts") instead
 * of a relative path like "../../src/cli.ts". This gives Sentry a tidy,
 * already-normalised filename to display and lets a single repo-root-based
 * code mapping resolve every frame regardless of package depth.
 */
export async function rewriteSourceMapSources(absOutDir) {
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
 * Standard build function for Fern generators
 * @param {string} dirname - The __dirname of the calling build.mjs file
 * @param {Object} options - Build options
 * @param {string} [options.entry='src/cli.ts'] - Entry point for tsup
 * @param {Object} [options.tsupOptions={}] - Additional tsup configuration options to merge
 * @param {string|string[]|Object|Object[]|null} [options.copy=null] - Files/folders to copy after build
 *   Can be:
 *   - string: '../base/src/asIs' - copies to dist/
 *   - array of strings: ['../base/src/asIs', '../base/src/template'] - copies each to dist/
 *   - object: { from: '../base/src/asIs', to: 'dist/asIs' } - custom destination
 *   - array of objects: [{ from: '...', to: '...' }, ...]
 */
export async function buildGenerator(dirname, options = {}) {
    const { entry = "src/cli.ts", tsupOptions = {}, copy = null } = options;

    const outDir = tsupOptions.outDir ?? "dist";

    // Build with tsup (merge default options with custom ones)
    // Keep @boundaryml/baml external so esbuild does not try to bundle its
    // platform-specific native .node files (transitive dep via generator-cli).
    const defaultTsupOptions = {
        entry: [entry],
        format: ["cjs"],
        sourcemap: true,
        clean: true,
        outDir,
        external: ["@boundaryml/baml"]
    };

    await tsup.build({
        ...defaultTsupOptions,
        ...tsupOptions
    });

    // Rewrite source map paths to be repo-root-relative so Sentry displays
    // "packages/foo/src/bar.ts" instead of "../../../foo/src/bar.ts".
    await rewriteSourceMapSources(path.join(dirname, outDir));

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

    // Import polyfillNode dynamically
    const { polyfillNode } = await import("esbuild-plugin-polyfill-node");

    await tsup.build({
        entry: [path.join(srcDir, "index.ts")],
        target: "es2020",
        minify: true,
        dts: true,
        sourcemap: true,
        esbuildPlugins: [
            polyfillNode({
                globals: {
                    buffer: true,
                    process: true
                },
                polyfills: {
                    fs: false,
                    crypto: false
                }
            })
        ],
        tsconfig: tsconfigPath,
        format: ["cjs", "esm"],
        outDir: path.join(distDir, "dist"), // yes, this is intentional to have dist/dist
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
