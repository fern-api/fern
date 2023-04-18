import { Request } from "@fern-fern/openapi-ir-model/ir";
import { OpenAPIV3 } from "openapi-types";
import { isReferenceObject } from "../../isReferenceObject";
import { convertSchema } from "../convertSchemas";

const APPLICATION_JSON_CONTENT = "application/json";
// const MULTIPART_CONTENT = "multipart/form-data";

export function convertRequest({
    requestBody,
}: {
    requestBody: OpenAPIV3.ReferenceObject | OpenAPIV3.RequestBodyObject;
}): Request | undefined {
    if (isReferenceObject(requestBody)) {
        throw new Error(`Converting referenced request body is unsupported: ${JSON.stringify(requestBody)}`);
    }

    const requestBodySchema = requestBody.content[APPLICATION_JSON_CONTENT]?.schema;
    if (requestBodySchema == null) {
        return undefined;
    }
    const requestSchema = convertSchema(requestBodySchema);
    return {
        description: undefined,
        schema: requestSchema,
    };
}
