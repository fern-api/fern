import { TypeName } from "./TypeName";

export interface EnumValueReference {
    referencedEnum: TypeName;
    value: string;
}
