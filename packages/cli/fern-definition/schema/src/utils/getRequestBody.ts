import { HttpEndpointSchema, HttpRequestBodySchema } from "../schemas";

export function getRequestBody(endpoint: HttpEndpointSchema): HttpRequestBodySchema | string | undefined {
    if (endpoint.request == null) {
        return undefined;
    }
    return typeof endpoint.request === "string" ? endpoint.request : endpoint.request.body;
}
