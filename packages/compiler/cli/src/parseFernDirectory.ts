import { FernFile } from "@fern-api/compiler-commons";
import { readFile } from "fs/promises";
import glob from "glob";
import path from "path";
import { promisify } from "util";

const promisifiedGlob = promisify(glob);

export async function parseFernDirectory(fullDirectoryPath: string): Promise<FernFile[]> {
    const files: FernFile[] = [];

    const filepaths = await promisifiedGlob("**/*.yml", {
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
