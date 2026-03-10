import { NameAndWireValue, NameAndWireValueOrString, NameOrString } from "@fern-api/ir-sdk";

/**
 * Extract the original name from a NameOrString value.
 * If the value is a string, it IS the original name.
 * If it's a Name object, extract .originalName.
 */
export function getOriginalName(name: NameOrString): string {
    return typeof name === "string" ? name : name.originalName;
}

/**
 * Extract the wire value from a NameAndWireValueOrString value.
 * If the value is a string, it IS the wire value (and the original name).
 * If it's a NameAndWireValue object, extract .wireValue.
 */
export function getWireValue(nameAndWireValue: NameAndWireValueOrString): string {
    return typeof nameAndWireValue === "string" ? nameAndWireValue : nameAndWireValue.wireValue;
}

/**
 * Extract the Name from a NameAndWireValueOrString value.
 * If the value is a string, returns the string (which is a valid NameOrString).
 * If it's a NameAndWireValue object, returns the .name field.
 */
export function getNameFromWireValue(nameAndWireValue: NameAndWireValueOrString): NameOrString {
    return typeof nameAndWireValue === "string" ? nameAndWireValue : nameAndWireValue.name;
}

/**
 * Ensure a NameAndWireValueOrString is a full NameAndWireValue object.
 * If the value is a string, creates a NameAndWireValue with both wireValue and name set to the string.
 */
export function ensureNameAndWireValue(nameAndWireValue: NameAndWireValueOrString): NameAndWireValue {
    if (typeof nameAndWireValue === "string") {
        return { wireValue: nameAndWireValue, name: nameAndWireValue };
    }
    return nameAndWireValue;
}
