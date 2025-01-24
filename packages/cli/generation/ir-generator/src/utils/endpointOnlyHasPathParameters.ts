import { RawSchemas } from "@fern-api/fern-definition-schema";

import { getEndpointPathParameters } from "./getEndpointPathParameters";

export function endpointOnlyHasPathParameters(
    service: RawSchemas.HttpServiceSchema,
    endpoint: RawSchemas.HttpEndpointSchema
): boolean {
    const pathParameters = {
        ...(service["path-parameters"] ?? {}),
        ...getEndpointPathParameters(endpoint)
    };
    if (Object.keys(pathParameters).length === 0) {
        return false;
    }
    const request = endpoint.request;
    if (request == null || typeof request === "string") {
        return false;
    }
    return request["query-parameters"] == null && request.headers == null && request.body == null;
}
