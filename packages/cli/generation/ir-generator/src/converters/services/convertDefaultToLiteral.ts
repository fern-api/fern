import { Literal } from "@fern-api/ir-sdk";

export function convertDefaultToLiteral(defaultValue: unknown): Literal | undefined {
    if (defaultValue == null) {
        return undefined;
    }
    if (typeof defaultValue === "string") {
        return Literal.string(defaultValue);
    }
    if (typeof defaultValue === "boolean") {
        return Literal.boolean(defaultValue);
    }
    // Non-string/non-boolean defaults (e.g., numbers) are not representable as
    // Literal values and are already captured in the type's validation/default
    // metadata, so we silently skip them here.
    return undefined;
}
