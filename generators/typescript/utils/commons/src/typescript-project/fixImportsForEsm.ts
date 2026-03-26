import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { existsSync } from "fs";
import { readdir, readFile, writeFile } from "fs/promises";
import type { Volume } from "memfs/lib/volume";
import path from "path";

// File extensions to collect for the existence cache and to process
const TS_EXTENSIONS = new Set([".ts", ".tsx", ".mts", ".cts"]);
const ALL_EXTENSIONS = new Set([...TS_EXTENSIONS, ".js", ".jsx", ".mjs", ".cjs"]);

// Define the possible import modifications
const ImportModification = {
    NONE: "none",
    ADD_JS_EXTENSION: "add_js_extension",
    REPLACE_TS_WITH_JS: "replace_ts_with_js",
    ADD_INDEX_JS: "add_index_js"
} as const;

type ImportModificationType = (typeof ImportModification)[keyof typeof ImportModification];

/**
 * Fixes imports in a TypeScript project to ensure compatibility with ESM (ECMAScript Modules).
 *
 * TypeScript's `tsc` compiler does not generate valid ESM unless the source code follows specific conventions:
 * - All imports must include the `.js` extension.
 * - Folder imports must explicitly reference `index.js`.
 *
 * This function modifies the imports in the project to adhere to these conventions by:
 * - Adding `.js` extensions to imports where necessary.
 * - Replacing folder imports with explicit `index.js` imports.
 * - Ensuring compatibility with the generated ESM output.
 *
 * Uses string-based regex replacement instead of ts-morph AST mutations for performance.
 * On a 10K-file project (Stripe), this completes in ~7s vs ~372s with ts-morph.
 *
 * @param pathToProject - The absolute path to the root of the TypeScript project.
 */
export async function fixImportsForEsm(pathToProject: AbsoluteFilePath): Promise<void> {
    // Phase 1: Discover all source files in the project's src/ directory.
    // Generated TypeScript projects always use `include: ["src"]` in their tsconfig,
    // so we scan src/ directly. This avoids the complexity and fragility of parsing
    // tsconfig include/exclude (which can contain globs, JSONC comments, extends
    // chains, etc.) while matching the original ts-morph scoping behavior.
    const srcDir = join(pathToProject, RelativeFilePath.of("src"));
    const fileExistenceCache = await collectFiles(srcDir);

    // Phase 2: Process each TypeScript file via string replacement
    const importModificationCache = new Map<string, ImportModificationType>();

    const tsFiles: string[] = [];
    for (const f of fileExistenceCache) {
        if (TS_EXTENSIONS.has(path.extname(f))) {
            tsFiles.push(f);
        }
    }

    // Process files in batches to balance parallelism with I/O backpressure.
    // Unbounded Promise.all on 10K+ files causes slower throughput due to
    // excessive concurrent I/O; batching at 100 keeps the event loop responsive.
    const BATCH_SIZE = 100;
    for (let i = 0; i < tsFiles.length; i += BATCH_SIZE) {
        const batch = tsFiles.slice(i, i + BATCH_SIZE);
        await Promise.all(
            batch.map(async (filePath) => {
                const content = await readFile(filePath, "utf-8");
                const newContent = fixImportsInSource(content, filePath, fileExistenceCache, importModificationCache);
                if (newContent !== content) {
                    await writeFile(filePath, newContent);
                }
            })
        );
    }
}

/**
 * Strips single-line comments (// ...) and multi-line comments (/* ... *\/)
 * from source text, replacing them with whitespace of equal length so that
 * character positions are preserved. This ensures that regex-based import
 * matching only operates on actual code, not on patterns that happen to
 * appear inside comments.
 *
 * Note: String literals are intentionally NOT stripped. The import-matching
 * regexes require `from`/`import` keywords before the string, which is
 * sufficient to avoid false positives from non-import strings.
 */
function stripComments(source: string): string {
    const pattern = /\/\/[^\n]*|\/\*[\s\S]*?\*\//g;
    return source.replace(pattern, (match) => " ".repeat(match.length));
}

// Combined regex for both static and dynamic imports in a single pass.
// Group 1: static import specifier (from "..." / import "...")
// Group 2: dynamic import specifier (import("..."))
// Using a single regex eliminates one full-text scan and the need to sort matches,
// since exec() already yields matches in document order.
const IMPORT_REGEX = /(?:from|import)\s+["'](\.\.?\/[^"']*?)["']|import\(\s*["'](\.\.?\/[^"']*?)["']\s*\)/g;

/**
 * Fixes import specifiers in a single source file's content string.
 * Exported so callers can apply this to in-memory content without disk I/O.
 */
