import { RawSchemas } from "@fern-api/fern-definition-schema";

export function getTypeFromTypeReference(typeReference: RawSchemas.TypeReferenceSchema): string {
    if (typeof typeReference === "string") {
        return typeReference;
    }
    return typeReference.type;
}

export function getDocsFromTypeReference(typeReference: RawSchemas.TypeReferenceSchema): string | undefined {
    if (typeof typeReference === "string") {
        return undefined;
    }
    return typeReference.docs;
}

export function getDefaultFromTypeReference(typeReference: RawSchemas.TypeReferenceSchema): unknown | undefined {
    if (typeof typeReference === "string") {
        return undefined;
    }
    return typeReference.default;
}

export function getValidationFromTypeReference(
    typeReference: RawSchemas.TypeReferenceSchema
): RawSchemas.ValidationSchema | undefined {
    if (typeof typeReference === "string") {
        return undefined;
    }
    return typeReference.validation;
}

/**
 * Strips nullable/optional wrappers from a type string for use in extends.
 * When a schema with `nullable: true` is referenced via `allOf` inheritance,
 * the type reference may include a `nullable<>` wrapper, but the extends list
 * should reference the underlying type directly.
 *
 * Examples:
 * - "nullable<MyType>" -> "MyType"
 * - "optional<nullable<MyType>>" -> "MyType"
 * - "MyType" -> "MyType" (unchanged)
 */
export function stripNullableWrapperForExtends(type: string): string {
    // Match optional<nullable<Inner>> pattern
    const optionalNullableMatch = type.match(/^optional<\s*nullable<\s*(.+)\s*>\s*>$/);
    if (optionalNullableMatch != null && optionalNullableMatch[1] != null) {
        return optionalNullableMatch[1].trim();
    }

    // Match nullable<Inner> pattern
    const nullableMatch = type.match(/^nullable<\s*(.+)\s*>$/);
    if (nullableMatch != null && nullableMatch[1] != null) {
        return nullableMatch[1].trim();
    }

    return type;
}
