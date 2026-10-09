import { CliError, TaskContext } from "@fern-api/task-context";
import { OpenAPIV2, OpenAPIV3 } from "openapi-types";
import { convertObj } from "swagger2openapi";

export async function convertOpenAPIV2ToV3(
    openAPI: OpenAPIV2.Document,
    options?: { context?: TaskContext }
): Promise<OpenAPIV3.Document> {
    let strictError: unknown;

    try {
        const conversionResult = await convertObj(openAPI, {});
        return conversionResult.openapi;
    } catch (error) {
        strictError = error;
    }

    try {
        const conversionResult = await convertObj(openAPI, { patch: true });
        options?.context?.logger.warn(
            `OpenAPI v2 (Swagger) document is not strictly valid and was converted in lenient (patch) mode: ${
                strictError instanceof Error ? strictError.message : String(strictError)
            }`
        );
        return conversionResult.openapi;
    } catch {
        throw new CliError({
            message: `Failed to convert OpenAPI v2 (Swagger) spec to OpenAPI v3: ${
                strictError instanceof Error ? strictError.message : String(strictError)
            }`,
            code: CliError.Code.ParseError
        });
    }
}