export function fixImportsInSource(
    content: string,
    filePath: string,
    fileExistenceCache: Set<string>,
    importModificationCache: Map<string, ImportModificationType>
): string {
    // Fast path: skip files with no relative imports at all
    if (!content.includes("./") && !content.includes("../")) {
        return content;
    }

    // Strip comments so regex doesn't match patterns inside comments.
    // Skip the strip pass entirely if there are no comment markers.
    const hasComments = content.includes("//") || content.includes("/*");
    const stripped = hasComments ? stripComments(content) : content;

    // Single-pass: collect matches and build result using a string builder
    // to avoid O(n*m) copying from repeated slice+concat.
    const parts: string[] = [];
    let lastEnd = 0;

    let match: RegExpExecArray | null;
    IMPORT_REGEX.lastIndex = 0;
    while ((match = IMPORT_REGEX.exec(stripped)) !== null) {
        // Group 1 = static import specifier, Group 2 = dynamic import specifier
        const specifier = match[1] ?? match[2];
        if (specifier == null || specifier.endsWith(".js")) {
            continue;
        }

        const modification = getCachedModification(specifier, filePath, fileExistenceCache, importModificationCache);
        if (modification === ImportModification.NONE) {
            continue;
        }

        // Locate the specifier within the full match to get its absolute position
        const fullMatch = match[0];
        const quoteChar = fullMatch.charAt(fullMatch.indexOf(specifier) - 1);
        const specifierStart = match.index + fullMatch.indexOf(quoteChar + specifier) + 1;
        const specifierEnd = specifierStart + specifier.length;

        // Append everything from the last replacement end to the start of this specifier,
        // then append the modified specifier.
        parts.push(content.slice(lastEnd, specifierStart));
        parts.push(getModifiedSpecifier(specifier, modification));
        lastEnd = specifierEnd;
    }

    // If no replacements were made, return the original content (avoids allocation)
    if (parts.length === 0) {
        return content;
    }

    // Append the remainder of the file
    parts.push(content.slice(lastEnd));
    return parts.join("");
}

function getCachedModification(
    moduleSpecifier: string,
    currentFilePath: string,
    fileExistenceCache: Set<string>,
    importModificationCache: Map<string, ImportModificationType>
): ImportModificationType {
    const normalizedPath = getNormalizedPath(moduleSpecifier, currentFilePath);
    let modification = importModificationCache.get(normalizedPath);
    if (modification === undefined) {
        modification = determineModification(moduleSpecifier, currentFilePath, fileExistenceCache);
        importModificationCache.set(normalizedPath, modification);
    }
    return modification;
}

// Get the modified import specifier based on modification type
function getModifiedSpecifier(moduleSpecifier: string, modification: ImportModificationType): string {
    switch (modification) {
        case ImportModification.ADD_INDEX_JS:
            return `${moduleSpecifier}/index.js`;
        case ImportModification.ADD_JS_EXTENSION:
            return `${moduleSpecifier}.js`;
        case ImportModification.REPLACE_TS_WITH_JS:
            return moduleSpecifier.slice(0, -3) + ".js";
        default:
            return moduleSpecifier;
    }
}

// Get a normalized path for consistent cache keys
function getNormalizedPath(moduleSpecifier: string, currentFilePath: string): string {
    const currentDir = path.dirname(currentFilePath);
    return join(AbsoluteFilePath.of(currentDir), RelativeFilePath.of(moduleSpecifier)).toString();
}

// Determine import modification using file existence heuristics
function determineModification(
    moduleSpecifier: string,
    currentFilePath: string,
    fileExistenceCache: Set<string>
): ImportModificationType {
    // Case 1: Import with explicit .ts extension
    if (moduleSpecifier.endsWith(".ts")) {
        return ImportModification.REPLACE_TS_WITH_JS;
    }

    const currentDir = path.dirname(currentFilePath);

    // Case 2: Directory import with index file
    const dirPath = join(AbsoluteFilePath.of(currentDir), RelativeFilePath.of(moduleSpecifier));

    if (
        fileExistenceCache.has(join(dirPath, RelativeFilePath.of("index.ts")).toString()) ||
        fileExistenceCache.has(join(dirPath, RelativeFilePath.of("index.js")).toString())
    ) {
        return ImportModification.ADD_INDEX_JS;
    }

    // Case 3: Regular .ts file import
    const tsFilePath = join(AbsoluteFilePath.of(currentDir), RelativeFilePath.of(moduleSpecifier + ".ts")).toString();

    if (fileExistenceCache.has(tsFilePath)) {
        return ImportModification.ADD_JS_EXTENSION;
    }

    return ImportModification.NONE;
}

/**
 * Fixes imports in-memory inside a memfs Volume before writing to disk.
 * This eliminates the disk read+write round-trip that fixImportsForEsm performs,
 * since the files are already in memory. Uses synchronous Volume APIs for speed.
 *
 * @param volume - The memfs Volume containing the project files.
 * @param packagePath - The source directory path within the volume (e.g. "src").
 */
