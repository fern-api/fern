import { PrimitiveSchemaValue, SchemaWithExample } from "@fern-fern/openapi-ir-model/parse-stage/ir";
import { OpenAPIV3 } from "openapi-types";
import { AbstractOpenAPIV3ParserContext } from "../../AbstractOpenAPIV3ParserContext";
import { isReferenceObject } from "../../utils/isReferenceObject";
import { convertSchema } from "../convertSchemas";

export function convertAdditionalProperties({
    breadcrumbs,
    additionalProperties,
    description,
    wrapAsNullable,
    context,
}: {
    breadcrumbs: string[];
    additionalProperties: boolean | OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;
    description: string | undefined;
    wrapAsNullable: boolean;
    context: AbstractOpenAPIV3ParserContext;
}): SchemaWithExample {
    if (typeof additionalProperties === "boolean" || isAdditionalPropertiesEmptyDictionary(additionalProperties)) {
        return wrapMap({
            wrapAsNullable,
            description,
            keySchema: PrimitiveSchemaValue.string({
                minLength: undefined,
                maxLength: undefined,
                example: undefined,
            }),
            valueSchema: SchemaWithExample.unknown({
                description: undefined,
                example: undefined,
            }),
        });
    }
    return wrapMap({
        wrapAsNullable,
        description,
        keySchema: PrimitiveSchemaValue.string({
            minLength: undefined,
            maxLength: undefined,
            example: undefined,
        }),
        valueSchema: convertSchema(additionalProperties, wrapAsNullable, context, [...breadcrumbs, "Value"]),
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
    wrapAsNullable,
    description,
}: {
    keySchema: PrimitiveSchemaValue;
    valueSchema: SchemaWithExample;
    wrapAsNullable: boolean;
    description: string | undefined;
}): SchemaWithExample {
    if (wrapAsNullable) {
        return SchemaWithExample.nullable({
            value: SchemaWithExample.map({
                description,
                key: keySchema,
                value: valueSchema,
            }),
            description,
        });
    }
    return SchemaWithExample.map({
        description,
        key: keySchema,
        value: valueSchema,
    });
}
