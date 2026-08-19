import { CliError } from "@fern-api/task-context";
import { OpenAPIV3 } from "openapi-types";
import { REQUEST_BODY_REFERENCE_PREFIX } from "../../openapi/v3/AbstractOpenAPIV3ParserContext.js";

export function getRequestBodyIdFromReference(ref: OpenAPIV3.ReferenceObject): string {
    if (!ref.$ref.startsWith(REQUEST_BODY_REFERENCE_PREFIX)) {
        throw new CliError({
            message: `Cannot get request body id from reference: ${ref.$ref}`,
            code: CliError.Code.ReferenceError
        });
    }
    return ref.$ref.replace(REQUEST_BODY_REFERENCE_PREFIX, "");
}
