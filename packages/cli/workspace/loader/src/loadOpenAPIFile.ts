import { AbsoluteFilePath, doesPathExist } from "@fern-api/fs-utils";
import { CliError, TaskContext } from "@fern-api/task-context";

export async function getValidAbsolutePathToOpenAPI(
    context: TaskContext,
    absolutePathToOpenAPI: AbsoluteFilePath
): Promise<AbsoluteFilePath> {
    const absolutePathToOpenAPIExists = await doesPathExist(absolutePathToOpenAPI);
    if (!absolutePathToOpenAPIExists) {
        context.failAndThrow(
            `OpenAPI spec not found at ${absolutePathToOpenAPI}. Please update the path in generators.yml`,
            undefined,
            { code: CliError.Code.ConfigError }
        );
    }
    return absolutePathToOpenAPI;
}
