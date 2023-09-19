import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { readdir, readFile } from "fs/promises";
import { OpenAPIFile } from "./types/Workspace";

export async function loadOpenAPIFile(
    context: TaskContext,
    absolutePathToOpenAPIFolder: AbsoluteFilePath
): Promise<OpenAPIFile> {
    const files = await readdir(absolutePathToOpenAPIFolder);
    if (files.length < 1 || files[0] == null) {
        context.failAndThrow(`No OpenAPI found in directory ${absolutePathToOpenAPIFolder}`);
    }
    const absolutePathToOpenAPIFile = join(absolutePathToOpenAPIFolder, RelativeFilePath.of(files[0]));
    return {
        absoluteFilepath: absolutePathToOpenAPIFile,
        relativeFilepath: RelativeFilePath.of(files[0]),
        contents: (await readFile(absolutePathToOpenAPIFile)).toString(),
    };
}
