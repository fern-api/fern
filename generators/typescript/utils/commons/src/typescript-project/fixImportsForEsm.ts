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
 *
 * @param pathToProject - The absolute path to the root of the TypeScript project.
 */
export async function fixImportsForEsm(pathToProject: AbsoluteFilePath): Promise<void> {
    // Build file existence set by walking the full project (for import resolution)
    const allFiles = new Set<string>();
    await collectFiles(pathToProject, allFiles);

    // Determine the src directory from tsconfig (matches old ts-morph behavior)
    const srcDir = path.join(pathToProject, "src");

    // Regex to match import/export from "..." and dynamic import("...")
    // Captures: the prefix (from/import), the quote char, and the module specifier
    const importExportRegex = /(?:from\s+|import\s*\(\s*)(["'])(\.[^"']+)\1/g;

    // Only process .ts files under src/ (matching tsconfig include behavior)
    const tsFiles = [...allFiles].filter((f) => f.endsWith(".ts") && f.startsWith(srcDir + path.sep));
    for (const filePath of tsFiles) {
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
    }
}

async function collectFiles(dirPath: string, result: Set<string>): Promise<void> {
    const entries = await readdir(dirPath, { withFileTypes: true });
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
