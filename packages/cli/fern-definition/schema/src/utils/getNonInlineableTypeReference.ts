import {
    InlineableTypeReferenceSchema,
    InlinedListTypeReferenceSchema,
    InlinedTypeReferenceSchema,
    NonInlinedTypeReferenceSchema
} from "../schemas";

export function getInlineableTypeReference(
    property: InlineableTypeReferenceSchema
): InlinedTypeReferenceSchema | InlinedListTypeReferenceSchema | undefined {
    if (typeof property === "string") {
        return undefined;
    }
    if (isNonInlinedTypeReference(property)) {
        return undefined;
    }
    return property;
}

export function getNonInlineableTypeReference(
    property: InlineableTypeReferenceSchema
): NonInlinedTypeReferenceSchema | string | undefined {
    if (isNonInlinedTypeReference(property) || isString(property)) {
        return property;
    }
    return undefined;
}

function isNonInlinedTypeReference(property: InlineableTypeReferenceSchema): property is NonInlinedTypeReferenceSchema {
    if (typeof property === "string") {
        return false;
    }
    if ((property as InlinedListTypeReferenceSchema)?.value != null) {
        return false;
    }
    return typeof property.type === "string";
}

function isString(property: InlineableTypeReferenceSchema): property is string {
    return typeof property === "string";
}
