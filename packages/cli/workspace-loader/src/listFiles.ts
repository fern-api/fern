import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { readFile } from "fs/promises";
import glob from "glob-promise";
import { FernFile } from "./types/FernFile";

export async function listFiles(root: AbsoluteFilePath, extensionGlob: string): Promise<FernFile[]> {
    const files: FernFile[] = [];

    const filepaths = (
        await glob(`**/*.${extensionGlob}`, {
            cwd: root
        })
    ).map(RelativeFilePath.of);

    for (const filepath of filepaths) {
        files.push(
            await createFernFile({
                relativeFilepath: filepath,
                absoluteFilepath: join(root, filepath)
            })
        );
    }

    return files;
}

async function createFernFile({
    relativeFilepath,
    absoluteFilepath
}: {
    relativeFilepath: RelativeFilePath;
    absoluteFilepath: AbsoluteFilePath;
}): Promise<FernFile> {
    return {
        filepath: relativeFilepath,
        fileContents: (await readFile(absoluteFilepath)).toString()
    };
}
