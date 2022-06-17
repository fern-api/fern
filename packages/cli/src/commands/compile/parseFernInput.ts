import { FernFile } from "@fern-api/compiler-commons";
import { lstat, readFile } from "fs/promises";
import glob from "glob-promise";
import path from "path";

export async function parseFernInput(absolutePathToInput: string): Promise<FernFile[]> {
    try {
        const stats = await lstat(absolutePathToInput);
        if (stats.isFile()) {
            const relativeFilepath = path.basename(absolutePathToInput);
            return [
                await createFernFile({
                    relativeFilepath,
                    absoluteFilepath: absolutePathToInput,
                }),
            ];
        } else if (!stats.isDirectory()) {
            throw new Error(`${absolutePathToInput} is not a valid input`);
        }
    } catch (e) {
        throw new Error(`${absolutePathToInput} does not exist`);
    }

    const files: FernFile[] = [];

    const filepaths = await glob("**/*.yml", {
        cwd: absolutePathToInput,
    });

    for (const filepath of filepaths) {
        try {
            files.push(
                await createFernFile({
                    relativeFilepath: filepath,
                    absoluteFilepath: path.join(absolutePathToInput, filepath),
                })
            );
        } catch (e) {
            console.error(`Failed to read file: ${filepath}`, e);
        }
    }

    return files;
}

async function createFernFile({
    relativeFilepath,
    absoluteFilepath,
}: {
    relativeFilepath: string;
    absoluteFilepath: string;
}): Promise<FernFile> {
    return {
        filepath: relativeFilepath,
        fileContents: (await readFile(absoluteFilepath)).toString(),
    };
}
