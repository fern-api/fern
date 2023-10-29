import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { readdir, readFile } from "fs/promises";
import { AsyncAPIFile } from "./types/Workspace";

export async function loadAsyncAPIFromFolder(
    context: TaskContext,
    absolutePathToAsyncAPIFolder: AbsoluteFilePath
): Promise<AsyncAPIFile> {
    const files = await readdir(absolutePathToAsyncAPIFolder);
    if (files.length < 1 || files[0] == null) {
        context.failAndThrow(`No AsyncAPI found in directory ${absolutePathToAsyncAPIFolder}`);
    }
    const absolutePathToAsyncAPIFile = join(absolutePathToAsyncAPIFolder, RelativeFilePath.of(files[0]));
    return {
        absoluteFilepath: absolutePathToAsyncAPIFile,
        contents: (await readFile(absolutePathToAsyncAPIFile)).toString(),
    };
}

export async function loadAsyncAPIFile(
    context: TaskContext,
    absolutePathToAsyncAPI: AbsoluteFilePath
): Promise<AsyncAPIFile> {
    const absolutePathToAsyncAPIExists = await doesPathExist(absolutePathToAsyncAPI);
    if (!absolutePathToAsyncAPIExists) {
        context.failAndThrow(
            `AsyncAPI spec not found at ${absolutePathToAsyncAPIExists}. Please update the path in generators.yml`
        );
    }
    return {
        absoluteFilepath: absolutePathToAsyncAPI,
        contents: (await readFile(absolutePathToAsyncAPI)).toString(),
    };
}
