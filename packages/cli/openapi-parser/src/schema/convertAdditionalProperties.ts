import {
    Availability,
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
    availability,
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
    availability: Availability | undefined;
    wrapAsNullable: boolean;
    context: SchemaParserContext;
    groupName: SdkGroupName | undefined;
    example: unknown | undefined;
}): SchemaWithExample {
    if (typeof additionalProperties === "boolean" || isAdditionalPropertiesAny(additionalProperties)) {
        return wrapMap({
            nameOverride,
            generatedName,
            wrapAsNullable,
            description,
            availability,
            keySchema: {
                nameOverride: undefined,
                generatedName: `${generatedName}Key`,
                description: undefined,
                availability: undefined,
                schema: PrimitiveSchemaValueWithExample.string({
                    default: undefined,
                    pattern: undefined,
                    format: undefined,
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
                availability: undefined,
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
        availability,
        keySchema: {
            nameOverride: undefined,
            generatedName: `${generatedName}Key`,
            description: undefined,
            availability: undefined,
            schema: PrimitiveSchemaValueWithExample.string({
                default: undefined,
                pattern: undefined,
                format: undefined,
                minLength: undefined,
                maxLength: undefined,
                example: undefined
            }),
            groupName: undefined
        },
        valueSchema: convertSchema(additionalProperties, wrapAsNullable, context, [...breadcrumbs, "Value"]),
        groupName,
        example
    });
}

export function wrapMap({
    nameOverride,
    generatedName,
    keySchema,
    valueSchema,
    wrapAsNullable,
    description,
    availability,
    groupName,
    example
}: {
    nameOverride: string | undefined;
    generatedName: string;
    keySchema: PrimitiveSchemaWithExample;
    valueSchema: SchemaWithExample;
    wrapAsNullable: boolean;
    description: string | undefined;
    availability: Availability | undefined;
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
                availability: keySchema.availability,
                key: keySchema,
                value: valueSchema,
                groupName,
                example
            }),
            description,
            availability,
            groupName
        });
    }
    return SchemaWithExample.map({
        nameOverride,
        generatedName,
        description,
        availability,
        key: keySchema,
        value: valueSchema,
        groupName,
        example
    });
}

export function isAdditionalPropertiesAny(
    additionalProperties: boolean | OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject | undefined
): boolean {
    if (additionalProperties == null) {
        return false;
    }
    if (typeof additionalProperties === "boolean") {
        return additionalProperties;
    }
    return !isReferenceObject(additionalProperties) && Object.keys(additionalProperties).length === 0;
}
