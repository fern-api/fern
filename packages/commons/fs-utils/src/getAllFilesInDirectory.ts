import { readdir } from "fs/promises";
import path from "path";

export async function getAllFilesInDirectory(dir: string): Promise<string[]> {
    const files = await readdir(dir, { withFileTypes: true });
    const filePromises = files.map(async (file) => {
        const filePath = path.join(dir, file.name);

        if (file.isDirectory()) {
            return getAllFilesInDirectory(filePath);
        }

        if (file.isSymbolicLink() || file.name.startsWith(".")) {
            return [];
        }

        return filePath;
    });

    const nestedFiles = await Promise.all(filePromises);
    return nestedFiles.flat();
}
