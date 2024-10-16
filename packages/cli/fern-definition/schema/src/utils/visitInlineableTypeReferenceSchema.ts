import {
    InlineableTypeReferenceSchema,
    InlinedListTypeReferenceSchema,
    InlinedTypeDeclaration,
    InlinedTypeReferenceSchema,
    NonInlinedTypeReferenceSchema
} from "../schemas";

export interface InlineTypeSchemaReferenceVisitor<R> {
    reference: (value: string) => R;
    detailedReference: (value: NonInlinedTypeReferenceSchema) => R;
    inlineType: (value: InlinedTypeDeclaration) => R;
    inlineList: (value: InlinedListTypeReferenceSchema) => R;
}

export function visitInlineableTypeReferenceSchema<R>(
    type: InlineableTypeReferenceSchema,
    visitor: InlineTypeSchemaReferenceVisitor<R>
): R {
    if (typeof type === "string") {
        return visitor.reference(type);
    } else if (isInlineType(type)) {
        return visitor.inlineType(type.type);
    } else if (isInlineList(type)) {
        return visitor.inlineList(type);
    } else {
        return visitor.detailedReference(type);
    }
}

function isNonInlined(
    type: NonInlinedTypeReferenceSchema | InlinedTypeReferenceSchema | InlinedListTypeReferenceSchema
): type is NonInlinedTypeReferenceSchema {
    return !isInlineType(type) && !isInlineList(type);
}

function isInlineType(
    type: NonInlinedTypeReferenceSchema | InlinedTypeReferenceSchema | InlinedListTypeReferenceSchema
): type is InlinedTypeReferenceSchema {
    return (
        (type as InlinedTypeReferenceSchema)?.type != null &&
        typeof (type as InlinedTypeReferenceSchema)?.type === "object"
    );
}

function isInlineList(
    type: NonInlinedTypeReferenceSchema | InlinedTypeReferenceSchema | InlinedListTypeReferenceSchema
): type is InlinedListTypeReferenceSchema {
    return (type as InlinedListTypeReferenceSchema)?.value != null;
}