export function fixImportsInVolume(volume: Volume, packagePath: string): void {
    const srcDir = "/" + packagePath;

    // Phase 1: Collect all source file paths from the volume.
    // Core utility files should already be in the Volume (via copyCoreUtilitiesToVolume)
    // so their paths are included in the existence cache automatically.
    const volumeFiles = new Set<string>();
    collectVolumeFilesSync(volume, srcDir, volumeFiles);

    const fileExistenceCache = new Set<string>(volumeFiles);

    // Phase 2: Process each TypeScript file in the volume via string replacement.
    const importModificationCache = new Map<string, ImportModificationType>();

    for (const filePath of volumeFiles) {
        if (!TS_EXTENSIONS.has(path.extname(filePath))) {
            continue;
        }
        const contentBuf = volume.readFileSync(filePath, "utf-8");
        const content = typeof contentBuf === "string" ? contentBuf : contentBuf.toString();
        const newContent = fixImportsInSource(content, filePath, fileExistenceCache, importModificationCache);
        if (newContent !== content) {
            volume.writeFileSync(filePath, newContent);
        }
    }
}

function collectVolumeFilesSync(volume: Volume, dir: string, files: Set<string>): void {
    const entries = volume.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        // readdirSync with withFileTypes returns objects with name and isDirectory()
        const dirent = entry as { name: string | Buffer; isDirectory(): boolean };
        const name = typeof dirent.name === "string" ? dirent.name : dirent.name.toString();
        const fullPath = path.join(dir, name);
        if (dirent.isDirectory()) {
            collectVolumeFilesSync(volume, fullPath, files);
        } else {
            const ext = path.extname(name);
            if (ALL_EXTENSIONS.has(ext)) {
                files.add(path.resolve(fullPath));
            }
        }
    }
}

/**
 * Fixes imports in files written to disk after persist(). Scans the given directories
 * recursively, plus any shallow (non-recursive) .ts files in shallowDirs. This is much
 * faster than scanning the entire project tree since generated source files were already
 * processed in-memory during persist() and would be no-ops.
 *
 * @param dirs - Directories to scan recursively (e.g. ["src/core"]).
 * @param shallowDirs - Directories to scan non-recursively for top-level .ts files only
 *                      (e.g. ["src"] for exports.ts, index.ts written by generatePublicExports).
 */
export async function fixImportsForCoreFiles(dirs: string[], shallowDirs: string[] = []): Promise<void> {
    // Build existence cache from the specified directories
    const fileExistenceCache = new Set<string>();
    const filesToProcess = new Set<string>();

    // Recursively collect from dirs (skip directories that don't exist)
    await Promise.all(
        dirs.filter((dir) => existsSync(dir)).map((dir) => collectFilesRecursive(dir, fileExistenceCache))
    );
    for (const f of fileExistenceCache) {
        filesToProcess.add(f);
    }

    // Collect shallow (top-level only) files from shallowDirs
    for (const dir of shallowDirs) {
        if (!existsSync(dir)) {
            continue;
        }
        const entries = await readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            if (!entry.isDirectory()) {
                const ext = path.extname(entry.name);
                if (ALL_EXTENSIONS.has(ext)) {
                    const fullPath = path.resolve(path.join(dir, entry.name));
                    fileExistenceCache.add(fullPath);
                    filesToProcess.add(fullPath);
                }
            }
        }
    }

    // Process each TypeScript file
    const importModificationCache = new Map<string, ImportModificationType>();

    for (const filePath of filesToProcess) {
        if (!TS_EXTENSIONS.has(path.extname(filePath))) {
            continue;
        }
        const content = await readFile(filePath, "utf-8");
        const newContent = fixImportsInSource(content, filePath, fileExistenceCache, importModificationCache);
        if (newContent !== content) {
            await writeFile(filePath, newContent);
        }
    }
}

// Recursively collect all source file paths, parallelizing subdirectory traversal.
async function collectFiles(dir: string): Promise<Set<string>> {
    const files = new Set<string>();
    await collectFilesRecursive(dir, files);
    return files;
}

async function collectFilesRecursive(dir: string, files: Set<string>): Promise<void> {
    const entries = await readdir(dir, { withFileTypes: true });
    const subdirs: Promise<void>[] = [];
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name !== "node_modules" && entry.name !== ".git") {
                subdirs.push(collectFilesRecursive(fullPath, files));
            }
        } else {
            const ext = path.extname(entry.name);
            if (ALL_EXTENSIONS.has(ext)) {
                files.add(path.resolve(fullPath));
            }
        }
    }
    await Promise.all(subdirs);
}
