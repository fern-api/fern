import {
    NamedType,
    ObjectProperty,
    PrimitiveTypeV1,
    TypeReference,
    UndiscriminatedUnionMember
} from "@fern-fern/ir-sdk/api";
import { ModelGeneratorContext } from "../ModelGeneratorContext";

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

export function isDateType(typeRef: TypeReference): boolean {
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
        dateTime: () => false,
        base64: () => false,
        uuid: () => false,
        _other: () => false
    });
}

export function isDateTimeOnlyType(typeRef: TypeReference): boolean {
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
    if (typeRef.type === "container") {
        return typeRef.container._visit({
            map: () => true,
            set: () => true,
            list: () => false,
            optional: (innerType) => isCollectionType(innerType),
            nullable: (innerType) => isCollectionType(innerType),
            literal: () => false,
            _other: () => false
        });
    }
    return false;
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

/**
 * Check if a primitive type supports PartialEq trait in Rust
 */
export function primitiveSupportsPartialEq(primitive: PrimitiveTypeV1): boolean {
    return PrimitiveTypeV1._visit(primitive, {
        string: () => true,
        boolean: () => true,
        integer: () => true,
        uint: () => true,
        uint64: () => true,
        long: () => true,
        float: () => true, // f32 DOES implement PartialEq (but not Eq/Hash)
        double: () => true, // f64 DOES implement PartialEq (but not Eq/Hash)
        bigInteger: () => true,
        date: () => true,
        dateTime: () => true,
        base64: () => true,
        uuid: () => true,
        _other: () => true // Be more permissive for PartialEq
    });
}

/**
 * Check if a primitive type supports Hash and Eq traits in Rust
 */
export function primitiveSupportsHashAndEq(primitive: PrimitiveTypeV1): boolean {
    return PrimitiveTypeV1._visit(primitive, {
        string: () => true,
        boolean: () => true,
        integer: () => true,
        uint: () => true,
        uint64: () => true,
        long: () => true,
        float: () => false, // f32 doesn't implement Hash or Eq
        double: () => false, // f64 doesn't implement Hash or Eq
        bigInteger: () => true,
        date: () => true,
        dateTime: () => true,
        base64: () => true,
        uuid: () => true,
        _other: () => false
    });
}

export function isFloatingPointType(typeReference: TypeReference): boolean {
    if (typeReference.type !== "primitive") {
        return false;
    }
    return PrimitiveTypeV1._visit(typeReference.primitive.v1, {
        float: () => true,
        double: () => true,
        string: () => false,
        boolean: () => false,
        integer: () => false,
        uint: () => false,
        uint64: () => false,
        long: () => false,
        bigInteger: () => false,
        date: () => false,
        dateTime: () => false,
        base64: () => false,
        uuid: () => false,
        _other: () => false
    });
}

/**
 * Shared utility functions for type analysis across generators
 */

export function typeSupportsHashAndEq(
    typeRef: TypeReference,
    context: ModelGeneratorContext,
    analysisStack?: Set<string>
): boolean {
    return TypeReference._visit(typeRef, {
        primitive: (primitive) => primitiveSupportsHashAndEq(primitive.v1), // Check each primitive individually
        named: (namedType) => {
            // Check if this named type is likely to support Hash and Eq
            return namedTypeSupportsHashAndEq(namedType, context, analysisStack);
        },
        container: (container) => {
            return container._visit({
                list: (listType) => typeSupportsHashAndEq(listType.itemType, context, analysisStack),
                optional: (optionalType) => typeSupportsHashAndEq(optionalType, context, analysisStack),
                nullable: (nullableType) => typeSupportsHashAndEq(nullableType, context, analysisStack),
                map: () => false, // HashMap/BTreeMap don't implement Hash
                set: () => false, // HashSet/BTreeSet don't implement Hash
                literal: () => true, // Literals support Hash and Eq
                _other: () => false
            });
        },
        unknown: () => false, // serde_json::Value doesn't implement Hash
        _other: () => false
    });
}

/**
 * Check if a type supports PartialEq trait in Rust (more permissive than Hash/Eq)
 */
export function typeSupportsPartialEq(
    typeRef: TypeReference,
    context: ModelGeneratorContext,
    analysisStack?: Set<string>
): boolean {
    return TypeReference._visit(typeRef, {
        primitive: (primitive) => primitiveSupportsPartialEq(primitive.v1),
        named: (namedType) => {
            return namedTypeSupportsPartialEq(namedType, context, analysisStack);
        },
        container: (container) => {
            return container._visit({
                list: (listType) => typeSupportsPartialEq(listType.itemType, context, analysisStack),
                optional: (optionalType) => typeSupportsPartialEq(optionalType, context, analysisStack),
                nullable: (nullableType) => typeSupportsPartialEq(nullableType, context, analysisStack),
                map: (mapType) =>
                    typeSupportsPartialEq(mapType.keyType, context, analysisStack) &&
                    typeSupportsPartialEq(mapType.valueType, context, analysisStack), // HashMap supports PartialEq!
                set: (setType) => typeSupportsPartialEq(setType.itemType, context, analysisStack), // HashSet supports PartialEq!
                literal: () => true,
                _other: () => false
            });
        },
        unknown: () => true, // serde_json::Value does implement PartialEq
        _other: () => false
    });
}

export function namedTypeSupportsPartialEq(
    namedType: NamedType,
    context: ModelGeneratorContext,
    analysisStack: Set<string> = new Set()
): boolean {
    const typeDeclaration = context.ir.types[namedType.typeId];
    if (!typeDeclaration) {
        return true; // Be optimistic for unknown types
    }

    // Prevent infinite recursion
    if (analysisStack.has(namedType.typeId)) {
        return true; // Assume cyclic references support PartialEq
    }
    analysisStack.add(namedType.typeId);

    let result = true;
    if (typeDeclaration.shape.type === "enum") {
        result = true; // Enums always support PartialEq
    } else if (typeDeclaration.shape.type === "undiscriminatedUnion") {
        result = typeDeclaration.shape.members.every((member: UndiscriminatedUnionMember) =>
            typeSupportsPartialEq(member.type, context, analysisStack)
        );
    } else if (typeDeclaration.shape.type === "object") {
        // Check both properties and extended types
        const propertiesSupport = typeDeclaration.shape.properties.every((property: ObjectProperty) =>
            typeSupportsPartialEq(property.valueType, context, analysisStack)
        );
        const extendsSupport = typeDeclaration.shape.extends.every((parentType) =>
            namedTypeSupportsPartialEq(
                {
                    name: parentType.name,
                    typeId: parentType.typeId,
                    default: undefined,
                    inline: undefined,
                    fernFilepath: parentType.fernFilepath,
                    displayName: parentType.name.originalName
                },
                context,
                analysisStack
            )
        );
        result = propertiesSupport && extendsSupport;
    } else if (typeDeclaration.shape.type === "alias") {
        result = typeSupportsPartialEq(typeDeclaration.shape.aliasOf, context, analysisStack);
    }

    analysisStack.delete(namedType.typeId);
    return result;
}

export function namedTypeSupportsHashAndEq(
    namedType: NamedType,
    context: ModelGeneratorContext,
    analysisStack: Set<string> = new Set()
): boolean {
    const typeDeclaration = context.ir.types[namedType.typeId];
    if (!typeDeclaration) {
        return false; // Unknown type, be conservative
    }

    // Check the type's shape to determine if it can support Hash/Eq
    if (typeDeclaration.shape.type === "enum") {
        // Regular enums with string literals support Hash/Eq
        return true;
    } else if (typeDeclaration.shape.type === "undiscriminatedUnion") {
        // Recursively check if all variants support Hash/Eq (but prevent infinite recursion)
        if (analysisStack.has(namedType.typeId)) {
            return false; // Prevent infinite recursion
        }
        analysisStack.add(namedType.typeId);
        const result = typeDeclaration.shape.members.every((member: UndiscriminatedUnionMember) =>
            typeSupportsHashAndEq(member.type, context, analysisStack)
        );
        analysisStack.delete(namedType.typeId);
        return result;
    } else if (typeDeclaration.shape.type === "object") {
        // Objects with only hashable fields support Hash/Eq (but prevent infinite recursion)
        if (analysisStack.has(namedType.typeId)) {
            return false; // Prevent infinite recursion
        }
        analysisStack.add(namedType.typeId);
        // Check both properties and extended types
        const propertiesSupport = typeDeclaration.shape.properties.every((property: ObjectProperty) =>
            typeSupportsHashAndEq(property.valueType, context, analysisStack)
        );
        const extendsSupport = typeDeclaration.shape.extends.every((parentType) =>
            namedTypeSupportsHashAndEq(
                {
                    name: parentType.name,
                    typeId: parentType.typeId,
                    default: undefined,
                    inline: undefined,
                    fernFilepath: parentType.fernFilepath,
                    displayName: parentType.name.originalName
                },
                context,
                analysisStack
            )
        );
        const result = propertiesSupport && extendsSupport;
        analysisStack.delete(namedType.typeId);
        return result;
    } else if (typeDeclaration.shape.type === "alias") {
        // Aliases support Hash/Eq if their underlying type does (but prevent infinite recursion)
        if (analysisStack.has(namedType.typeId)) {
            return false; // Prevent infinite recursion
        }
        analysisStack.add(namedType.typeId);
        const result = typeSupportsHashAndEq(typeDeclaration.shape.aliasOf, context, analysisStack);
        analysisStack.delete(namedType.typeId);
        return result;
    }

    return false; // Other types (unions, etc.) - be conservative
}

export function extractNamedTypesFromTypeReference(
    typeRef: TypeReference,
    typeNames: {
        snakeCase: { unsafeName: string };
        pascalCase: { unsafeName: string };
    }[],
    visited: Set<string>
): void {
    if (typeRef.type === "named") {
        const typeName = typeRef.name.originalName;
        if (!visited.has(typeName)) {
            visited.add(typeName);
            typeNames.push({
                snakeCase: { unsafeName: typeRef.name.snakeCase.unsafeName },
                pascalCase: { unsafeName: typeRef.name.pascalCase.unsafeName }
            });
        }
    } else if (typeRef.type === "container") {
        typeRef.container._visit({
            list: (listType) => extractNamedTypesFromTypeReference(listType.itemType, typeNames, visited),
            set: (setType) => extractNamedTypesFromTypeReference(setType.itemType, typeNames, visited),
            optional: (optionalType) => extractNamedTypesFromTypeReference(optionalType, typeNames, visited),
            nullable: (nullableType) => extractNamedTypesFromTypeReference(nullableType, typeNames, visited),
            map: (mapType) => {
                extractNamedTypesFromTypeReference(mapType.keyType, typeNames, visited);
                extractNamedTypesFromTypeReference(mapType.valueType, typeNames, visited);
            },
            literal: () => {
                // No named types in literals
            },
            _other: () => {
                // Unknown container type
            }
        });
    }
}
