import { dynamic, EndpointId } from "@fern-fern/ir-sdk/api";

import { convertEndpoints, Endpoint } from "./convertEndpoints";

export type DynamicIntermediateRepresentation = Omit<dynamic.DynamicIntermediateRepresentation, "endpoints"> & {
    endpoints: Record<EndpointId, Endpoint>;
};

/**
 * Normalizes the dynamic IR for consumption by DynamicSnippetsGenerator.
 *
 * The @fern-api/dynamic-ir-sdk client doesn't include the serialization layer,
 * which causes casing convention mismatches between the wire format and the
 * TypeScript types. Specifically:
 *
 * - `baseUrl` (wire format) vs `baseURL` (expected by DynamicSnippetsGenerator)
 * - Endpoint examples have similar casing inconsistencies
 *
 * This function converts the dynamic IR to use the correct casing conventions
 * that DynamicSnippetsGenerator expects, ensuring wire test generation works
 * correctly with the snippet generation system.
 *
 * @param ir - The dynamic IR from the generator context
 * @returns Normalized dynamic IR with corrected casing for snippet generation
 */
export function convertIr(ir: dynamic.DynamicIntermediateRepresentation): DynamicIntermediateRepresentation {
    return {
        ...ir,
        endpoints: convertEndpoints(ir.endpoints)
    };
}
