import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { lstat, readdir, readFile } from "fs/promises";
import { OpenAPIDefinition, OpenAPIFile } from "./types/Workspace";

export async function loadAndValidateOpenAPIDefinition(
    absolutePathToDefinition: AbsoluteFilePath,
    relativeFilePath: RelativeFilePath = RelativeFilePath.of(".")
): Promise<OpenAPIDefinition> {
    let openAPIFile: undefined | OpenAPIFile;
    const subDirectories: OpenAPIDefinition[] = [];
    const files = await readdir(join(absolutePathToDefinition, relativeFilePath));
    for (const file of files) {
        const absoluteFilepath = join(absolutePathToDefinition, relativeFilePath, RelativeFilePath.of(file));
        const stats = await lstat(absoluteFilepath);
        if (stats.isDirectory()) {
            const subDirectory = await loadAndValidateOpenAPIDefinition(
                absoluteFilepath,
                join(relativeFilePath, RelativeFilePath.of(file))
            );
            subDirectories.push(subDirectory);
        } else if (openAPIFile == null) {
            openAPIFile = {
                absoluteFilepath,
                relativeFilepath: join(relativeFilePath, RelativeFilePath.of(file)),
                contents: (await readFile(absoluteFilepath)).toString(),
            };
        } else {
            throw new Error(
                `Failed to load workspace: ${absolutePathToDefinition} contains multiple OpenAPI specs. Only one allowed`
            );
        }
    }
    return {
        absolutePath: join(absolutePathToDefinition, relativeFilePath),
        file: openAPIFile,
        subDirectories,
    };
}
