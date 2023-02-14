import { TaskContext } from "@fern-api/task-context";
import { FernOpenapiIr } from "@fern-fern/openapi-ir-sdk";
import { OpenAPIV3 } from "openapi-types";
import { convertSchema } from "./convertSchema";
import { getSchemaIdFromReference, isReferenceObject } from "./utils";

const RESPONSE_REFERENCE_PREFIX = "#/components/responses/";
const APPLICATION_JSON_CONTENT = "application/json";

export function convertResponse({
    document,
    responseBody,
    taskContext,
}: {
    document: OpenAPIV3.Document;
    responseBody: OpenAPIV3.ResponseObject | OpenAPIV3.ReferenceObject | undefined;
    taskContext: TaskContext;
}): undefined | FernOpenapiIr.Schema {
    if (responseBody == null) {
        return undefined;
    } else if (isReferenceObject(responseBody)) {
        const responseKey = responseBody.$ref.substring(RESPONSE_REFERENCE_PREFIX.length);

        if (document.components == null || document.components.responses == null) {
            return undefined;
        }
        const resolvedResponseBody = document.components.responses[responseKey];
        return convertResponse({ document, responseBody: resolvedResponseBody, taskContext });
    } else if (responseBody.content != null) {
        const responseBodySchema = responseBody.content[APPLICATION_JSON_CONTENT]?.schema;
        if (responseBodySchema == null) {
            return undefined;
        }
        if (isReferenceObject(responseBodySchema)) {
            const schemaId = getSchemaIdFromReference(responseBodySchema);
            if (schemaId != null) {
                return FernOpenapiIr.Schema.reference({
                    reference: schemaId,
                });
            } else {
                taskContext.logger.warn(`Failed to convert response ${responseBodySchema.$ref}`);
                return undefined;
            }
        }
        return convertSchema({ schema: responseBodySchema, taskContext });
    }
    return undefined;
}
