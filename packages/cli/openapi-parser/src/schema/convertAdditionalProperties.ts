import {
    PrimitiveSchemaValueWithExample,
    PrimitiveSchemaWithExample,
    SchemaWithExample,
    SdkGroupName
} from "@fern-api/openapi-ir-sdk";
import { OpenAPIV3 } from "openapi-types";
import { convertSchema } from "./convertSchemas";
import { SchemaParserContext } from "./SchemaParserContext";
import { isReferenceObject } from "./utils/isReferenceObject";

export function convertAdditionalProperties({
    nameOverride,
    generatedName,
    breadcrumbs,
    additionalProperties,
    description,
    wrapAsNullable,
    context,
    groupName,
    example
}: {
    nameOverride: string | undefined;
    generatedName: string;
    breadcrumbs: string[];
    additionalProperties: boolean | OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;
    description: string | undefined;
    wrapAsNullable: boolean;
    context: SchemaParserContext;
    groupName: SdkGroupName | undefined;
    example: unknown | undefined;
}): SchemaWithExample {
    if (typeof additionalProperties === "boolean" || isAdditionalPropertiesEmptyDictionary(additionalProperties)) {
        return wrapMap({
            nameOverride,
            generatedName,
            wrapAsNullable,
            description,
            keySchema: {
                nameOverride: undefined,
                generatedName: `${generatedName}Key`,
                description: undefined,
                schema: PrimitiveSchemaValueWithExample.string({
                    minLength: undefined,
                    maxLength: undefined,
                    example: undefined, 
                    format: undefined,
                }),
                groupName: undefined
            },
            valueSchema: SchemaWithExample.unknown({
                nameOverride: undefined,
                generatedName: `${generatedName}Value`,
                description: undefined,
                example: undefined,
                groupName: undefined
            }),
            groupName,
            example
        });
    }
    return wrapMap({
        nameOverride,
        generatedName,
        wrapAsNullable,
        description,
        keySchema: {
            nameOverride: undefined,
            generatedName: `${generatedName}Key`,
            description: undefined,
            schema: PrimitiveSchemaValueWithExample.string({
                minLength: undefined,
                maxLength: undefined,
                example: undefined, 
                format: undefined,
            }),
            groupName: undefined
        },
        valueSchema: convertSchema(additionalProperties, wrapAsNullable, context, [...breadcrumbs, "Value"]),
        groupName,
        example
    });
}

function isAdditionalPropertiesEmptyDictionary(
    additionalProperties: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject
) {
    return !isReferenceObject(additionalProperties) && Object.keys(additionalProperties).length === 0;
}

export function wrapMap({
    nameOverride,
    generatedName,
    keySchema,
    valueSchema,
    wrapAsNullable,
    description,
    groupName,
    example
}: {
    nameOverride: string | undefined;
    generatedName: string;
    keySchema: PrimitiveSchemaWithExample;
    valueSchema: SchemaWithExample;
    wrapAsNullable: boolean;
    description: string | undefined;
    groupName: SdkGroupName | undefined;
    example: unknown | undefined;
}): SchemaWithExample {
    if (wrapAsNullable) {
        return SchemaWithExample.nullable({
            nameOverride,
            generatedName,
            value: SchemaWithExample.map({
                nameOverride,
                generatedName,
                description,
                key: keySchema,
                value: valueSchema,
                groupName,
                example
            }),
            description,
            groupName
        });
    }
    return SchemaWithExample.map({
        nameOverride,
        generatedName,
        description,
        key: keySchema,
        value: valueSchema,
        groupName,
        example
    });
}
