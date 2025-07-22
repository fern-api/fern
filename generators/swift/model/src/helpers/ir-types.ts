import { ObjectProperty, TypeReference } from "@fern-fern/ir-sdk/api";

export function isOptionalProperty(p: ObjectProperty): boolean {
    return isOptionalType(p.valueType);
}

export function isOptionalType(typeReference: TypeReference): boolean {
    return typeReference.type === "container" && typeReference.container.type === "optional";
}
