import { PrimitiveSchemaValue, Schema } from "@fern-fern/openapi-ir-model/ir";
import { wrapPrimitive } from "../convertSchemas";

export function convertNumber({
    format,
    description,
    wrapAsNullable,
}: {
    format: string | undefined;
    description: string | undefined;
    wrapAsNullable: boolean;
}): Schema {
    if (format == null || format === "double") {
        return wrapPrimitive({
            primitive: PrimitiveSchemaValue.double(),
            wrapAsNullable,
            description,
        });
    } else if (format === "float") {
        return wrapPrimitive({
            primitive: PrimitiveSchemaValue.float(),
            wrapAsNullable,
            description,
        });
    } else if (format === "int32") {
        return wrapPrimitive({
            primitive: PrimitiveSchemaValue.int(),
            wrapAsNullable,
            description,
        });
    } else if (format === "int64") {
        return wrapPrimitive({
            primitive: PrimitiveSchemaValue.int64(),
            wrapAsNullable,
            description,
        });
    } else if (format === "time-delta") {
        return wrapPrimitive({
            primitive: PrimitiveSchemaValue.float(),
            wrapAsNullable,
            description,
        });
    }
    return wrapPrimitive({
        primitive: PrimitiveSchemaValue.float(),
        wrapAsNullable,
        description,
    });
}
