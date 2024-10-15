import {
    InlineableTypeReferenceDeclarationWithNameSchema,
    TypeReferenceDeclarationWithName,
    TypeReferenceDeclarationWithNameSchema
} from "../schemas";

export function getNonInlineableTypeReference(
    property: InlineableTypeReferenceDeclarationWithNameSchema
): TypeReferenceDeclarationWithNameSchema | undefined {
    if (isTypeReference(property) || isString(property)) {
        return property;
    }
    return undefined;
}

function isTypeReference(
    property: InlineableTypeReferenceDeclarationWithNameSchema
): property is TypeReferenceDeclarationWithName {
    if (typeof property === "string") {
        return false;
    }
    return typeof property.type === "string";
}

function isString(property: InlineableTypeReferenceDeclarationWithNameSchema): property is string {
    return typeof property === "string";
}
