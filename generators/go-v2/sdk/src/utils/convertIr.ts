import { FernIr as DynamicFernIr } from "@fern-api/dynamic-ir-sdk";
import { FernIr } from "@fern-fern/ir-sdk";
import { convertEndpoints, Endpoint } from "./convertEndpoints.js";

export type DynamicIntermediateRepresentation = Omit<
    DynamicFernIr.dynamic.DynamicIntermediateRepresentation,
    "endpoints"
> & {
    endpoints: Record<FernIr.EndpointId, Endpoint>;
};

/**
 * The @fern-api/dynamic-ir-sdk doesn't include the serialization layer, so the casing
 * convention doesn't match. This converts from the ir.dynamic field to the format
 * expected by DynamicSnippetsGenerator.
 */
export function convertIr(
    ir: FernIr.dynamic.DynamicIntermediateRepresentation
): DynamicFernIr.dynamic.DynamicIntermediateRepresentation {
    return {
        ...ir,
        endpoints: convertEndpoints(ir.endpoints) as Record<FernIr.EndpointId, DynamicFernIr.dynamic.Endpoint>
    } as DynamicFernIr.dynamic.DynamicIntermediateRepresentation;
}
