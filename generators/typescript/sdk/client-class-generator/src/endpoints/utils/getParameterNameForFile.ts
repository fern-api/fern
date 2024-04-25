import { FileProperty } from "@fern-fern/ir-sdk/api";

export function getParameterNameForFile({
    property,
    retainOriginalCasing
}: {
    property: FileProperty;
    retainOriginalCasing: boolean;
}): string {
    return retainOriginalCasing ? property.key.name.originalName : property.key.name.camelCase.unsafeName;
}
