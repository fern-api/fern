import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { readdir } from "fs/promises";

export async function getValidAbsolutePathToOpenAPIFromFolder(
    context: TaskContext,
    absolutePathToOpenAPIFolder: AbsoluteFilePath
): Promise<AbsoluteFilePath> {
    const files = await readdir(absolutePathToOpenAPIFolder);
    if (files.length < 1 || files[0] == null) {
        context.failAndThrow(`No OpenAPI found in directory ${absolutePathToOpenAPIFolder}`);
    }
    const absolutePathToOpenAPIFile = join(absolutePathToOpenAPIFolder, RelativeFilePath.of(files[0]));
    return absolutePathToOpenAPIFile;
}

export async function getValidAbsolutePathToOpenAPI(
    context: TaskContext,
    absolutePathToOpenAPI: AbsoluteFilePath
): Promise<AbsoluteFilePath> {
    const absolutePathToOpenAPIExists = await doesPathExist(absolutePathToOpenAPI);
    if (!absolutePathToOpenAPIExists) {
        context.failAndThrow(
            `OpenAPI spec not found at ${absolutePathToOpenAPI}. Please update the path in generators.yml`
        );
    }
    return absolutePathToOpenAPI;
}
