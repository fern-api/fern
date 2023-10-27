import { HttpInlineRequestBodySchema, HttpRequestBodySchema } from "../schemas";

export function isInlineRequestBody(requestBody: HttpRequestBodySchema): requestBody is HttpInlineRequestBodySchema {
    if (typeof requestBody === "string") {
        return false;
    }
    return (
        (requestBody as HttpInlineRequestBodySchema)?.extends != null ||
        (requestBody as HttpInlineRequestBodySchema)?.properties != null
    );
}
