import { RawSchemas } from "@fern-api/yaml-schema";

export function getTypeFromTypeReference(typeReference: RawSchemas.TypeReferenceWithDocsSchema): string {
    if (typeof typeReference === "string") {
        return typeReference;
    }
    return typeReference.type;
}
