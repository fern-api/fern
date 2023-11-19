import { Schema } from "@fern-fern/openapi-ir-model/finalIr";

export function isSchemaPrimitive(schema: Schema): boolean {
    if (schema.type === "primitive") {
        return true;
    } else if (schema.type === "nullable" || schema.type === "optional") {
        return isSchemaPrimitive(schema.value);
    }
    return false;
}
