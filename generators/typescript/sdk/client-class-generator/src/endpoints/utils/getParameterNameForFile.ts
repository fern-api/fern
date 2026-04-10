import { CaseConverter, getOriginalName } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";

export function getParameterNameForFile({
    property,
    wrapperName,
    includeSerdeLayer,
    retainOriginalCasing,
    inlineFileProperties,
    caseConverter
}: {
    property: FernIr.FileProperty;
    wrapperName: string;
    retainOriginalCasing: boolean;
    includeSerdeLayer: boolean;
    inlineFileProperties: boolean;
    caseConverter: CaseConverter;
}): string {
    const parameterName =
        includeSerdeLayer && !retainOriginalCasing
            ? caseConverter.camelUnsafe(property.key)
            : getOriginalName(property.key);
    if (inlineFileProperties) {
        return `${wrapperName}.${parameterName}`;
    }
    return parameterName;
}
