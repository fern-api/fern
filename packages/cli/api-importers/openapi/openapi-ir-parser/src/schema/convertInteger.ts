import { Availability, PrimitiveSchemaValueWithExample, SchemaWithExample, SdkGroupName } from "@fern-api/openapi-ir";

import { wrapPrimitive } from "./convertSchemas";

export function convertInteger({
    nameOverride,
    generatedName,
    title,
    format,
    _default,
    minimum,
    maximum,
    exclusiveMinimum,
    exclusiveMaximum,
    multipleOf,
    description,
    availability,
    wrapAsOptional,
    wrapAsNullable,
    example,
    namespace,
    groupName
}: {
    nameOverride: string | undefined;
    generatedName: string;
    title: string | undefined;
    format: string | undefined;
    _default: number | undefined;
    minimum: number | undefined;
    maximum: number | undefined;
    exclusiveMinimum: boolean | undefined;
    exclusiveMaximum: boolean | undefined;
    multipleOf: number | undefined;
    description: string | undefined;
    availability: Availability | undefined;
    wrapAsOptional: boolean;
    wrapAsNullable: boolean;
    example: number | undefined;
    namespace: string | undefined;
    groupName: SdkGroupName | undefined;
}): SchemaWithExample {
    if (format === "int64") {
        return wrapPrimitive({
            nameOverride,
            generatedName,
            title,
            primitive: PrimitiveSchemaValueWithExample.int64({
                default: _default,
                example
            }),
            wrapAsOptional,
            wrapAsNullable,
            description,
            availability,
            namespace,
            groupName
        });
    } else if (format === "uint32") {
        return wrapPrimitive({
            nameOverride,
            generatedName,
            title,
            primitive: PrimitiveSchemaValueWithExample.uint({
                default: _default,
                example
            }),
            wrapAsOptional,
            wrapAsNullable,
            description,
            availability,
            namespace,
            groupName
        });
    } else if (format === "uint64") {
        return wrapPrimitive({
            nameOverride,
            generatedName,
            title,
            primitive: PrimitiveSchemaValueWithExample.uint64({
                default: _default,
                example
            }),
            wrapAsOptional,
            wrapAsNullable,
            description,
            availability,
            namespace,
            groupName
        });
    }
    return wrapPrimitive({
        nameOverride,
        generatedName,
        title,
        primitive: PrimitiveSchemaValueWithExample.int({
            default: _default,
            minimum,
            maximum,
            exclusiveMinimum,
            exclusiveMaximum,
            multipleOf,
            example
        }),
        wrapAsOptional,
        wrapAsNullable,
        description,
        availability,
        namespace,
        groupName
    });
}
