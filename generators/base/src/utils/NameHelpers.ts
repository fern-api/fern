import { NameAndWireValue, NameAndWireValueOrString } from "@fern-api/ir-sdk";
import { NameInput } from "./CaseConverter.js";

/**
 * Standalone helper to safely extract the wire value from a NameAndWireValueOrString.
 * Handles both compressed string form (V66+ IR) and full NameAndWireValue object form.
 */
export function getWireValue(input: NameAndWireValueOrString): string {
    if (typeof input === "string") {
        return input;
    }
    return input.wireValue;
}

/**
 * Standalone helper to safely extract the original name from any name-like input.
 * Handles all forms: compressed string (V66+ IR), full Name, and NameAndWireValue
 * (where the inner .name may itself be a string or full Name).
 */
export function getOriginalName(input: NameInput): string {
    if (typeof input === "string") {
        return input;
    }
    if (isNameAndWireValue(input)) {
        return getOriginalName(input.name);
    }
    return input.originalName;
}

/**
 * Type guard to distinguish NameAndWireValue from Name.
 * NameAndWireValue has { wireValue: string, name: NameOrString }
 * Name has { originalName: string, camelCase: ..., ... }
 */
function isNameAndWireValue(value: Exclude<NameInput, string>): value is NameAndWireValue {
    return "wireValue" in value && !("originalName" in value);
}
