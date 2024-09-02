import { HttpInlineRequestBodySchema, HttpRequestBodySchema } from "../schemas";

export function isInlineRequestBody(requestBody: HttpRequestBodySchema): requestBody is HttpInlineRequestBodySchema {
    if (typeof requestBody === "string") {
        return false;
    }
    return (
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        (requestBody as HttpInlineRequestBodySchema)?.extends != null ||
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        (requestBody as HttpInlineRequestBodySchema)?.properties != null
    );
}
