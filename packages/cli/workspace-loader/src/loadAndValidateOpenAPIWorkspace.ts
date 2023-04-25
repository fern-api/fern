import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { lstat, readdir, readFile } from "fs/promises";
import { OpenAPIDefinition, OpenAPIFile } from "./types/Workspace";

export async function loadAndValidateOpenAPIDefinition(
    absolutePathToOpenAPI: AbsoluteFilePath,
    parentFolders: RelativeFilePath[] = []
): Promise<OpenAPIDefinition> {
    let openAPIFile: undefined | OpenAPIFile = undefined;
    const subDirectories: OpenAPIDefinition[] = [];
    const files = await readdir(absolutePathToOpenAPI);
    for (const file of files) {
        const absoluteFilepath = join(absolutePathToOpenAPI, ...parentFolders, RelativeFilePath.of(file));
        const stats = await lstat(absoluteFilepath);
        if (stats.isDirectory()) {
            const subDirectory = await loadAndValidateOpenAPIDefinition(absoluteFilepath, [
                ...parentFolders,
                RelativeFilePath.of(file),
            ]);
            subDirectories.push(subDirectory);
        } else if (openAPIFile == null) {
            openAPIFile = {
                absoluteFilepath,
                relativeFilepath: join(...parentFolders, RelativeFilePath.of(file)),
                contents: (await readFile(absoluteFilepath)).toString(),
            };
        } else {
            throw new Error(
                `Failed to load workspace: ${absolutePathToOpenAPI} contains multiple OpenAPI specs. Only one allowed`
            );
        }
    }
    return {
        file: openAPIFile,
        subDirectories,
    };
}
