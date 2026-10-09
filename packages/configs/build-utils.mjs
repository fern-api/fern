import { exec } from "child_process";
import { existsSync } from "fs";
import { cp, mkdir, readdir, readFile, rm, rmdir, writeFile } from "fs/promises";
import { minimatch } from "minimatch";
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
 *   - object: { from: '../base/src/asIs', to: 'dist/asIs', ignore?: string[] } - custom destination
 *     The optional `ignore` field is an array of glob patterns (minimatch syntax) evaluated
 *     against paths relative to `from`. Matching files and directories are skipped. A pattern
 *     that matches a directory prunes the entire subtree.
 *   - array of objects: [{ from: '...', to: '...', ignore?: [...] }, ...]
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
                // Object with from/to: custom destination, optional ignore globs.
                // We want mirror semantics — files removed from `from` should
                // disappear from `to` too, otherwise stale state accumulates
                // between rebuilds. `fs.cp` only adds/overwrites, so wipe the
                // destination first.
                const absoluteFrom = path.join(dirname, copyOp.from);
                const absoluteTo = path.join(dirname, copyOp.to);
                const ignorePatterns = Array.isArray(copyOp.ignore) ? copyOp.ignore : null;
                await rm(absoluteTo, { recursive: true, force: true });
                await cp(absoluteFrom, absoluteTo, {
                    recursive: true,
                    force: true,
                    filter: ignorePatterns == null ? undefined : makeIgnoreFilter(absoluteFrom, ignorePatterns)
                });
                if (ignorePatterns != null) {
                    // Filtering only prunes files. Parent directories whose entire
                    // contents were filtered out are left behind as empty dirs.
                    // Sweep them so the copied tree looks like a clean checkout.
                    await removeEmptyDirs(absoluteTo);
                }
            }
        }
    }
}

/**
 * Build a filter function for `fs.cp` that skips paths matching any of the
 * provided glob patterns. Patterns use minimatch syntax and are evaluated
 * against paths relative to `absoluteFrom` (POSIX-style separators). When a
 * directory matches, the entire subtree is pruned because `cp` does not
 * descend into it.
 *
 * @param {string} absoluteFrom - Absolute path of the source root
 * @param {string[]} patterns - Glob patterns to ignore (minimatch syntax)
 * @returns {(src: string) => boolean}
 */
function makeIgnoreFilter(absoluteFrom, patterns) {
    const matchOptions = { dot: true, matchBase: false };
    // For each `X/**` pattern, also treat `X` itself as ignored so `cp` skips
    // the whole subtree instead of descending into it and creating an empty
    // destination directory.
    const expanded = [];
    for (const pattern of patterns) {
        expanded.push(pattern);
        if (pattern.endsWith("/**")) {
            const trimmed = pattern.slice(0, -3);
            if (trimmed.length > 0) {
                expanded.push(trimmed);
            }
        }
    }
    return (src) => {
        if (src === absoluteFrom) {
            return true;
        }
        const relative = path.relative(absoluteFrom, src).split(path.sep).join("/");
        if (relative === "" || relative.startsWith("..")) {
            return true;
        }
        for (const pattern of expanded) {
            if (minimatch(relative, pattern, matchOptions)) {
                return false;
            }
        }
        return true;
    };
}

/**
 * Recursively remove empty directories under `root` (but leave `root` itself
 * even if it ends up empty). Runs depth-first so a directory only becomes a
 * removal candidate after its children have been processed.
 *
 * @param {string} root
 */
async function removeEmptyDirs(root) {
    if (!existsSync(root)) {
        return;
    }
    const walk = async (dir) => {
        let entries;
        try {
            entries = await readdir(dir, { withFileTypes: true });
        } catch {
            return false;
        }
        for (const entry of entries) {
            if (entry.isDirectory()) {
                await walk(path.join(dir, entry.name));
            }
        }
        const remaining = await readdir(dir);
        if (remaining.length === 0 && dir !== root) {
            await rmdir(dir);
            return true;
        }
        return false;
    };
    await walk(root);
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
