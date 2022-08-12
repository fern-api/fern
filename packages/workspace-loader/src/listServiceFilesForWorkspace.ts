import { RelativeFilePath } from "@fern-api/config-management-commons";
import { readFile } from "fs/promises";
import glob from "glob-promise";
import path from "path";
import { ROOT_API_FILE_BASENAME } from "./constants";
import { FernFile } from "./types/FernFile";

export async function listServiceFilesForWorkspace(absolutePathToDefinition: string): Promise<FernFile[]> {
    const files: FernFile[] = [];

    const filepaths = await glob(`**/!(${ROOT_API_FILE_BASENAME}).yml`, {
        cwd: absolutePathToDefinition,
    });

    for (const filepath of filepaths) {
        try {
            files.push(
                await createFernFile({
                    relativeFilepath: filepath as RelativeFilePath,
                    absoluteFilepath: path.join(absolutePathToDefinition, filepath),
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
    absoluteFilepath: string;
}): Promise<FernFile> {
    return {
        filepath: relativeFilepath,
        fileContents: (await readFile(absoluteFilepath)).toString(),
    };
}
