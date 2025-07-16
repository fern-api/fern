import { ParseGenericNested } from "./parseGenericNested"

export function isTypeInGeneric({ input, typeName }: { input: ParseGenericNested; typeName: string }): boolean {
    for (const arg of input.arguments) {
        if (typeof arg === "string") {
            if (arg === typeName) {
                return true
            }
        } else {
            if (isTypeInGeneric({ input: arg, typeName })) {
                return true
            }
        }
    }
    return false
}
