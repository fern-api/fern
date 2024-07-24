import {
    Availability,
    PrimitiveSchemaValueWithExample,
    SchemaWithExample,
    SdkGroupName
} from "@fern-api/openapi-ir-sdk";
import { wrapPrimitive } from "./convertSchemas";

export function convertNumber({
    nameOverride,
    generatedName,
    format,
    _default,
    minimum,
    maximum,
    exclusiveMinimum,
    exclusiveMaximum,
    multipleOf,
    description,
    availability,
    wrapAsNullable,
    example,
    groupName
}: {
    nameOverride: string | undefined;
    generatedName: string;
    format: string | undefined;
    _default: number | undefined;
    minimum: number | undefined;
    maximum: number | undefined;
    exclusiveMinimum: boolean | undefined;
    exclusiveMaximum: boolean | undefined;
    multipleOf: number | undefined;
    description: string | undefined;
    availability: Availability | undefined;
    wrapAsNullable: boolean;
    example: number | undefined;
    groupName: SdkGroupName | undefined;
}): SchemaWithExample {
    if (format == null || format === "double") {
        return wrapPrimitive({
            nameOverride,
            generatedName,
            primitive: PrimitiveSchemaValueWithExample.double({
                default: _default,
                minimum,
                maximum,
                exclusiveMinimum,
                exclusiveMaximum,
                multipleOf,
                example
            }),
            wrapAsNullable,
            description,
            availability,
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
            availability,
            groupName
        });
    } else if (format === "int32") {
        return wrapPrimitive({
            nameOverride,
            generatedName,
            primitive: PrimitiveSchemaValueWithExample.int({
                default: _default,
                minimum,
                maximum,
                exclusiveMinimum,
                exclusiveMaximum,
                multipleOf,
                example
            }),
            wrapAsNullable,
            description,
            availability,
            groupName
        });
    } else if (format === "int64") {
        return wrapPrimitive({
            nameOverride,
            generatedName,
            primitive: PrimitiveSchemaValueWithExample.int64({
                default: _default,
                example
            }),
            wrapAsNullable,
            description,
            availability,
            groupName
        });
    } else if (format === "uint32") {
        return wrapPrimitive({
            nameOverride,
            generatedName,
            primitive: PrimitiveSchemaValueWithExample.uint({
                default: _default,
                example
            }),
            wrapAsNullable,
            description,
            availability,
            groupName
        });
    } else if (format === "uint64") {
        return wrapPrimitive({
            nameOverride,
            generatedName,
            primitive: PrimitiveSchemaValueWithExample.uint64({
                default: _default,
                example
            }),
            wrapAsNullable,
            description,
            availability,
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
            availability,
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
        availability,
        groupName
    });
}
