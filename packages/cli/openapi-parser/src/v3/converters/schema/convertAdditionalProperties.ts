import { SdkGroupName } from "@fern-fern/openapi-ir-model/commons";
import {
    PrimitiveSchemaValueWithExample,
    PrimitiveSchemaWithExample,
    SchemaWithExample
} from "@fern-fern/openapi-ir-model/parseIr";
import { OpenAPIV3 } from "openapi-types";
import { AbstractOpenAPIV3ParserContext } from "../../AbstractOpenAPIV3ParserContext";
import { isReferenceObject } from "../../utils/isReferenceObject";
import { convertSchema } from "../convertSchemas";

export function convertAdditionalProperties({
    nameOverride,
    generatedName,
    breadcrumbs,
    additionalProperties,
    description,
    wrapAsNullable,
    context,
    groupName
}: {
    nameOverride: string | undefined;
    generatedName: string;
    breadcrumbs: string[];
    additionalProperties: boolean | OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;
    description: string | undefined;
    wrapAsNullable: boolean;
    context: AbstractOpenAPIV3ParserContext;
    groupName: SdkGroupName | undefined;
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
                    example: undefined
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
            groupName
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
                example: undefined
            }),
            groupName: undefined
        },
        valueSchema: convertSchema(additionalProperties, wrapAsNullable, context, [...breadcrumbs, "Value"]),
        groupName
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
    groupName
}: {
    nameOverride: string | undefined;
    generatedName: string;
    keySchema: PrimitiveSchemaWithExample;
    valueSchema: SchemaWithExample;
    wrapAsNullable: boolean;
    description: string | undefined;
    groupName: SdkGroupName | undefined;
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
                groupName
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
        groupName
    });
}
