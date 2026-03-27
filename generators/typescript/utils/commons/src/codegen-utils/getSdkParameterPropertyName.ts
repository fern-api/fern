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
        if (includeSerdeLayer && !retainOriginalCasing) {
            return name.name.camelCase.unsafeName;
        }
        // Without serde layer (or with retainOriginalCasing), use wire value unless
        // there's an explicit name override (e.g., x-fern-parameter-name). Detect
        // overrides by normalizing both the snake_case name and wireValue (strip
        // non-alphanumeric chars, lowercase) before comparing. This avoids false
        // positives from casing/punctuation differences (e.g., X-TEST-HEADER vs
        // x_test_header) while still detecting true overrides (e.g., filter_assigned_to
        // vs assigned_to).
        if (normalizeForComparison(name.name.snakeCase.unsafeName) !== normalizeForComparison(name.wireValue)) {
            return name.name.camelCase.unsafeName;
        }
        return name.wireValue;
    } else {
        return includeSerdeLayer && !retainOriginalCasing ? name.camelCase.unsafeName : name.originalName;
    }
}

function isNameAndWireValue(name: FernIr.NameAndWireValue | FernIr.Name): name is FernIr.NameAndWireValue {
    return (name as FernIr.NameAndWireValue).wireValue !== undefined;
}

/**
 * Strips non-alphanumeric characters and lowercases a string for comparison.
 * Used to detect explicit name overrides (e.g., x-fern-parameter-name) while
 * ignoring casing/punctuation differences (e.g., X-TEST-HEADER vs x_test_header).
 */
function normalizeForComparison(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}
