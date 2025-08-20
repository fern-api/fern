import { ExampleEndpointCall } from "@fern-fern/ir-sdk/api";

/**
 * Extracts JSON string from response example.
 * Mirrors TypeScript's getResponseExample method.
 */
export function extractResponseJson(example: ExampleEndpointCall): string {
    const response = example.response;
    
    if (response.type === "ok") {
        // For successful responses, check if there's a body field
        const okResponse = response as any; // Type casting since IR types may vary
        if (okResponse.body) {
            // If body exists and has jsonExample, use it
            if (okResponse.body.jsonExample !== undefined) {
                return JSON.stringify(okResponse.body.jsonExample);
            }
            // If body exists but no jsonExample, might be the body itself
            return JSON.stringify(okResponse.body);
        }
        return "{}";
    } else if (response.type === "error") {
        // For error responses
        const errorResponse = response as any;
        if (errorResponse.body) {
            if (errorResponse.body.jsonExample !== undefined) {
                return JSON.stringify(errorResponse.body.jsonExample);
            }
            return JSON.stringify(errorResponse.body);
        }
        return '{"error": "unknown"}';
    }
    
    return "{}";
}