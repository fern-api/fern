import { CliError } from "@fern-api/task-context";
import { OpenAPIV2, OpenAPIV3 } from "openapi-types";
import { convertObj } from "swagger2openapi";

export async function convertOpenAPIV2ToV3(openAPI: OpenAPIV2.Document): Promise<OpenAPIV3.Document> {
    try {
        const conversionResult = await convertObj(openAPI, {});
        return conversionResult.openapi;
    } catch (e) {
        throw new CliError({
            message: `Failed to convert OpenAPI v2 (Swagger) spec to OpenAPI v3: ${
                e instanceof Error ? e.message : String(e)
            }`,
            code: CliError.Code.ParseError
        });
    }
}
