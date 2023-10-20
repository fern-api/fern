import { PrimitiveSchemaValueWithExample, SchemaWithExample } from "@fern-fern/openapi-ir-model/parseIr";
import { wrapPrimitive } from "../convertSchemas";

export function convertNumber({
    format,
    description,
    wrapAsNullable,
    example,
}: {
    format: string | undefined;
    description: string | undefined;
    wrapAsNullable: boolean;
    example: number | undefined;
}): SchemaWithExample {
    if (format == null || format === "double") {
        return wrapPrimitive({
            primitive: PrimitiveSchemaValueWithExample.double({
                example,
            }),
            wrapAsNullable,
            description,
        });
    } else if (format === "float") {
        return wrapPrimitive({
            primitive: PrimitiveSchemaValueWithExample.float({
                example,
            }),
            wrapAsNullable,
            description,
        });
    } else if (format === "int32") {
        return wrapPrimitive({
            primitive: PrimitiveSchemaValueWithExample.int({
                example,
            }),
            wrapAsNullable,
            description,
        });
    } else if (format === "int64") {
        return wrapPrimitive({
            primitive: PrimitiveSchemaValueWithExample.int64({
                example,
            }),
            wrapAsNullable,
            description,
        });
    } else if (format === "time-delta") {
        return wrapPrimitive({
            primitive: PrimitiveSchemaValueWithExample.float({
                example,
            }),
            wrapAsNullable,
            description,
        });
    }
    return wrapPrimitive({
        primitive: PrimitiveSchemaValueWithExample.float({
            example,
        }),
        wrapAsNullable,
        description,
    });
}
