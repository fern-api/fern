import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { readdir, readFile, writeFile } from "fs/promises";
import path from "path";

/**
 * Fixes imports in a TypeScript project to ensure compatibility with ESM (ECMAScript Modules).
 *
 * TypeScript's `tsc` compiler does not generate valid ESM unless the source code follows specific conventions:
 * - All imports must include the `.js` extension.
 * - Folder imports must explicitly reference `index.js`.
 *
 * This implementation uses fast text-based processing instead of ts-morph AST parsing.
 * Files are processed in parallel batches for better I/O throughput.
 *
 * @param pathToProject - The absolute path to the root of the TypeScript project.
 */
export async function fixImportsForEsm(pathToProject: AbsoluteFilePath): Promise<void> {
    const srcDir = path.join(pathToProject, "src");

    // Build file existence set from src/ only (all imports resolve within src/)
    const allFiles = new Set<string>();
    await collectFiles(srcDir, allFiles);

    // Regex to match import/export from "..." and dynamic import("...")
    // Captures: the prefix (from/import), the quote char, and the module specifier
    const importExportRegex = /(?:from\s+|import\s*\(\s*)(["'])(\.[^"']+)\1/g;

    // Only process .ts files (all files in srcDir are already under src/)
    const tsFiles = [...allFiles].filter((f) => f.endsWith(".ts"));

    // Process files in parallel batches for better I/O throughput
    const BATCH_SIZE = 64;
    for (let i = 0; i < tsFiles.length; i += BATCH_SIZE) {
        const batch = tsFiles.slice(i, i + BATCH_SIZE);
        await Promise.all(
            batch.map(async (filePath) => {
                const content = await readFile(filePath, "utf-8");
                let modified = false;

                const newContent = content.replace(importExportRegex, (match, quote: string, specifier: string) => {
                    // Skip if already has .js extension
                    if (specifier.endsWith(".js")) {
                        return match;
                    }

                    const currentDir = path.dirname(filePath);
                    let newSpecifier: string;

                    if (specifier.endsWith(".ts")) {
                        // Case 1: explicit .ts extension → replace with .js
                        newSpecifier = specifier.slice(0, -3) + ".js";
                    } else if (
                        allFiles.has(path.resolve(currentDir, specifier, "index.ts")) ||
                        allFiles.has(path.resolve(currentDir, specifier, "index.js"))
                    ) {
                        // Case 2: directory import with index file
                        newSpecifier = specifier + "/index.js";
                    } else if (allFiles.has(path.resolve(currentDir, specifier + ".ts"))) {
                        // Case 3: regular file import
                        newSpecifier = specifier + ".js";
                    } else {
                        return match;
                    }

                    modified = true;
                    // Reconstruct the match with the new specifier, preserving the original structure
                    return match.replace(specifier, newSpecifier);
                });

                if (modified) {
                    await writeFile(filePath, newContent);
                }
            })
        );
    }
}

async function collectFiles(dirPath: string, result: Set<string>): Promise<void> {
    let entries;
    try {
        entries = await readdir(dirPath, { withFileTypes: true });
    } catch {
        return; // directory might not exist
    }
    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            // Skip node_modules and dist
            if (entry.name === "node_modules" || entry.name === "dist") {
                continue;
            }
            await collectFiles(fullPath, result);
        } else {
            result.add(fullPath);
        }
    }
}
