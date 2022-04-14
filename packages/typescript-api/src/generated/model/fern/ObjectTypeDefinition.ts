import { ObjectField } from "./ObjectField";
import { TypeName } from "./TypeName";

export interface ObjectTypeDefinition {
    /** A list of other types to inherit from */
    extends: TypeName[];
    fields: ObjectField[];
}
