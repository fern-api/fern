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
    if (typeof defaultValue === "number") {
        if (Number.isInteger(defaultValue)) {
            return Literal.integer(defaultValue);
        }
        return Literal.double(defaultValue);
    }
    if (Array.isArray(defaultValue)) {
        return Literal.list(defaultValue);
    }
    return undefined;
}
