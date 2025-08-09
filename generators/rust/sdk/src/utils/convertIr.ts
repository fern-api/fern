import { EndpointId, dynamic } from "@fern-fern/ir-sdk/api";
import { FernIr } from "@fern-api/dynamic-ir-sdk";

import { Endpoint, convertEndpoints } from "./convertEndpoints";

export type DynamicIntermediateRepresentation = Omit<dynamic.DynamicIntermediateRepresentation, "endpoints"> & {
    endpoints: Record<EndpointId, Endpoint>;
};

/**
 * The @fern-api/dynamic-ir-sdk doesn't include the serialization layer, so the casing
 * convention doesn't match. This converts from the ir.dynamic field to the format
 * expected by DynamicSnippetsGenerator.
 */
export function convertIr(ir: dynamic.DynamicIntermediateRepresentation): FernIr.dynamic.DynamicIntermediateRepresentation {
    return {
        ...ir,
        endpoints: convertEndpoints(ir.endpoints) as any
    } as FernIr.dynamic.DynamicIntermediateRepresentation;
}