import { Services } from "./Services";
import { TypeDefinition } from "./TypeDefinition";

/**
 * Complete representation of the API schema
 */
export interface IntermediateRepresentation {
    /** The types described by this API */
    types: TypeDefinition[];
    /** The services exposed by this API */
    services: Services;
}
