import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { existsSync, readFileSync } from "fs";
import { readdir, readFile, writeFile } from "fs/promises";
import path from "path";

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
    // Phase 1: Resolve tsconfig include/exclude paths and discover files within scope.
    // The old ts-morph implementation used project.getSourceFiles() which respects tsconfig
    // include/exclude. We replicate this by reading the tsconfig chain.
    const { includeDirs, excludeDirs } = resolveIncludeExcludeDirectories(pathToProject);
    const fileExistenceCache = new Set<string>();
    for (const dir of includeDirs) {
        await collectFiles(dir, fileExistenceCache, excludeDirs);
    }

    // Phase 2: Process each .ts file via string replacement
    const importModificationCache = new Map<string, ImportModificationType>();

    const tsFiles = [...fileExistenceCache].filter((f) => f.endsWith(".ts"));

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

// Regex for static imports/exports: from "./path" or from '../path'
// Matches import/export declarations like: import { x } from "./foo" or export * from "../bar"
const STATIC_IMPORT_REGEX = /(from\s+["'])(\.\.?\/[^"']*?)(["'])/g;

// Regex for dynamic imports: import("./path") or import('./path')
const DYNAMIC_IMPORT_REGEX = /(import\(\s*["'])(\.\.?\/[^"']*?)(["']\s*\))/g;

function fixImportsInSource(
    content: string,
    filePath: string,
    fileExistenceCache: Set<string>,
    importModificationCache: Map<string, ImportModificationType>
): string {
    let result = content;

    // Fix static imports/exports
    result = result.replace(STATIC_IMPORT_REGEX, (match, prefix: string, specifier: string, suffix: string) => {
        if (specifier.endsWith(".js")) {
            return match;
        }
        const modification = getCachedModification(specifier, filePath, fileExistenceCache, importModificationCache);
        if (modification !== ImportModification.NONE) {
            return prefix + getModifiedSpecifier(specifier, modification) + suffix;
        }
        return match;
    });

    // Fix dynamic imports
    result = result.replace(DYNAMIC_IMPORT_REGEX, (match, prefix: string, specifier: string, suffix: string) => {
        if (specifier.endsWith(".js")) {
            return match;
        }
        const modification = getCachedModification(specifier, filePath, fileExistenceCache, importModificationCache);
        if (modification !== ImportModification.NONE) {
            return prefix + getModifiedSpecifier(specifier, modification) + suffix;
        }
        return match;
    });

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

// Recursively collect all .ts and .js file paths, respecting exclude directories
async function collectFiles(dir: string, files: Set<string>, excludeDirs: string[]): Promise<void> {
    const resolvedDir = path.resolve(dir);
    if (excludeDirs.some((excl) => resolvedDir === excl || resolvedDir.startsWith(excl + path.sep))) {
        return;
    }
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === "node_modules" || entry.name === ".git") {
                continue;
            }
            await collectFiles(fullPath, files, excludeDirs);
        } else if (entry.name.endsWith(".ts") || entry.name.endsWith(".js")) {
            files.add(path.resolve(fullPath));
        }
    }
}

interface IncludeExclude {
    includeDirs: string[];
    excludeDirs: string[];
}

// Resolve the tsconfig.json "include" and "exclude" directories, following the "extends" chain.
// Returns absolute directory paths. Falls back to the project root if no include is found.
function resolveIncludeExcludeDirectories(projectPath: string): IncludeExclude {
    const tsconfigPath = path.join(projectPath, "tsconfig.json");
    const result = resolveFromTsconfig(tsconfigPath);

    return {
        includeDirs:
            result.include.length > 0 ? result.include.map((inc) => path.resolve(projectPath, inc)) : [projectPath],
        excludeDirs: result.exclude.map((excl) => path.resolve(projectPath, excl))
    };
}

// Walk the tsconfig extends chain to collect include/exclude arrays.
// TypeScript merges: child "include" overrides parent "include", same for "exclude".
function resolveFromTsconfig(tsconfigPath: string): { include: string[]; exclude: string[] } {
    if (!existsSync(tsconfigPath)) {
        return { include: [], exclude: [] };
    }

    try {
        const raw = JSON.parse(readFileSync(tsconfigPath, "utf-8"));

        // Start with parent values if extending
        let parentResult = { include: [] as string[], exclude: [] as string[] };
        if (typeof raw.extends === "string") {
            const extendsPath = path.resolve(path.dirname(tsconfigPath), raw.extends);
            parentResult = resolveFromTsconfig(extendsPath);
        }

        // Child arrays override parent arrays (TypeScript behavior)
        const include = Array.isArray(raw.include) ? (raw.include as string[]) : parentResult.include;
        const exclude = Array.isArray(raw.exclude) ? (raw.exclude as string[]) : parentResult.exclude;

        return { include, exclude };
    } catch {
        return { include: [], exclude: [] };
    }
}
