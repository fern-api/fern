import { HttpEndpointSchema } from "../schemas";

export function isSseStsreamResponseSchema(endpoint: HttpEndpointSchema): boolean {
    return (
        endpoint["response-stream"] != null &&
        typeof endpoint["response-stream"] !== "string" &&
        endpoint["response-stream"].format === "sse"
    );
}
