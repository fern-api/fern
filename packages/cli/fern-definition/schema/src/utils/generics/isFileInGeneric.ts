import { isTypeInGeneric } from "./isTypeInGeneric"
import { ParseGenericNested } from "./parseGenericNested"

export function isFileInGeneric(input: ParseGenericNested): boolean {
    return isTypeInGeneric({ input, typeName: "file" })
}
