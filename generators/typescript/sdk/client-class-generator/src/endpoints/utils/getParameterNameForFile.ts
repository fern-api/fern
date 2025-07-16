import { FileProperty } from "@fern-fern/ir-sdk/api";

export function getParameterNameForFile({
    property,
    wrapperName,
    includeSerdeLayer,
    retainOriginalCasing,
    inlineFileProperties
}: {
    property: FileProperty;
    wrapperName: string;
    retainOriginalCasing: boolean;
    includeSerdeLayer: boolean;
    inlineFileProperties: boolean;
}): string {
    const parameterName =
        includeSerdeLayer && !retainOriginalCasing
            ? property.key.name.camelCase.unsafeName
            : property.key.name.originalName;
    if (inlineFileProperties) {
        return `${wrapperName}.${parameterName}`;
    }
    return parameterName;
}
