import { ObjectProperty, TypeReference } from "@fern-fern/ir-sdk/api";

export function isOptionalProperty(p: ObjectProperty) {
    return isOptionalType(p.valueType);
}

export function isOptionalType(typeReference: TypeReference) {
    return typeReference.type === "container" && typeReference.container.type === "optional";
}
