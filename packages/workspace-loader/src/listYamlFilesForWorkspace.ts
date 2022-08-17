import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/core-utils";
import { lstat, readFile } from "fs/promises";
import glob from "glob-promise";
import path from "path";
import { FernFile } from "./types/FernFile";

export async function listYamlFilesForWorkspace(absolutePathToDefinition: AbsoluteFilePath): Promise<FernFile[]> {
    try {
        const stats = await lstat(absolutePathToDefinition);
        if (stats.isFile()) {
            return [
                await createFernFile({
                    relativeFilepath: RelativeFilePath.of(path.basename(absolutePathToDefinition)),
                    absoluteFilepath: absolutePathToDefinition,
                }),
            ];
        } else if (!stats.isDirectory()) {
            throw new Error(`${absolutePathToDefinition} is not a valid input`);
        }
    } catch (e) {
        throw new Error(`${absolutePathToDefinition} does not exist`);
    }

    const files: FernFile[] = [];

    const filepaths = (
        await glob("**/*.yml", {
            cwd: absolutePathToDefinition,
        })
    ).map(RelativeFilePath.of);

    for (const filepath of filepaths) {
        try {
            files.push(
                await createFernFile({
                    relativeFilepath: filepath,
                    absoluteFilepath: join(absolutePathToDefinition, filepath),
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
    relativeFilepath: RelativeFilePath;
    absoluteFilepath: AbsoluteFilePath;
}): Promise<FernFile> {
    return {
        filepath: relativeFilepath,
        fileContents: (await readFile(absoluteFilepath)).toString(),
    };
}
