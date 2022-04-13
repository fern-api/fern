import { Type } from "./Type";
import { TypeName } from "./TypeName";
import { WithDocs } from "./WithDocs";

export interface TypeDefinition extends WithDocs {
    name: TypeName;
    shape: Type;
}
