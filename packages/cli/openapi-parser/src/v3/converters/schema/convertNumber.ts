import { PrimitiveSchemaValue } from "@fern-fern/openapi-ir-model/ir";
import { SchemaWithExample } from "@fern-fern/openapi-ir-model/parse-stage/ir";
import { wrapPrimitive } from "../convertSchemas";

export function convertNumber({
    format,
    description,
    wrapAsNullable,
}: {
    format: string | undefined;
    description: string | undefined;
    wrapAsNullable: boolean;
}): SchemaWithExample {
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
