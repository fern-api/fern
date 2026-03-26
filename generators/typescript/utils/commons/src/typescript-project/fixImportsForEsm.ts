import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { readdir, readFile, writeFile } from "fs/promises";
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
    const fileExistenceCache = new Set<string>();
    const srcDir = join(pathToProject, RelativeFilePath.of("src"));
    await collectFiles(srcDir, fileExistenceCache);

    // Phase 2: Process each TypeScript file via string replacement
    const importModificationCache = new Map<string, ImportModificationType>();

    const tsFiles = [...fileExistenceCache].filter((f) => {
        const ext = path.extname(f);
        return TS_EXTENSIONS.has(ext);
    });

    // Process in parallel batches for I/O throughput
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

// Regex for static imports/exports: from "./path" or from '../path'
// Also handles side-effect imports: import "./path" or import './path'
const STATIC_IMPORT_REGEX = /(?:from|import)\s+["'](\.\.?\/[^"']*?)["']/g;

// Regex for dynamic imports: import("./path") or import('./path')
const DYNAMIC_IMPORT_REGEX = /import\(\s*["'](\.\.?\/[^"']*?)["']\s*\)/g;

function fixImportsInSource(
    content: string,
    filePath: string,
    fileExistenceCache: Set<string>,
    importModificationCache: Map<string, ImportModificationType>
): string {
    // Strip comments to find where real imports are, then apply
    // replacements to the original content using the positions from the stripped version.
    const stripped = stripComments(content);

    let result = content;
    // Track offset shifts from replacements so far
    let offset = 0;

    // Collect all matches from the stripped source (comments/strings removed)
    const matches: Array<{ specifier: string; specifierStart: number; specifierEnd: number }> = [];

    let match: RegExpExecArray | null;

    // Find static import/export matches
    STATIC_IMPORT_REGEX.lastIndex = 0;
    while ((match = STATIC_IMPORT_REGEX.exec(stripped)) !== null) {
        const fullMatch = match[0];
        const specifier = match[1];
        if (specifier == null) {
            continue;
        }
        const quoteChar = fullMatch.charAt(fullMatch.indexOf(specifier) - 1);
        const specifierStart = match.index + fullMatch.indexOf(quoteChar + specifier) + 1;
        const specifierEnd = specifierStart + specifier.length;
        matches.push({ specifier, specifierStart, specifierEnd });
    }

    // Find dynamic import matches
    DYNAMIC_IMPORT_REGEX.lastIndex = 0;
    while ((match = DYNAMIC_IMPORT_REGEX.exec(stripped)) !== null) {
        const fullMatch = match[0];
        const specifier = match[1];
        if (specifier == null) {
            continue;
        }
        const quoteChar = fullMatch.charAt(fullMatch.indexOf(specifier) - 1);
        const specifierStart = match.index + fullMatch.indexOf(quoteChar + specifier) + 1;
        const specifierEnd = specifierStart + specifier.length;
        matches.push({ specifier, specifierStart, specifierEnd });
    }

    // Sort by position to apply replacements in order
    matches.sort((a, b) => a.specifierStart - b.specifierStart);

    for (const { specifier, specifierStart, specifierEnd } of matches) {
        if (specifier.endsWith(".js")) {
            continue;
        }
        const modification = getCachedModification(specifier, filePath, fileExistenceCache, importModificationCache);
        if (modification !== ImportModification.NONE) {
            const newSpecifier = getModifiedSpecifier(specifier, modification);
            const adjustedStart = specifierStart + offset;
            const adjustedEnd = specifierEnd + offset;
            result = result.slice(0, adjustedStart) + newSpecifier + result.slice(adjustedEnd);
            offset += newSpecifier.length - specifier.length;
        }
    }

    return result;
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

// Recursively collect all source file paths, skipping node_modules and .git
async function collectFiles(dir: string, files: Set<string>): Promise<void> {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === "node_modules" || entry.name === ".git") {
                continue;
            }
            await collectFiles(fullPath, files);
        } else {
            const ext = path.extname(entry.name);
            if (ALL_EXTENSIONS.has(ext)) {
                files.add(path.resolve(fullPath));
            }
        }
    }
}
