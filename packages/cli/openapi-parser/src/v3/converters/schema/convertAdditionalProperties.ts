import { PrimitiveSchemaValue, Schema } from "@fern-fern/openapi-ir-model/ir";
import { OpenAPIV3 } from "openapi-types";
import { isReferenceObject } from "../../isReferenceObject";
import { convertSchema } from "../convertSchemas";

export function convertAdditionalProperties({
    additionalProperties,
    description,
    wrapAsOptional,
}: {
    additionalProperties: boolean | OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;
    description: string | undefined;
    wrapAsOptional: boolean;
}): Schema {
    if (typeof additionalProperties === "boolean" || isAdditionalPropertiesEmptyDictionary(additionalProperties)) {
        return wrapMap({
            wrapAsOptional,
            description,
            keySchema: PrimitiveSchemaValue.string(),
            valueSchema: Schema.unknown(),
        });
    }
    return wrapMap({
        wrapAsOptional,
        description,
        keySchema: PrimitiveSchemaValue.string(),
        valueSchema: convertSchema(additionalProperties, wrapAsOptional),
    });
}

function isAdditionalPropertiesEmptyDictionary(
    additionalProperties: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject
) {
    return !isReferenceObject(additionalProperties) && Object.keys(additionalProperties).length === 0;
}

export function wrapMap({
    keySchema,
    valueSchema,
    wrapAsOptional,
    description,
}: {
    keySchema: PrimitiveSchemaValue;
    valueSchema: Schema;
    wrapAsOptional: boolean;
    description: string | undefined;
}): Schema {
    if (wrapAsOptional) {
        return Schema.optional({
            value: Schema.map({
                description: undefined,
                key: keySchema,
                value: valueSchema,
            }),
            description,
        });
    }
    return Schema.map({
        description,
        key: keySchema,
        value: valueSchema,
    });
}
