import { Availability, PrimitiveSchemaValueWithExample, SchemaWithExample, SdkGroupName } from "@fern-api/openapi-ir";

import { wrapPrimitive } from "./convertSchemas";
import { OverrideTypeName } from "../openapi/v3/extensions/getFernTypeNameExtension";

export function convertInteger({
    overrideTypeName,
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
    wrapAsNullable,
    example,
    namespace,
    groupName
}: {
    overrideTypeName: OverrideTypeName | undefined;
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
    wrapAsNullable: boolean;
    example: number | undefined;
    namespace: string | undefined;
    groupName: SdkGroupName | undefined;
}): SchemaWithExample {
    if (format === "int64") {
        return wrapPrimitive({
            overrideTypeName,
            generatedName,
            title,
            primitive: PrimitiveSchemaValueWithExample.int64({
                default: _default,
                example
            }),
            wrapAsNullable,
            description,
            availability,
            namespace,
            groupName
        });
    } else if (format === "uint32") {
        return wrapPrimitive({
            overrideTypeName,
            generatedName,
            title,
            primitive: PrimitiveSchemaValueWithExample.uint({
                default: _default,
                example
            }),
            wrapAsNullable,
            description,
            availability,
            namespace,
            groupName
        });
    } else if (format === "uint64") {
        return wrapPrimitive({
            overrideTypeName,
            generatedName,
            title,
            primitive: PrimitiveSchemaValueWithExample.uint64({
                default: _default,
                example
            }),
            wrapAsNullable,
            description,
            availability,
            namespace,
            groupName
        });
    }
    return wrapPrimitive({
        overrideTypeName,
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
        wrapAsNullable,
        description,
        availability,
        namespace,
        groupName
    });
}
