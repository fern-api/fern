import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { lstat, readdir, readFile } from "fs/promises";

export declare namespace validateStructureOfOpenAPIFiles {
    export type Return = SuccessfulResult | FailedResult;

    export interface SuccessfulResult {
        didSucceed: true;
        root: OpenAPIDirectory;
    }

    export interface FailedResult {
        didSucceed: false;
    }
}

export interface OpenAPIDirectory {
    file: OpenAPIFile | undefined;
    subDirectories: OpenAPIDirectory[];
}

export interface OpenAPIFile {
    absoluteFilepath: AbsoluteFilePath;
    /* relative file path from the root of the definition */
    relativeFilepath: RelativeFilePath;
    contents: string;
}

export async function loadAndValidateOpenAPIDirectory(
    absolutePathToOpenAPI: AbsoluteFilePath,
    parentFolders: RelativeFilePath[] = []
): Promise<OpenAPIDirectory> {
    let openAPIFile: undefined | OpenAPIFile = undefined;
    const subDirectories: OpenAPIDirectory[] = [];
    const files = await readdir(absolutePathToOpenAPI);
    for (const file of files) {
        const absoluteFilepath = join(absolutePathToOpenAPI, ...parentFolders, RelativeFilePath.of(file));
        const stats = await lstat(absoluteFilepath);
        if (stats.isDirectory()) {
            const subDirectory = await loadAndValidateOpenAPIDirectory(absoluteFilepath, [
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
