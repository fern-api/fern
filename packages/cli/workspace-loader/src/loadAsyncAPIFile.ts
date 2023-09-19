import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { readdir, readFile } from "fs/promises";
import { OpenAPIFile } from "./types/Workspace";

export async function loadAsyncAPIFile(
    context: TaskContext,
    absolutePathToAsyncAPIFolder: AbsoluteFilePath
): Promise<OpenAPIFile> {
    const files = await readdir(absolutePathToAsyncAPIFolder);
    if (files.length < 1 || files[0] == null) {
        context.failAndThrow(`No AsyncAPI found in directory ${absolutePathToAsyncAPIFolder}`);
    }
    const absolutePathToAsyncAPIFile = join(absolutePathToAsyncAPIFolder, RelativeFilePath.of(files[0]));
    return {
        absoluteFilepath: absolutePathToAsyncAPIFile,
        relativeFilepath: RelativeFilePath.of(files[0]),
        contents: (await readFile(absolutePathToAsyncAPIFile)).toString(),
    };
}
