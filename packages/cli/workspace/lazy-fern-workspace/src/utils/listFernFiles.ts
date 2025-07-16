import { readFile } from "fs/promises";

import { FernFile } from "@fern-api/api-workspace-commons";
import { AbsoluteFilePath, RelativeFilePath, listFiles, relative } from "@fern-api/fs-utils";

export async function listFernFiles(root: AbsoluteFilePath, extensionGlob: string): Promise<FernFile[]> {
    const files: FernFile[] = [];

    for (const absoluteFilepath of await listFiles(root, extensionGlob)) {
        files.push(
            await createFernFile({
                relativeFilepath: relative(root, absoluteFilepath),
                absoluteFilepath
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
        relativeFilepath,
        absoluteFilepath,
        fileContents: (await readFile(absoluteFilepath)).toString()
    };
}
