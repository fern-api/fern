import { PrimitiveSchemaValue, Schema } from "@fern-fern/openapi-ir-model/ir";
import { wrapPrimitive } from "../convertSchemas";

export function convertNumber({
    format,
    description,
    wrapAsOptional,
}: {
    format: string | undefined;
    description: string | undefined;
    wrapAsOptional: boolean;
}): Schema {
    if (format == null || format === "double") {
        return wrapPrimitive({
            primitive: PrimitiveSchemaValue.double(),
            wrapAsOptional,
            description,
        });
    } else if (format === "float") {
        return wrapPrimitive({
            primitive: PrimitiveSchemaValue.float(),
            wrapAsOptional,
            description,
        });
    } else if (format === "int32") {
        return wrapPrimitive({
            primitive: PrimitiveSchemaValue.int(),
            wrapAsOptional,
            description,
        });
    } else if (format === "int64") {
        return wrapPrimitive({
            primitive: PrimitiveSchemaValue.int64(),
            wrapAsOptional,
            description,
        });
    }
    throw new Error(`Cannot convert number with format= ${format}`);
}
