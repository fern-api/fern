import { ErrorDefinition } from "../errors/ErrorDefinition";
import { TypeDefinition } from "../types/TypeDefinition";
import { Services } from "./Services";

/**
 * Complete representation of the API schema
 */
export interface IntermediateRepresentation {
    workspaceName: string | null | undefined;
    /** The types described by this API */
    types: TypeDefinition[];
    /** The services exposed by this API */
    services: Services;
    errors: ErrorDefinition[];
}
