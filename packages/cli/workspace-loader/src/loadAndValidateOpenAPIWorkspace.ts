import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { lstat, readdir, readFile } from "fs/promises";
import { OpenAPIDefinition, OpenAPIFile } from "./types/Workspace";

export async function loadAndValidateOpenAPIDefinition(
    context: TaskContext,
    absolutePathToDefinition: AbsoluteFilePath,
    relativeFilePath: RelativeFilePath = RelativeFilePath.of(".")
): Promise<OpenAPIDefinition> {
    let openAPIFile: undefined | OpenAPIFile;
    const subDirectories: OpenAPIDefinition[] = [];
    const files = await readdir(join(absolutePathToDefinition, relativeFilePath));
    for (const file of files) {
        const absoluteFilepathToFile = join(absolutePathToDefinition, relativeFilePath, RelativeFilePath.of(file));
        const stats = await lstat(absoluteFilepathToFile);
        if (stats.isDirectory()) {
            const subDirectory = await loadAndValidateOpenAPIDefinition(
                context,
                absolutePathToDefinition,
                join(relativeFilePath, RelativeFilePath.of(file))
            );
            subDirectories.push(subDirectory);
        } else if (openAPIFile == null) {
            openAPIFile = {
                absoluteFilepath: absoluteFilepathToFile,
                relativeFilepath: join(relativeFilePath, RelativeFilePath.of(file)),
                contents: (await readFile(absoluteFilepathToFile)).toString(),
            };
        } else {
            throw new Error(
                `Failed to load workspace: ${absolutePathToDefinition} contains multiple OpenAPI specs. Only one allowed`
            );
        }
    }

    if (openAPIFile == null) {
        context.failAndThrow(`OpenAPI document missing in directory ${absolutePathToDefinition}`);
    }

    return {
        absolutePath: join(absolutePathToDefinition, relativeFilePath),
        file: openAPIFile,
        subDirectories,
    };
}
