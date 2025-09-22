import { RawSchemas } from "@fern-api/fern-definition-schema";

import { getTypeFromTypeReference } from "./getTypeFromTypeReference";

// Converts type => optional<type> and nullable<type> => optional<nullable<type>>.
// Doesn't allow for nested optional types.
export function wrapTypeReferenceAsOptional(
    typeReference: RawSchemas.TypeReferenceSchema
): RawSchemas.TypeReferenceSchema {
    const type = getTypeFromTypeReference(typeReference);
    if (type.startsWith("optional<")) {
        return typeReference;
    } else if (typeof typeReference === "string") {
        return wrapTypeAsOptional(typeReference);
    } else {
        return { ...typeReference, type: wrapTypeAsOptional(typeReference.type) };
    }
}

function wrapTypeAsOptional(type: string): string {
    return `optional<${type}>`;
}
