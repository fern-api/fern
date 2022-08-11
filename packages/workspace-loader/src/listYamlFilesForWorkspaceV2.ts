import { RelativeFilePath } from "@fern-api/config-management-commons";
import { readFile } from "fs/promises";
import glob from "glob-promise";
import path from "path";
import { FernFile } from "./types/FernFile";

const ROOT_API_FILE_BASENAME = "api";
const ROOT_API_FILENAME = `${ROOT_API_FILE_BASENAME}.yml`;

export interface WorkspaceYamlFiles {
    rootApiFile: FernFile;
    serviceFiles: FernFile[];
}

export async function listYamlFilesForWorkspaceV2(absolutePathToDefinition: string): Promise<WorkspaceYamlFiles> {
    return {
        rootApiFile: await createFernFile({
            relativeFilepath: ROOT_API_FILENAME as RelativeFilePath,
            absoluteFilepath: path.join(absolutePathToDefinition, ROOT_API_FILENAME),
        }),
        serviceFiles: await listServiceFilesForWorkspace(absolutePathToDefinition),
    };
}

async function listServiceFilesForWorkspace(absolutePathToDefinition: string): Promise<FernFile[]> {
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
