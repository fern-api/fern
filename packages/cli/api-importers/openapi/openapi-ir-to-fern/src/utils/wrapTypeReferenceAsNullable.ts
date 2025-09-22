import { RawSchemas } from "@fern-api/fern-definition-schema";

import { getTypeFromTypeReference } from "./getTypeFromTypeReference";

// Converts type => nullable<type> and optional<type> => optional<nullable<type>>.
// Doesn't allow for nested nullable types.
export function wrapTypeReferenceAsNullable(
    typeReference: RawSchemas.TypeReferenceSchema
): RawSchemas.TypeReferenceSchema {
    const type = getTypeFromTypeReference(typeReference);
    if (type.startsWith("nullable<") || type.startsWith("optional<nullable<")) {
        return typeReference;
    } else if (typeof typeReference === "string") {
        return wrapTypeAsNullable(typeReference);
    } else {
        return { ...typeReference, type: wrapTypeAsNullable(typeReference.type) };
    }
}

function wrapTypeAsNullable(type: string): string {
    if (type.startsWith("optional<")) {
        return type.replace("optional<", "optional<nullable<") + ">";
    }
    return `nullable<${type}>`;
}
