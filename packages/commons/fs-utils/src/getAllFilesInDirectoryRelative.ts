import { readdir } from "node:fs/promises";
import path from "node:path";

/**
 * Returns the relative paths of all files including subdirectories in a given directory.
 *
 * @remarks
 * This is the same as `getAllFilesInDirectory`, but it returns the relative paths of the files.
 */
export async function getAllFilesInDirectoryRelative(dir: string): Promise<string[]> {
    async function helper(currentDir: string, relativePath: string): Promise<string[]> {
        const files = await readdir(currentDir, { withFileTypes: true });
        const filePromises = files.map(async (file) => {
            const absoluteFilePath = path.join(currentDir, file.name);
            const relativeFilePath = path.join(relativePath, file.name);

            if (file.isDirectory()) {
                return helper(absoluteFilePath, relativeFilePath);
            }

            if (file.isSymbolicLink() || file.name.startsWith(".")) {
                return [];
            }

            return relativeFilePath;
        });

        const nestedFiles = await Promise.all(filePromises);
        return nestedFiles.flat();
    }

    return helper(dir, "");
}
