import { TaskContext } from "@fern-api/task-context";
import { FernOpenapiIr } from "@fern-fern/openapi-ir-sdk";
import { OpenAPIV3 } from "openapi-types";
import { convertSchema } from "./convertSchema";
import { getSchemaIdFromReference, isReferenceObject } from "./utils";

const REQUEST_REFERENCE_PREFIX = "#/components/requests/";
const APPLICATION_JSON_CONTENT = "application/json";

export function convertRequest({
    document,
    requestBody,
    taskContext,
}: {
    document: OpenAPIV3.Document;
    requestBody: OpenAPIV3.RequestBodyObject | OpenAPIV3.ReferenceObject | undefined;
    taskContext: TaskContext;
}): undefined | FernOpenapiIr.Schema {
    if (requestBody == null) {
        return undefined;
    } else if (isReferenceObject(requestBody)) {
        const requestKey = requestBody.$ref.substring(REQUEST_REFERENCE_PREFIX.length);

        if (document.components == null || document.components.requestBodies == null) {
            return undefined;
        }
        const resolvedRequestBody = document.components.requestBodies[requestKey];
        return convertRequest({ document, requestBody: resolvedRequestBody, taskContext });
    } else {
        const requestBodySchema = requestBody.content[APPLICATION_JSON_CONTENT]?.schema;
        if (requestBodySchema == null) {
            return undefined;
        }
        if (isReferenceObject(requestBodySchema)) {
            const schemaId = getSchemaIdFromReference(requestBodySchema);
            if (schemaId != null) {
                return FernOpenapiIr.Schema.reference({
                    reference: schemaId,
                });
            } else {
                taskContext.logger.warn(`Failed to convert request ${requestBodySchema.$ref}`);
                return undefined;
            }
        }
        return convertSchema({ schema: requestBodySchema, taskContext });
    }
}
