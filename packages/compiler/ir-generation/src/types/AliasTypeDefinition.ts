import { TypeReference } from "./TypeReference";

export interface AliasTypeDefinition {
    aliasOf: TypeReference;
    isId: boolean;
}
