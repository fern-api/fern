import { FileProperty } from "@fern-fern/ir-sdk/api";

export function getParameterNameForFile({
    property,
    wrapperName,
    includeSerdeLayer,
    retainOriginalCasing,
    wrapFileProperties
}: {
    property: FileProperty;
    wrapperName: string;
    retainOriginalCasing: boolean;
    includeSerdeLayer: boolean;
    wrapFileProperties: boolean;
}): string {
    const parameterName =
        includeSerdeLayer && !retainOriginalCasing
            ? property.key.name.camelCase.unsafeName
            : property.key.name.originalName;
    if (wrapFileProperties) {
        return `${wrapperName}.${parameterName}`;
    }
    return parameterName;
}
