import { PrimitiveTypeV1, TypeReference } from "@fern-fern/ir-sdk/api";

/**
 * Utility functions to check primitive types without repeating the visitor pattern
 */

export function isDateTimeType(typeRef: TypeReference): boolean {
    if (typeRef.type !== "primitive") {
        return false;
    }

    return PrimitiveTypeV1._visit(typeRef.primitive.v1, {
        string: () => false,
        boolean: () => false,
        integer: () => false,
        uint: () => false,
        uint64: () => false,
        long: () => false,
        float: () => false,
        double: () => false,
        bigInteger: () => false,
        date: () => true,
        dateTime: () => true,
        base64: () => false,
        uuid: () => false,
        _other: () => false
    });
}

export function isUuidType(typeRef: TypeReference): boolean {
    if (typeRef.type !== "primitive") {
        return false;
    }

    return PrimitiveTypeV1._visit(typeRef.primitive.v1, {
        string: () => false,
        boolean: () => false,
        integer: () => false,
        uint: () => false,
        uint64: () => false,
        long: () => false,
        float: () => false,
        double: () => false,
        bigInteger: () => false,
        date: () => false,
        dateTime: () => false,
        base64: () => false,
        uuid: () => true,
        _other: () => false
    });
}

export function isChronoType(typeRef: TypeReference): boolean {
    if (typeRef.type !== "primitive") {
        return false;
    }

    return PrimitiveTypeV1._visit(typeRef.primitive.v1, {
        string: () => false,
        boolean: () => false,
        integer: () => false,
        uint: () => false,
        uint64: () => false,
        long: () => false,
        float: () => false,
        double: () => false,
        bigInteger: () => false,
        date: () => true,
        dateTime: () => true,
        base64: () => false,
        uuid: () => false,
        _other: () => false
    });
}

export function isCollectionType(typeRef: TypeReference): boolean {
    return typeRef.type === "container" && (typeRef.container.type === "map" || typeRef.container.type === "set");
}

export function isUnknownType(typeRef: TypeReference): boolean {
    return typeRef.type === "unknown";
}

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
                list: () => {
                    throw new Error("Type is not optional");
                },
                map: () => {
                    throw new Error("Type is not optional");
                },
                set: () => {
                    throw new Error("Type is not optional");
                },
                literal: () => {
                    throw new Error("Type is not optional");
                },
                _other: () => {
                    throw new Error("Type is not optional");
                }
            });
        },
        primitive: () => {
            throw new Error("Type is not optional");
        },
        named: () => {
            throw new Error("Type is not optional");
        },
        unknown: () => {
            throw new Error("Type is not optional");
        },
        _other: () => {
            throw new Error("Type is not optional");
        }
    });
}
