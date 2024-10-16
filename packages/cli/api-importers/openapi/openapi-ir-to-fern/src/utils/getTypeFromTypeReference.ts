import { RawSchemas } from "@fern-api/fern-definition-schema";

export function getTypeFromTypeReference(typeReference: RawSchemas.TypeReferenceSchema): string {
    if (typeof typeReference === "string") {
        return typeReference;
    }
    return typeReference.type;
}

export function getTypeFromInlineTypeReference(
    typeReference: RawSchemas.InlineableTypeReferenceDeclarationWithNameSchema
): RawSchemas.InlineableTypeReference {
    if (typeof typeReference === "string") {
        return typeReference;
    }
    return typeReference.type;
}

export function getDocsFromTypeReference(typeReference: RawSchemas.InlineableTypeReference): string | undefined {
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
