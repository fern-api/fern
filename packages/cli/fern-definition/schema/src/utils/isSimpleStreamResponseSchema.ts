import { HttpEndpointSchema } from "../schemas";

export function isSimpleStreamResponseSchema(endpoint: HttpEndpointSchema): boolean {
    return (
        endpoint["response-stream"] != null &&
        (typeof endpoint["response-stream"] === "string" ||
            endpoint["response-stream"].format == null ||
            endpoint["response-stream"].format === "json")
    );
}
