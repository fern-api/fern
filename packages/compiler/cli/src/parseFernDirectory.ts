import { lstat, readFile } from "fs/promises";
import glob from "glob-promise";
import path from "path";
import { FernFile } from "../packages/compiler/commons/src";

export async function parseFernDirectory(fullDirectoryPath: string): Promise<FernFile[]> {
    try {
        const stats = await lstat(fullDirectoryPath);
        if (!stats.isDirectory()) {
            throw new Error(`${fullDirectoryPath} is not a directory`);
        }
    } catch (e) {
        throw new Error(`${fullDirectoryPath} does not exist`);
    }

    const files: FernFile[] = [];

    const filepaths = await glob("**/*.yml", {
        cwd: fullDirectoryPath,
    });

    for (const filepath of filepaths) {
        try {
            files.push({
                filepath,
                fileContents: (await readFile(path.join(fullDirectoryPath, filepath))).toString(),
            });
        } catch (e) {
            console.error(`Failed to read file: ${filepath}`, e);
        }
    }

    return files;
}
