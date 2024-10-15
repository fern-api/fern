import { RawSchemas } from "@fern-api/fern-definition-schema";

export function isNonInlinedTypeReference(
    property: RawSchemas.InlineableTypeReferenceDeclarationWithNameSchema
): property is RawSchemas.TypeReferenceDeclarationWithName {
    if (typeof property === "string") {
        return false;
    }
    return typeof property.type === "string";
}

export function isStringTypeReference(
    property: RawSchemas.InlineableTypeReferenceDeclarationWithNameSchema
): property is string {
    return typeof property === "string";
}
