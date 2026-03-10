/**
 * Helper functions for handling NameOrString and NameAndWireValueOrString union types.
 * These union types were introduced in IR v66 where Name fields can be either
 * a full Name/NameAndWireValue object or a plain string (the originalName/wireValue).
 */

import { FernIr as Ir } from "@fern-api/ir-sdk";

/** Extract originalName from a NameOrString union */
export function getOriginalName(name: Ir.NameOrString): string {
    return typeof name === "string" ? name : name.originalName;
}

/** Extract wireValue from a NameAndWireValueOrString union */
export function getWireValue(name: Ir.NameAndWireValueOrString): string {
    return typeof name === "string" ? name : name.wireValue;
}

/** Extract the inner NameOrString from a NameAndWireValueOrString union */
export function getInnerName(name: Ir.NameAndWireValueOrString): Ir.NameOrString {
    return typeof name === "string" ? name : name.name;
}

/** Extract originalName from an optional NameOrString union */
export function getOriginalNameOptional(name: Ir.NameOrString | undefined | null): string | undefined {
    if (name == null) {
        return undefined;
    }
    return typeof name === "string" ? name : name.originalName;
}
