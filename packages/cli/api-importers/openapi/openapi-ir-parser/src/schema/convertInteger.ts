import { generatorsYml } from "@fern-api/configuration";
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
    groupName,
    defaultIntegerFormat = generatorsYml.DefaultIntegerFormat.Int32
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
    defaultIntegerFormat: generatorsYml.DefaultIntegerFormat | undefined;
}): SchemaWithExample {
    const effectiveFormat = format ?? defaultIntegerFormat;

    const primitive: PrimitiveSchemaValueWithExample = (() => {
        switch (effectiveFormat) {
            case generatorsYml.DefaultIntegerFormat.Int64:
                return PrimitiveSchemaValueWithExample.int64({ default: _default, example });
            case generatorsYml.DefaultIntegerFormat.Uint32:
                return PrimitiveSchemaValueWithExample.uint({ default: _default, example });
            case generatorsYml.DefaultIntegerFormat.Uint64:
                return PrimitiveSchemaValueWithExample.uint64({ default: _default, example });
            default:
                return PrimitiveSchemaValueWithExample.int({
                    default: _default,
                    minimum,
                    maximum,
                    exclusiveMinimum,
                    exclusiveMaximum,
                    multipleOf,
                    example
                });
        }
    })();

    return wrapPrimitive({
        nameOverride,
        generatedName,
        title,
        primitive,
        wrapAsOptional,
        wrapAsNullable,
        description,
        availability,
        namespace,
        groupName
    });
}
