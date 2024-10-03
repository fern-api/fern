import {
    Availability,
    Encoding,
    PrimitiveSchemaValueWithExample,
    PrimitiveSchemaWithExample,
    SchemaWithExample,
    SdkGroupName,
    Source
} from "@fern-api/openapi-ir-sdk";
import { OpenAPIV3 } from "openapi-types";
import { convertSchema } from "./convertSchemas";
import { SchemaParserContext } from "./SchemaParserContext";
import { isReferenceObject } from "./utils/isReferenceObject";

export function convertAdditionalProperties({
    nameOverride,
    generatedName,
    title,
    breadcrumbs,
    additionalProperties,
    description,
    availability,
    wrapAsNullable,
    context,
    groupName,
    example,
    encoding,
    source,
    namespace
}: {
    nameOverride: string | undefined;
    generatedName: string;
    title: string | undefined;
    breadcrumbs: string[];
    additionalProperties: boolean | OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;
    description: string | undefined;
    availability: Availability | undefined;
    wrapAsNullable: boolean;
    context: SchemaParserContext;
    groupName: SdkGroupName | undefined;
    example: unknown | undefined;
    encoding: Encoding | undefined;
    source: Source;
    namespace: string | undefined;
}): SchemaWithExample {
    if (typeof additionalProperties === "boolean" || isAdditionalPropertiesAny(additionalProperties)) {
        return wrapMap({
            nameOverride,
            generatedName,
            title,
            wrapAsNullable,
            description,
            availability,
            keySchema: {
                nameOverride: undefined,
                generatedName: `${generatedName}Key`,
                title: undefined,
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
                title: undefined,
                description: undefined,
                availability: undefined,
                example: undefined,
                groupName: undefined
            }),
            groupName,
            example,
            encoding
        });
    }
    return wrapMap({
        nameOverride,
        generatedName,
        title,
        wrapAsNullable,
        description,
        availability,
        keySchema: {
            nameOverride: undefined,
            generatedName: `${generatedName}Key`,
            title: undefined,
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
        valueSchema: convertSchema(
            additionalProperties,
            context.options.optionalAdditionalProperties ? wrapAsNullable : false,
            context,
            [...breadcrumbs, "Value"],
            source,
            namespace
        ),
        groupName,
        example,
        encoding
    });
}

export function wrapMap({
    nameOverride,
    generatedName,
    title,
    keySchema,
    valueSchema,
    wrapAsNullable,
    description,
    availability,
    groupName,
    example,
    encoding
}: {
    nameOverride: string | undefined;
    generatedName: string;
    title: string | undefined;
    keySchema: PrimitiveSchemaWithExample;
    valueSchema: SchemaWithExample;
    wrapAsNullable: boolean;
    description: string | undefined;
    availability: Availability | undefined;
    groupName: SdkGroupName | undefined;
    example: unknown | undefined;
    encoding: Encoding | undefined;
}): SchemaWithExample {
    if (wrapAsNullable) {
        return SchemaWithExample.nullable({
            nameOverride,
            generatedName,
            title,
            value: SchemaWithExample.map({
                nameOverride,
                generatedName,
                title,
                description,
                availability: keySchema.availability,
                key: keySchema,
                value: valueSchema,
                groupName,
                encoding,
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
        title,
        description,
        availability,
        key: keySchema,
        value: valueSchema,
        groupName,
        encoding,
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
