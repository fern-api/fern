import { RawSchemas } from "@fern-api/yaml-schema";
import { getTypeFromTypeReference } from "./getTypeFromTypeReference";

export function wrapTypeReferenceAsOptional(
    typeReference: RawSchemas.TypeReferenceWithDocsSchema
): RawSchemas.TypeReferenceWithDocsSchema {
    const type = getTypeFromTypeReference(typeReference);
    if (type.startsWith("optional")) {
        return typeReference;
    } else if (typeof typeReference === "string") {
        return `optional<${typeReference}>`;
    } else {
        return { ...typeReference, type: `optional<${typeReference.type}>` };
    }
}
