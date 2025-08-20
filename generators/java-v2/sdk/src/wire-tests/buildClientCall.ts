import { HttpEndpoint, HttpService, ExampleEndpointCall } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

/**
 * Builds the Java client call from example data.
 * This is simplified - a full implementation would handle all parameter types.
 */
export function buildClientCall(
    endpoint: HttpEndpoint,
    example: ExampleEndpointCall,
    service: HttpService,
    context: SdkGeneratorContext
): string {
    const clientVar = "client";
    const serviceParts = service.name?.fernFilepath?.allParts || [];
    const serviceName = serviceParts.map(part => part.camelCase.safeName).join(".");
    const methodName = endpoint.name.camelCase.safeName;
    
    // Build the basic call structure
    let call = clientVar;
    if (serviceName && serviceName.length > 0) {
        // Split the service name and add () to each part
        const serviceCalls = serviceName.split('.').map(s => `${s}()`).join('.');
        call += `.${serviceCalls}`;
    }
    call += `.${methodName}`;
    
    // For now, generate simplified calls without complex request building
    // This avoids the [object Object] issue
    // A full implementation would need proper type mapping
    
    // Collect simple parameters (path parameters only for now)
    const params: string[] = [];
    
    // Add path parameters from example if they exist
    if (example.endpointPathParameters && example.endpointPathParameters.length > 0) {
        example.endpointPathParameters.forEach(param => {
            // Use a simple placeholder for path parameters
            params.push(`"${param.name.originalName || param.name}"`);
        });
    }
    
    // If there's a request body, add a simple builder placeholder
    if (endpoint.sdkRequest || example.request) {
        // Comment out for now to avoid compilation errors
        // params.push("/* request parameter */");
    }
    
    call += `(${params.join(", ")})`;
    
    return call;
}