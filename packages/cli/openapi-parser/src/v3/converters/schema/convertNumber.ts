import { PrimitiveSchemaValue, Schema } from "@fern-fern/openapi-ir-model/ir";

export function convertNumber({
    format,
    description,
}: {
    format: string | undefined;
    description: string | undefined;
}): Schema {
    if (format == null || format === "double") {
        return Schema.primitive({
            schema: PrimitiveSchemaValue.double(),
            description,
        });
    } else if (format === "float") {
        return Schema.primitive({
            schema: PrimitiveSchemaValue.float(),
            description,
        });
    } else if (format === "int32") {
        return Schema.primitive({
            schema: PrimitiveSchemaValue.int(),
            description,
        });
    } else if (format === "int64") {
        return Schema.primitive({
            schema: PrimitiveSchemaValue.int64(),
            description,
        });
    }
    throw new Error(`Cannot convert number with format= ${format}`);
}
