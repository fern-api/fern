import { FernIr } from "@fern-fern/ir-sdk";
import { convertEndpoints, Endpoint } from "./convertEndpoints.js";

export type DynamicIntermediateRepresentation = Omit<FernIr.dynamic.DynamicIntermediateRepresentation, "endpoints"> & {
    endpoints: Record<FernIr.EndpointId, Endpoint>;
};

/**
 * The @fern-api/dynamic-ir-sdk doesn't include the serialization layer, so the casing
 * convention doesn't match.
 */
export function convertIr(ir: FernIr.dynamic.DynamicIntermediateRepresentation): DynamicIntermediateRepresentation {
    return {
        ...ir,
        endpoints: convertEndpoints(ir.endpoints)
    };
}
