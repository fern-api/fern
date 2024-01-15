import { SdkGroupName } from "@fern-fern/openapi-ir-model/commons";
import { PrimitiveSchemaValueWithExample, SchemaWithExample } from "@fern-fern/openapi-ir-model/parseIr";
import { wrapPrimitive } from "../convertSchemas";

export function convertNumber({
    nameOverride,
    generatedName,
    format,
    description,
    wrapAsNullable,
    example,
    groupName
}: {
    nameOverride: string | undefined;
    generatedName: string;
    format: string | undefined;
    description: string | undefined;
    wrapAsNullable: boolean;
    example: number | undefined;
    groupName: SdkGroupName | undefined;
}): SchemaWithExample {
    if (format == null || format === "double") {
        return wrapPrimitive({
            nameOverride,
            generatedName,
            primitive: PrimitiveSchemaValueWithExample.double({
                example
            }),
            wrapAsNullable,
            description,
            groupName
        });
    } else if (format === "float") {
        return wrapPrimitive({
            nameOverride,
            generatedName,
            primitive: PrimitiveSchemaValueWithExample.float({
                example
            }),
            wrapAsNullable,
            description,
            groupName
        });
    } else if (format === "int32") {
        return wrapPrimitive({
            nameOverride,
            generatedName,
            primitive: PrimitiveSchemaValueWithExample.int({
                example
            }),
            wrapAsNullable,
            description,
            groupName
        });
    } else if (format === "int64") {
        return wrapPrimitive({
            nameOverride,
            generatedName,
            primitive: PrimitiveSchemaValueWithExample.int64({
                example
            }),
            wrapAsNullable,
            description,
            groupName
        });
    } else if (format === "time-delta") {
        return wrapPrimitive({
            nameOverride,
            generatedName,
            primitive: PrimitiveSchemaValueWithExample.float({
                example
            }),
            wrapAsNullable,
            description,
            groupName
        });
    }
    return wrapPrimitive({
            nameOverride,
            generatedName,
        primitive: PrimitiveSchemaValueWithExample.float({
            example
        }),
        wrapAsNullable,
        description,
        groupName
    });
}
