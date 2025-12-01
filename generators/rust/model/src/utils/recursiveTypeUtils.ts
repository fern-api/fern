import { IntermediateRepresentation, TypeReference } from "@fern-fern/ir-sdk/api";

/**
 * Detects if a field creates a recursive reference to its containing type.
 * Handles direct recursion (Type → Type) and indirect recursion (Type → A → B → Type).
 *
 * @param containingTypeId - The type ID of the struct/object that contains this field
 * @param fieldTypeReference - The type reference of the field to check
 * @param ir - The intermediate representation containing all type definitions
 * @returns true if the field creates a recursive reference, false otherwise
 *
 * @example
 * // Direct recursion
 * struct Principal {
 *   on_behalf_of: Option<Principal>  // Returns true
 * }
 *
 * @example
 * // Indirect recursion
 * struct A { b: B }
 * struct B { a: A }  // Returns true for field 'a' in type A
 */
export function isFieldRecursive(
    containingTypeId: string,
    fieldTypeReference: TypeReference,
    ir: IntermediateRepresentation
): boolean {
    return checkRecursion(containingTypeId, fieldTypeReference, ir, new Set());
}

/**
 * Helper function that performs depth-first search to detect cycles in type references.
 *
 * @param targetTypeId - The type we're looking for in the dependency chain
 * @param typeReference - Current type reference being examined
 * @param ir - The intermediate representation
 * @param visitedPath - Set of type IDs already visited in the current path (for cycle detection)
 * @returns true if a cycle is detected, false otherwise
 */
function checkRecursion(
    targetTypeId: string,
    typeReference: TypeReference,
    ir: IntermediateRepresentation,
    visitedPath: Set<string>
): boolean {
    // Handle container types (Optional, List, Map, Set, etc.)
    if (typeReference.type === "container") {
        return typeReference.container._visit({
            // For Optional<T>, check if T is recursive
            optional: (innerType) => checkRecursion(targetTypeId, innerType, ir, visitedPath),

            // For Nullable<T>, check if T is recursive
            nullable: (innerType) => checkRecursion(targetTypeId, innerType, ir, visitedPath),

            // For List<T>, check if T is recursive
            // Note: Vec already heap-allocates, but we still need to detect the recursion
            list: (innerType) => checkRecursion(targetTypeId, innerType, ir, visitedPath),

            // For Map<K, V>, check both key and value types
            map: (mapType) =>
                checkRecursion(targetTypeId, mapType.valueType, ir, visitedPath) ||
                checkRecursion(targetTypeId, mapType.keyType, ir, visitedPath),

            // For Set<T>, check if T is recursive
            set: (innerType) => checkRecursion(targetTypeId, innerType, ir, visitedPath),

            // Literals cannot be recursive
            literal: () => false,

            // Unknown container types are assumed non-recursive
            _other: () => false
        });
    }

    // Only named types can create recursion
    if (typeReference.type !== "named") {
        return false;
    }

    const referencedTypeId = typeReference.typeId;

    // Direct match: field references the containing type
    if (referencedTypeId === targetTypeId) {
        return true;
    }

    // Cycle detection: if we've already visited this type in the current path, stop
    // This prevents infinite loops in cases like: A → B → C → B
    if (visitedPath.has(referencedTypeId)) {
        return false; // Already explored this branch
    }

    // Mark this type as visited for the current path
    const newVisited = new Set(visitedPath);
    newVisited.add(referencedTypeId);

    // Get the referenced type declaration
    const referencedTypeDecl = ir.types[referencedTypeId];
    if (!referencedTypeDecl) {
        // Type not found in IR (could be external type)
        return false;
    }

    // Check different type shapes for recursion
    return referencedTypeDecl.shape._visit({
        // Object types: check all properties
        object: (objectShape) => {
            for (const property of objectShape.properties) {
                if (checkRecursion(targetTypeId, property.valueType, ir, newVisited)) {
                    return true;
                }
            }
            return false;
        },

        // Discriminated unions: check all variants
        union: (unionShape) => {
            for (const variant of unionShape.types) {
                // Check all variant shapes for recursion
                const hasRecursion = variant.shape._visit({
                    singleProperty: (prop) => checkRecursion(targetTypeId, prop.type, ir, newVisited),
                    samePropertiesAsObject: (ref) => {
                        // Direct match with target type
                        if (ref.typeId === targetTypeId) {
                            return true;
                        }
                        // Recursively check the referenced type
                        const refType = ir.types[ref.typeId];
                        if (!refType || newVisited.has(ref.typeId)) {
                            return false;
                        }
                        const extendedVisited = new Set(newVisited);
                        extendedVisited.add(ref.typeId);
                        // Only check object types for properties
                        if (refType.shape.type === "object") {
                            for (const prop of refType.shape.properties) {
                                if (checkRecursion(targetTypeId, prop.valueType, ir, extendedVisited)) {
                                    return true;
                                }
                            }
                        }
                        return false;
                    },
                    noProperties: () => false,
                    _other: () => false
                });

                if (hasRecursion) {
                    return true;
                }
            }

            // Check base properties if present
            if (unionShape.baseProperties) {
                for (const property of unionShape.baseProperties) {
                    if (checkRecursion(targetTypeId, property.valueType, ir, newVisited)) {
                        return true;
                    }
                }
            }

            return false;
        },

        // Undiscriminated unions: check all members
        undiscriminatedUnion: (undiscriminatedUnion) => {
            for (const member of undiscriminatedUnion.members) {
                if (checkRecursion(targetTypeId, member.type, ir, newVisited)) {
                    return true;
                }
            }
            return false;
        },

        // Enum types cannot create structural recursion
        enum: () => false,

        // Alias types: check the aliased type
        alias: (aliasShape) => checkRecursion(targetTypeId, aliasShape.aliasOf, ir, newVisited),

        // Other types are not recursive
        _other: () => false
    });
}

/**
 * Extracts the inner type ID from a potentially wrapped type reference.
 * Useful for logging and debugging recursive type detection.
 *
 * @param typeReference - The type reference to unwrap
 * @returns The type ID if this is a named type (possibly wrapped), undefined otherwise
 *
 * @example
 * getReferencedTypeId(Principal) → "type_123"
 * getReferencedTypeId(Option<Principal>) → "type_123"
 * getReferencedTypeId(Vec<Principal>) → "type_123"
 * getReferencedTypeId(string) → undefined
 */
export function getReferencedTypeId(typeReference: TypeReference): string | undefined {
    if (typeReference.type === "named") {
        return typeReference.typeId;
    }

    if (typeReference.type === "container") {
        return typeReference.container._visit<string | undefined>({
            optional: (inner) => getReferencedTypeId(inner),
            nullable: (inner) => getReferencedTypeId(inner),
            list: (inner) => getReferencedTypeId(inner),
            map: (mapType) => getReferencedTypeId(mapType.valueType),
            set: (inner) => getReferencedTypeId(inner),
            literal: () => undefined,
            _other: () => undefined
        });
    }

    return undefined;
}
