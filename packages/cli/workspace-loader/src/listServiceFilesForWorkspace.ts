import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/core-utils";
import { ROOT_API_FILENAME } from "@fern-api/project-configuration";
import { readFile } from "fs/promises";
import glob from "glob-promise";
import path from "path";
import { FernFile } from "./types/FernFile";

const ROOT_API_FILE_BASENAME = path.basename(ROOT_API_FILENAME, path.extname(ROOT_API_FILENAME));

export async function listServiceFilesForWorkspace(absolutePathToDefinition: AbsoluteFilePath): Promise<FernFile[]> {
    const files: FernFile[] = [];

    const filepaths = (
        await glob(`**/!(${ROOT_API_FILE_BASENAME}).yml`, {
            cwd: absolutePathToDefinition,
        })
    ).map(RelativeFilePath.of);

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
