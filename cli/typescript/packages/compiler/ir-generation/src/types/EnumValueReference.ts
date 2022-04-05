import { TypeName } from "./NamedTypeReference";

export interface EnumValueReference {
    referencedEnum: TypeName;
    value: string;
}
