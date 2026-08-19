import { FernIr as DynamicFernIr } from "@fern-api/dynamic-ir-sdk";
import { FernIr } from "@fern-fern/ir-sdk";

/**
 * The @fern-api/dynamic-ir-sdk doesn't include the serialization layer, so the casing
 * convention doesn't match. This converts from the ir.dynamic field to the format
 * expected by DynamicSnippetsGenerator.
 */
export function convertIr(
    ir: FernIr.dynamic.DynamicIntermediateRepresentation
): DynamicFernIr.dynamic.DynamicIntermediateRepresentation {
    return ir as DynamicFernIr.dynamic.DynamicIntermediateRepresentation;
}
