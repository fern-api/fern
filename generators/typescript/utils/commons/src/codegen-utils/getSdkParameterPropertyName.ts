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
    parameterNaming
}: {
    name: FernIr.NameAndWireValue | FernIr.Name;
    includeSerdeLayer: boolean;
    retainOriginalCasing: boolean;
    parameterNaming: "originalName" | "wireValue" | "camelCase" | "snakeCase" | "default";
}): string {
    switch (parameterNaming) {
        case "originalName":
            return isNameAndWireValue(name) ? name.name.originalName : name.originalName;
        case "wireValue":
            return isNameAndWireValue(name) ? name.wireValue : name.originalName;
        case "camelCase":
            return isNameAndWireValue(name) ? name.name.camelCase.unsafeName : name.camelCase.unsafeName;
        case "snakeCase":
            return isNameAndWireValue(name) ? name.name.snakeCase.unsafeName : name.snakeCase.unsafeName;
        case "default":
            break; // fall through to default behavior
        default:
            assertNever(parameterNaming);
    }

    if (isNameAndWireValue(name)) {
        return includeSerdeLayer && !retainOriginalCasing ? name.name.camelCase.unsafeName : name.wireValue;
    } else {
        return includeSerdeLayer && !retainOriginalCasing ? name.camelCase.unsafeName : name.originalName;
    }
}

function isNameAndWireValue(name: FernIr.NameAndWireValue | FernIr.Name): name is FernIr.NameAndWireValue {
    return (name as FernIr.NameAndWireValue).wireValue !== undefined;
}
