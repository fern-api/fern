import { dynamic, EndpointId } from "@fern-fern/ir-sdk/api";

import { convertEndpoints, Endpoint } from "./convertEndpoints";

export type DynamicIntermediateRepresentation = Omit<dynamic.DynamicIntermediateRepresentation, "endpoints"> & {
    endpoints: Record<EndpointId, Endpoint>;
};

/**
 * The @fern-api/dynamic-ir-sdk doesn't include the serialization layer, so the casing
 * convention doesn't match.
 */
export function convertIr(ir: dynamic.DynamicIntermediateRepresentation): DynamicIntermediateRepresentation {
    return {
        ...ir,
        endpoints: convertEndpoints(ir.endpoints)
    };
}
