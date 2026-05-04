import { CaseConverter, getOriginalName, getWireValue } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-fern/ir-sdk";

/**
 * Determines the user-facing property name for SDK parameters (query, header, path, file).
 * This function centralizes parameter naming logic and supports the parameterNaming feature flag.
 */
export function getSdkParameterPropertyName({
    name,
    includeSerdeLayer,
    retainOriginalCasing,
    parameterNaming,
    caseConverter
}: {
    name: FernIr.NameAndWireValueOrString | FernIr.NameOrString;
    includeSerdeLayer: boolean;
    retainOriginalCasing: boolean;
    parameterNaming: "originalName" | "wireValue" | "camelCase" | "snakeCase" | "default";
    caseConverter: CaseConverter;
}): string {
    switch (parameterNaming) {
        case "originalName":
            return isNameAndWireValue(name) ? getOriginalName(name.name) : getOriginalName(name);
        case "wireValue":
            return isNameAndWireValue(name) ? getWireValue(name) : getOriginalName(name);
        case "camelCase":
            return isNameAndWireValue(name) ? caseConverter.camelUnsafe(name.name) : caseConverter.camelUnsafe(name);
        case "snakeCase":
            return isNameAndWireValue(name) ? caseConverter.snakeUnsafe(name.name) : caseConverter.snakeUnsafe(name);
        case "default":
            break; // fall through to default behavior
        default:
            assertNever(parameterNaming);
    }

    if (isNameAndWireValue(name)) {
        return includeSerdeLayer && !retainOriginalCasing ? caseConverter.camelUnsafe(name.name) : getWireValue(name);
    } else {
        return includeSerdeLayer && !retainOriginalCasing ? caseConverter.camelUnsafe(name) : getOriginalName(name);
    }
}

function isNameAndWireValue(
    name: FernIr.NameAndWireValueOrString | FernIr.NameOrString
): name is FernIr.NameAndWireValue {
    return typeof name === "object" && "wireValue" in name;
}
