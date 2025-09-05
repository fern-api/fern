import { dynamic, EndpointId } from "@fern-fern/ir-sdk/api";

export interface Endpoint extends Omit<dynamic.Endpoint, "id"> {
    id: string;
}

/**
 * Convert endpoints from the IR dynamic format to the format expected by DynamicSnippetsGenerator
 */
export function convertEndpoints(endpoints: Record<EndpointId, dynamic.Endpoint>): Record<EndpointId, Endpoint> {
    const convertedEndpoints: Record<EndpointId, Endpoint> = {};

    for (const [endpointId, endpoint] of Object.entries(endpoints)) {
        convertedEndpoints[endpointId] = {
            ...endpoint,
            id: endpointId
        };
    }

    return convertedEndpoints;
}
