import { isTypeInGeneric } from "./isTypeInGeneric.js";
import { ParseGenericNested } from "./parseGenericNested.js";

export function isFileInGeneric(input: ParseGenericNested): boolean {
    return isTypeInGeneric({ input, typeName: "file" });
}
