/**
 * Re-export name helpers from @fern-api/ir-utils for backward compatibility.
 */
export { getOriginalName, getWireValue } from "@fern-api/ir-utils";

import { FernIr as Ir } from "@fern-api/ir-sdk";

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
