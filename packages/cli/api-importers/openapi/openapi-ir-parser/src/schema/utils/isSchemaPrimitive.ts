import { Schema } from "@fern-api/openapi-ir";

export function isSchemaPrimitive(schema: Schema): boolean {
    if (schema.type === "primitive") {
        return true;
    } else if (schema.type === "nullable" || schema.type === "optional") {
        return isSchemaPrimitive(schema.value);
    }
    return false;
}
