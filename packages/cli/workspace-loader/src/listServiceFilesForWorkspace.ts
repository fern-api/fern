import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { ROOT_API_FILENAME } from "@fern-api/project-configuration";
import { readFile } from "fs/promises";
import glob from "glob-promise";
import { FernFile } from "./types/FernFile";

export async function listServiceFilesForWorkspace(absolutePathToDefinition: AbsoluteFilePath): Promise<FernFile[]> {
    const files: FernFile[] = [];

    const filepaths = (
        await glob("**/*.yml", {
            cwd: absolutePathToDefinition,
        })
    )
        .filter((filepath) => filepath !== ROOT_API_FILENAME)
        .map(RelativeFilePath.of);

    for (const filepath of filepaths) {
        files.push(
            await createFernFile({
                relativeFilepath: filepath,
                absoluteFilepath: join(absolutePathToDefinition, filepath),
            })
        );
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
