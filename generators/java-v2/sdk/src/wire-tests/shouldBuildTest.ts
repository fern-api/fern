import { HttpEndpoint, IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { getExampleEndpointCalls } from "./getExampleEndpointCalls";

/**
 * Copied from TypeScript generator - determines if we should generate a test for this endpoint.
 * Filters out endpoints that can't be properly tested with mocks.
 */
export function shouldBuildTest(endpoint: HttpEndpoint, ir: IntermediateRepresentation): boolean {
    // Check if OAuth is present (not supported)
    if (ir.auth?.schemes?.some(scheme => scheme.type === "oauth")) {
        return false;
    }

    // Check request type - skip bytes and file upload
    const requestType = endpoint.requestBody?.type;
    if (requestType === "bytes" || requestType === "fileUpload") {
        return false;
    }

    // Check response type - skip streaming, file download, text, bytes
    const responseType = endpoint.response?.body?.type;
    if (responseType === "fileDownload" || 
        responseType === "text" || 
        responseType === "bytes" || 
        responseType === "streaming" ||
        responseType === "streamParameter") {
        return false;
    }

    // Skip idempotent endpoints
    if (endpoint.idempotent) {
        return false;
    }

    // Skip paginated endpoints
    if (endpoint.pagination != null) {
        return false;
    }

    // MOST IMPORTANT: Only generate if we have examples
    const examples = getExampleEndpointCalls(endpoint);
    return examples.length > 0;
}