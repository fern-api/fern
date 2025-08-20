import { ExampleEndpointCall, ExampleRequestBody } from "@fern-fern/ir-sdk/api";

/**
 * Extracts JSON string from request example.
 * Mirrors TypeScript's getRequestExample method.
 */
export function extractRequestJson(example: ExampleEndpointCall): string | null {
    if (!example.request) {
        return null;
    }

    const request = example.request;
    
    // For now, use simplified approach - return jsonExample directly
    // A full implementation would use visitor pattern like TypeScript
    if (request.type === "inlinedRequestBody") {
        const properties: Record<string, any> = {};
        request.properties.forEach(prop => {
            const propName = (prop.name as any).wireValue || prop.name;
            const propValue = (prop.value as any).jsonExample || prop.value;
            properties[propName] = propValue;
        });
        return JSON.stringify(properties);
    } else if (request.type === "reference") {
        const refRequest = request as any;
        return JSON.stringify(refRequest.jsonExample || {});
    }
    
    // Fallback to jsonExample if available
    const anyRequest = request as any;
    return anyRequest.jsonExample ? JSON.stringify(anyRequest.jsonExample) : null;
}