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
 * Create a NameAndWireValueOrString value.
 * If wireValue === name, returns just the string (compact form).
 * If they differ, returns a NameAndWireValue object with name as a string.
 */
export function createNameAndWireValueOrString(wireValue: string, name: string): NameAndWireValueOrString {
    if (wireValue === name) {
        return wireValue;
    }
    return { wireValue, name };
}

/**
 * Create a NameAndWireValue object (for fields that are still typed as NameAndWireValue, not the OrString union).
 * The name field is a string (valid since NameAndWireValue.name is now NameOrString).
 */
export function createNameAndWireValueObj(wireValue: string, name: string): NameAndWireValue {
    return { wireValue, name };
}
