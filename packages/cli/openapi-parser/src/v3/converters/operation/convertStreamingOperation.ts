import { EndpointWithExample } from "@fern-fern/openapi-ir-model/parseIr";

export interface StreamingEndpoints {
    streaming: EndpointWithExample;
    nonStreaming: EndpointWithExample | undefined;
}

export function convertStreamingOperation(): StreamingEndpoints | undefined {
    return undefined;
}
