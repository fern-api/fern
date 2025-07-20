import { TypeReference } from "@fern-fern/ir-sdk/api";

export function isOptionalType(typeReference: TypeReference): boolean {
    return typeReference._visit<boolean>({
        container: (container) => {
            return container._visit<boolean>({
                optional: () => true,
                nullable: () => true,
                list: () => false,
                map: () => false,
                set: () => false,
                literal: () => false,
                _other: () => false
            });
        },
        primitive: () => false,
        named: () => false,
        unknown: () => false,
        _other: () => false
    });
}

export function getInnerTypeFromOptional(typeReference: TypeReference): TypeReference {
    return typeReference._visit<TypeReference>({
        container: (container) => {
            return container._visit<TypeReference>({
                optional: (optional) => optional,
                nullable: (nullable) => nullable,
                list: () => { throw new Error("Type is not optional"); },
                map: () => { throw new Error("Type is not optional"); },
                set: () => { throw new Error("Type is not optional"); },
                literal: () => { throw new Error("Type is not optional"); },
                _other: () => { throw new Error("Type is not optional"); }
            });
        },
        primitive: () => { throw new Error("Type is not optional"); },
        named: () => { throw new Error("Type is not optional"); },
        unknown: () => { throw new Error("Type is not optional"); },
        _other: () => { throw new Error("Type is not optional"); }
    });
} 