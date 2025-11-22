import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { statSync } from "fs";
import { readdir } from "fs/promises";
import path from "path";

/**
 * Recursively collects all files in a directory, excluding the translations directory.
 * @param baseDirectory - The base directory to search in
 * @param relativeBase - The relative path from the original base directory
 * @returns A record mapping absolute file paths to their relative paths
 */
export async function collectFiles(
    baseDirectory: string,
    relativeBase: RelativeFilePath | ""
): Promise<Record<string, RelativeFilePath>> {
    const discoveredFiles: Record<string, RelativeFilePath> = {};

    const entries = await readdir(baseDirectory);

    for (const entry of entries) {
        // skip the translations directory
        if (entry === "translations") {
            continue;
        }

        const fullPath = path.join(baseDirectory, entry);
        const relativePath = relativeBase ? join(relativeBase, RelativeFilePath.of(entry)) : RelativeFilePath.of(entry);

        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
            const subdirectoryFiles = await collectFiles(fullPath, relativePath);
            for (const [subPath, subRelativePath] of Object.entries(subdirectoryFiles)) {
                discoveredFiles[subPath] = subRelativePath;
            }
        } else if (stat.isFile()) {
            discoveredFiles[fullPath] = relativePath;
        }
    }

    return discoveredFiles;
}
