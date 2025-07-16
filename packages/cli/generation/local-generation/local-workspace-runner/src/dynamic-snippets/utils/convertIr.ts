import { EndpointId, dynamic } from '@fern-api/ir-sdk'

import { Endpoint, convertEndpoints } from './convertEndpoints'

export type DynamicIntermediateRepresentation = Omit<dynamic.DynamicIntermediateRepresentation, 'endpoints'> & {
    endpoints: Record<EndpointId, Endpoint>
}

/**
 * The @fern-api/dynamic-ir-sdk doesn't include the serialization layer, so the casing
 * convention doesn't match.
 */
export function convertIr(ir: dynamic.DynamicIntermediateRepresentation): DynamicIntermediateRepresentation {
    return {
        ...ir,
        endpoints: convertEndpoints(ir.endpoints)
    }
}
