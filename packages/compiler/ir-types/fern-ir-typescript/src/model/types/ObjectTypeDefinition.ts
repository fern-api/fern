import { NamedType } from "./NamedType";
import { ObjectProperty } from "./ObjectProperty";

export interface ObjectTypeDefinition {
    /** A list of other types to inherit from */
    extends: NamedType[];
    properties: ObjectProperty[];
}
