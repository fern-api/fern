import { NameOrString } from "@fern-api/ir-sdk";

/**
 * Extracts the original name string from a NameOrString value.
 * If the value is already a string (slim Name), returns it directly.
 * If the value is a full Name object, returns its originalName.
 */
export function getNameString(name: NameOrString): string {
    return typeof name === "string" ? name : name.originalName;
}
