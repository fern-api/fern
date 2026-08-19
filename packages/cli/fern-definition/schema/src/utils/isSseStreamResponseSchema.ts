import { HttpEndpointSchema } from "../schemas/index.js";

export function isSseStreamResponseSchema(endpoint: HttpEndpointSchema): boolean {
    return (
        endpoint["response-stream"] != null &&
        typeof endpoint["response-stream"] !== "string" &&
        endpoint["response-stream"].format === "sse"
    );
}
