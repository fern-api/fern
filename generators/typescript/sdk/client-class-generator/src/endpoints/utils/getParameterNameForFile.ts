import { FileProperty } from "@fern-fern/ir-sdk/api";

export function getParameterNameForFile({
    property,
    wrapperName,
    retainOriginalCasing,
    wrapFileProperties
}: {
    property: FileProperty;
    wrapperName: string;
    retainOriginalCasing: boolean;
    wrapFileProperties: boolean;
}): string {
    const parameterName = retainOriginalCasing
        ? property.key.name.originalName
        : property.key.name.camelCase.unsafeName;
    if (wrapFileProperties) {
        return `${wrapperName}.${parameterName}`;
    }
    return parameterName;
}
