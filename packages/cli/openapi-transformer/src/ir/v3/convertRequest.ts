import { FernOpenapiIr } from "@fern-fern/openapi-ir-sdk";
import { OpenAPIV3 } from "openapi-types";
import { convertSchema } from "./convertSchema";
import { getSchemaIdFromReference, isReferenceObject } from "./utils";

const REQUEST_REFERENCE_PREFIX = "#/components/requests/";
export const APPLICATION_JSON_CONTENT = "application/json";

export function convertRequest({
    document,
    requestBody,
}: {
    document: OpenAPIV3.Document;
    requestBody: OpenAPIV3.RequestBodyObject | OpenAPIV3.ReferenceObject | undefined;
}): undefined | FernOpenapiIr.Schema {
    if (requestBody == null) {
        return undefined;
    } else if (isReferenceObject(requestBody)) {
        const requestKey = requestBody.$ref.substring(REQUEST_REFERENCE_PREFIX.length);

        if (document.components == null || document.components.requestBodies == null) {
            return undefined;
        }
        const resolvedRequestBody = document.components.requestBodies[requestKey];
        return convertRequest({ document, requestBody: resolvedRequestBody });
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
                // TODO(dsinghvi): log about not parsing schema id from reference
                return undefined;
            }
        }
        return convertSchema({ schema: requestBodySchema });
    }
}
