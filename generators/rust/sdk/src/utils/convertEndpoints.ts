import { FernIr } from "@fern-fern/ir-sdk";
export interface Endpoint extends Omit<FernIr.dynamic.Endpoint, "id"> {
    id: string;
}

/**
 * Convert endpoints from the IR FernIr.dynamic format to the format expected by DynamicSnippetsGenerator
 */
export function convertEndpoints(endpoints: Record<FernIr.EndpointId, FernIr.dynamic.Endpoint>): Record<FernIr.EndpointId, Endpoint> {
    const convertedEndpoints: Record<FernIr.EndpointId, Endpoint> = {};

    for (const [endpointId, endpoint] of Object.entries(endpoints)) {
        convertedEndpoints[endpointId] = {
            ...endpoint,
            id: endpointId
        };
    }

    return convertedEndpoints;
}
