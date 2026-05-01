import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { CliError, TaskContext } from "@fern-api/task-context";
import { readdir } from "fs/promises";

export async function getValidAbsolutePathToAsyncAPIFromFolder(
    context: TaskContext,
    absolutePathToAsyncAPIFolder: AbsoluteFilePath
): Promise<AbsoluteFilePath> {
    const files = await readdir(absolutePathToAsyncAPIFolder);
    if (files.length < 1 || files[0] == null) {
        context.failAndThrow(`No AsyncAPI found in directory ${absolutePathToAsyncAPIFolder}`, undefined, {
            code: CliError.Code.ConfigError
        });
    }
    const absolutePathToAsyncAPIFile = join(absolutePathToAsyncAPIFolder, RelativeFilePath.of(files[0]));
    return absolutePathToAsyncAPIFile;
}

export async function getValidAbsolutePathToAsyncAPI(
    context: TaskContext,
    absolutePathToAsyncAPI: AbsoluteFilePath
): Promise<AbsoluteFilePath> {
    const absolutePathToAsyncAPIExists = await doesPathExist(absolutePathToAsyncAPI);
    if (!absolutePathToAsyncAPIExists) {
        context.failAndThrow(
            `AsyncAPI spec not found at ${absolutePathToAsyncAPIExists}. Please update the path in generators.yml`,
            undefined,
            { code: CliError.Code.ConfigError }
        );
    }
    return absolutePathToAsyncAPI;
}
