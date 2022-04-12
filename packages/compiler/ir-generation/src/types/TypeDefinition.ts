import { TypeName } from "./NamedTypeReference";
import { Type } from "./Type";
import { WithDocs } from "./WithDocs";

export interface TypeDefinition extends WithDocs {
    extends: TypeName[];
    name: TypeName;
    shape: Type;
}
