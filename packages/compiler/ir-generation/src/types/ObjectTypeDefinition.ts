import { ObjectField } from "./ObjectField";
import { TypeName } from "./TypeName";

export interface ObjectTypeDefinition {
    extends: TypeName[];
    fields: ObjectField[];
}
