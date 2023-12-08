import { SdkGroupName } from "@fern-fern/openapi-ir-model/commons";
import { PrimitiveSchemaValueWithExample, SchemaWithExample } from "@fern-fern/openapi-ir-model/parseIr";
import { wrapPrimitive } from "../convertSchemas";

export function convertNumber({
    format,
    description,
    wrapAsNullable,
    example,
    groupName
}: {
    format: string | undefined;
    description: string | undefined;
    wrapAsNullable: boolean;
    example: number | undefined;
    groupName: SdkGroupName | undefined;
}): SchemaWithExample {
    if (format == null || format === "double") {
        return wrapPrimitive({
            primitive: PrimitiveSchemaValueWithExample.double({
                example
            }),
            wrapAsNullable,
            description,
            groupName
        });
    } else if (format === "float") {
        return wrapPrimitive({
            primitive: PrimitiveSchemaValueWithExample.float({
                example
            }),
            wrapAsNullable,
            description,
            groupName
        });
    } else if (format === "int32") {
        return wrapPrimitive({
            primitive: PrimitiveSchemaValueWithExample.int({
                example
            }),
            wrapAsNullable,
            description,
            groupName
        });
    } else if (format === "int64") {
        return wrapPrimitive({
            primitive: PrimitiveSchemaValueWithExample.int64({
                example
            }),
            wrapAsNullable,
            description,
            groupName
        });
    } else if (format === "time-delta") {
        return wrapPrimitive({
            primitive: PrimitiveSchemaValueWithExample.float({
                example
            }),
            wrapAsNullable,
            description,
            groupName
        });
    }
    return wrapPrimitive({
        primitive: PrimitiveSchemaValueWithExample.float({
            example
        }),
        wrapAsNullable,
        description,
        groupName
    });
}
