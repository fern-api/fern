import { FernOpenapiIr } from "@fern-fern/openapi-ir-sdk";
import { OpenAPIV3 } from "openapi-types";

export const APPLICATION_JSON_CONTENT = "application/json";
export const SCHEMA_REFERENCE_PREFIX = "#/components/schemas/";
export const RESPONSE_REFERENCE_PREFIX = "#/components/responses/";
export const REQUEST_REFERENCE_PREFIX = "#/components/requests/";

export function isReferenceObject(
    parameter:
        | OpenAPIV3.ReferenceObject
        | OpenAPIV3.ParameterObject
        | OpenAPIV3.SchemaObject
        | OpenAPIV3.RequestBodyObject
        | OpenAPIV3.SecuritySchemeObject
): parameter is OpenAPIV3.ReferenceObject {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (parameter as OpenAPIV3.ReferenceObject).$ref != null;
}

export function getSchemaIdFromReference(reference: OpenAPIV3.ReferenceObject): FernOpenapiIr.SchemaId | undefined {
    if (reference.$ref.startsWith(SCHEMA_REFERENCE_PREFIX)) {
        return reference.$ref.substring(SCHEMA_REFERENCE_PREFIX.length);
    }
    return undefined;
}
