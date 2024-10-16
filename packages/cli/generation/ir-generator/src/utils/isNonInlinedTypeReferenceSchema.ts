import { RawSchemas } from "@fern-api/fern-definition-schema";

export function isNonInlinedTypeReference(
    property: RawSchemas.InlineableTypeReferenceSchema
): property is RawSchemas.TypeReferenceDeclarationWithName {
    if (typeof property === "string") {
        return false;
    }
    return typeof property.type === "string";
}

export function isStringTypeReference(property: RawSchemas.InlineableTypeReferenceSchema): property is string {
    return typeof property === "string";
}
