import { OpenAPIV3 } from "openapi-types";

import { assertNever } from "@fern-api/core-utils";
import {
    Availability,
    Encoding,
    PrimitiveSchemaValueWithExample,
    PrimitiveSchemaWithExample,
    SchemaWithExample,
    SdkGroupName,
    Source
} from "@fern-api/openapi-ir";

import { SchemaParserContext } from "./SchemaParserContext";
import { convertSchema } from "./convertSchemas";
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
        // Whether a type is inline is usually determined later by checking if a declaration is nested within another declaration,
        // however this map is generated from the additionalProperties and thus is inline of the object (depending on the value type),
        // so we allways add inline (depending on the value type).
        valueSchema: addInline(
            convertSchema(
                additionalProperties,
                context.options.optionalAdditionalProperties ? wrapAsNullable : false,
                context,
                [...breadcrumbs, "Value"],
                source,
                namespace,
                undefined,
                undefined,
                undefined
            )
        ),
        groupName,
        example,
        encoding
    });
}

function addInline(schema: SchemaWithExample): SchemaWithExample {
    switch (schema.type) {
        case "array":
        case "enum":
        case "map":
        case "object":
            schema.inline = true;
            break;
        case "literal":
        case "primitive":
        case "reference":
        case "unknown":
            break;
        case "nullable":
        case "optional":
            schema.inline = true;
            schema.value = addInline(schema.value);
            break;
        case "oneOf":
            schema.value.inline = true;
            break;
        default:
            assertNever(schema);
    }

    return schema;
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
                example,
                inline: undefined
            }),
            description,
            availability,
            groupName,
            inline: undefined
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
        example,
        inline: undefined
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
