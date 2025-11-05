import { assertNever } from "@fern-api/core-utils";
import {
    Availability,
    Encoding,
    PrimitiveSchemaValueWithExample,
    PrimitiveSchemaWithExample,
    SchemaWithExample,
    SdkGroupName,
    Source,
    UnknownSchemaWithExample
} from "@fern-api/openapi-ir";
import { OpenAPIV3 } from "openapi-types";

import { ParseOpenAPIOptions } from "../options";
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
    wrapAsOptional,
    wrapAsNullable,
    context,
    namespace,
    groupName,
    example,
    encoding,
    source
}: {
    nameOverride: string | undefined;
    generatedName: string;
    title: string | undefined;
    breadcrumbs: string[];
    additionalProperties: undefined | boolean | OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;
    description: string | undefined;
    availability: Availability | undefined;
    wrapAsOptional: boolean;
    wrapAsNullable: boolean;
    context: SchemaParserContext;
    namespace: string | undefined;
    groupName: SdkGroupName | undefined;
    example: unknown | undefined;
    encoding: Encoding | undefined;
    source: Source;
}): SchemaWithExample {
    if (additionalProperties === undefined) {
        additionalProperties = context.options.additionalPropertiesDefaultsTo;
    }

    return wrapMap({
        nameOverride,
        generatedName,
        title,
        wrapAsOptional,
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
            namespace: undefined,
            groupName: undefined
        },
        valueSchema:
            typeof additionalProperties === "boolean" ||
            isAdditionalPropertiesAny(additionalProperties, context.options)
                ? SchemaWithExample.unknown({
                      ...getAdditionalPropertiesAnyMetadata(additionalProperties),
                      generatedName: `${generatedName}Value`
                  })
                : addInline(
                      convertSchema(
                          additionalProperties,
                          false,
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
        namespace,
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
    wrapAsOptional,
    wrapAsNullable,
    description,
    availability,
    namespace,
    groupName,
    example,
    encoding
}: {
    nameOverride: string | undefined;
    generatedName: string;
    title: string | undefined;
    keySchema: PrimitiveSchemaWithExample;
    valueSchema: SchemaWithExample;
    wrapAsOptional: boolean;
    wrapAsNullable: boolean;
    description: string | undefined;
    availability: Availability | undefined;
    namespace: string | undefined;
    groupName: SdkGroupName | undefined;
    example: unknown | undefined;
    encoding: Encoding | undefined;
}): SchemaWithExample {
    let result: SchemaWithExample = SchemaWithExample.map({
        nameOverride,
        generatedName,
        title,
        description,
        availability,
        key: keySchema,
        value: valueSchema,
        namespace,
        groupName,
        encoding,
        example,
        inline: undefined
    });
    if (wrapAsNullable) {
        result = SchemaWithExample.nullable({
            nameOverride,
            generatedName,
            title,
            value: result,
            description,
            availability,
            namespace,
            groupName,
            inline: undefined
        });
    }
    if (wrapAsOptional) {
        result = SchemaWithExample.optional({
            nameOverride,
            generatedName,
            title,
            value: result,
            description,
            availability,
            namespace,
            groupName,
            inline: undefined
        });
    }

    return result;
}

export function isAdditionalPropertiesAny(
    additionalProperties: boolean | OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject | undefined,
    options: ParseOpenAPIOptions
): boolean {
    if (additionalProperties == null) {
        return options.additionalPropertiesDefaultsTo;
    }
    if (typeof additionalProperties === "boolean") {
        return additionalProperties;
    }
    if (isReferenceObject(additionalProperties)) {
        return false;
    }
    if ("type" in additionalProperties && additionalProperties.type != null) {
        return false;
    }
    if ("oneOf" in additionalProperties && additionalProperties.oneOf != null) {
        return false;
    }
    if ("anyOf" in additionalProperties && additionalProperties.anyOf != null) {
        return false;
    }
    if ("allOf" in additionalProperties && additionalProperties.allOf != null) {
        return false;
    }
    if ("enum" in additionalProperties && additionalProperties.enum != null) {
        return false;
    }

    return true;
}

export function getAdditionalPropertiesAnyMetadata(
    additionalProperties: boolean | OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject | undefined
): UnknownSchemaWithExample {
    const result: UnknownSchemaWithExample = {
        nameOverride: undefined,
        generatedName: "",
        title: undefined,
        description: undefined,
        availability: undefined,
        example: undefined,
        namespace: undefined,
        groupName: undefined
    };
    if (
        additionalProperties == null ||
        typeof additionalProperties === "boolean" ||
        isReferenceObject(additionalProperties)
    ) {
        return result;
    }
    if (typeof additionalProperties !== "object") {
        return result;
    }
    if (additionalProperties.title != null) {
        result.title = additionalProperties.title;
    }
    if (additionalProperties.description != null) {
        result.description = additionalProperties.description;
    }
    return result;
}
