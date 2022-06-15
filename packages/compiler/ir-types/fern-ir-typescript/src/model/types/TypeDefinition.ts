import { WithDocs } from "../commons/WithDocs";
import { NamedType } from "./NamedType";
import { Type } from "./Type";

/**
 * A type, which is a name and a shape
 */
export interface TypeDefinition extends WithDocs {
    name: NamedType;
    shape: Type;
}
