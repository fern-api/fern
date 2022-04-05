import { Services } from "./Services";
import { TypeDefinition } from "./TypeDefinition";

export interface IntermediateRepresentation {
    types: TypeDefinition[];
    services: Services;
}
