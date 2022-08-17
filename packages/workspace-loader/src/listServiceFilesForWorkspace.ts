import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/core-utils";
import { readFile } from "fs/promises";
import glob from "glob-promise";
import { ROOT_API_FILE_BASENAME } from "./constants";
import { FernFile } from "./types/FernFile";

export async function listServiceFilesForWorkspace(absolutePathToDefinition: AbsoluteFilePath): Promise<FernFile[]> {
    const files: FernFile[] = [];

    const filepaths = (
        await glob(`**/!(${ROOT_API_FILE_BASENAME}).yml`, {
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
