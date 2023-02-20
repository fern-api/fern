import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { readFile } from "fs/promises";
import glob from "glob-promise";
import { FernFile } from "./types/FernFile";

export async function listYamlFilesForWorkspace(absolutePathToDefinition: AbsoluteFilePath): Promise<FernFile[]> {
    const files: FernFile[] = [];

    const filepaths = (
        await glob("**/*.{yml,yaml}", {
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
