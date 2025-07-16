import { TypeReference } from "@fern-fern/ir-sdk/api"

// Should this be in the codegen package?
export function isTypeOptional(typeReference: TypeReference): boolean {
    return typeReference._visit<boolean>({
        container: (ct) =>
            ct._visit({
                list: () => false,
                map: () => false,
                optional: () => true,
                set: () => false,
                literal: () => false,
                _other: () => false
            }),
        named: () => false,
        primitive: () => false,
        _other: () => false,
        unknown: () => true
    })
}
