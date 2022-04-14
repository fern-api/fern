import { Type } from "./Type";
import { TypeName } from "./TypeName";
import { WithDocs } from "./WithDocs";

/**
 * A type, which is a name and a shape
 */
export interface TypeDefinition extends WithDocs {
    name: TypeName;
    shape: Type;
}
