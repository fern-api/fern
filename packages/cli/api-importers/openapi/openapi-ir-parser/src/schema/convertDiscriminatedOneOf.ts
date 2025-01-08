import { OpenAPIV3 } from "openapi-types";

import {
    Availability,
    CommonPropertyWithExample,
    Encoding,
    OneOfSchemaWithExample,
    SchemaWithExample,
    SdkGroupName,
    Source
} from "@fern-api/openapi-ir";

import { SchemaParserContext } from "./SchemaParserContext";
import { convertReferenceObject, convertSchema, convertSchemaObject } from "./convertSchemas";
import { isReferenceObject } from "./utils/isReferenceObject";

export function convertDiscriminatedOneOf({
    nameOverride,
    generatedName,
    title,
    breadcrumbs,
    properties,
    description,
    availability,
    required,
    wrapAsNullable,
    discriminator,
    context,
    groupName,
    encoding,
    source,
    namespace
}: {
    nameOverride: string | undefined;
    generatedName: string;
    title: string | undefined;
    breadcrumbs: string[];
    properties: Record<string, OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject>;
    description: string | undefined;
    availability: Availability | undefined;
    required: string[] | undefined;
    wrapAsNullable: boolean;
    discriminator: OpenAPIV3.DiscriminatorObject;
    context: SchemaParserContext;
    groupName: SdkGroupName | undefined;
    encoding: Encoding | undefined;
    source: Source;
    namespace: string | undefined;
}): SchemaWithExample {
    const discriminant = discriminator.propertyName;
    const unionSubTypes = Object.fromEntries(
        Object.entries(discriminator.mapping ?? {}).map(([discriminantValue, schema]) => {
            const subtypeReference = convertReferenceObject(
                {
                    $ref: schema
                },
                false,
                context,
                [schema],
                encoding,
                source,
                namespace
            );
            context.markReferencedByDiscriminatedUnion(
                {
                    $ref: schema
                },
                discriminant,
                1
            );
            return [discriminantValue, subtypeReference];
        })
    );
    const convertedProperties = Object.entries(properties)
        .filter(([propertyName]) => {
            return propertyName !== discriminant;
        })
        .map(([propertyName, propertySchema]) => {
            const isRequired = required != null && required.includes(propertyName);
            const schema = convertSchema(
                propertySchema,
                !isRequired,
                context,
                [...breadcrumbs, propertyName],
                source,
                namespace
            );
            return {
                key: propertyName,
                schema
            };
        });
    return wrapDiscriminantedOneOf({
        nameOverride,
        generatedName,
        title,
        wrapAsNullable,
        properties: convertedProperties,
        description,
        availability,
        discriminant,
        subtypes: unionSubTypes,
        groupName,
        source
    });
}

export function convertDiscriminatedOneOfWithVariants({
    nameOverride,
    generatedName,
    title,
    breadcrumbs,
    properties,
    description,
    availability,
    required,
    wrapAsNullable,
    discriminant,
    variants,
    context,
    groupName,
    encoding,
    source,
    namespace
}: {
    nameOverride: string | undefined;
    generatedName: string;
    title: string | undefined;
    breadcrumbs: string[];
    properties: Record<string, OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject>;
    description: string | undefined;
    availability: Availability | undefined;
    required: string[] | undefined;
    wrapAsNullable: boolean;
    discriminant: string;
    variants: Record<string, OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject>;
    context: SchemaParserContext;
    groupName: SdkGroupName | undefined;
    encoding: Encoding | undefined;
    source: Source;
    namespace: string | undefined;
}): SchemaWithExample {
    const unionSubTypes = Object.fromEntries(
        Object.entries(variants).map(([discriminantValue, schema]) => {
            if (isReferenceObject(schema)) {
                const subtypeReference = convertReferenceObject(
                    schema,
                    false,
                    context,
                    [schema.$ref],
                    encoding,
                    source,
                    namespace
                );
                context.markReferencedByDiscriminatedUnion(schema, discriminant, 1);
                return [discriminantValue, subtypeReference];
            } else {
                const variantSchema = convertSchemaObject(
                    schema,
                    false,
                    context,
                    [...breadcrumbs, discriminantValue],
                    encoding,
                    source,
                    namespace,
                    new Set([discriminant])
                );
                return [discriminantValue, variantSchema];
            }
        })
    );
    const convertedProperties = Object.entries(properties)
        .filter(([propertyName]) => {
            return propertyName !== discriminant;
        })
        .map(([propertyName, propertySchema]) => {
            const isRequired = required != null && required.includes(propertyName);
            const schema = convertSchema(
                propertySchema,
                !isRequired,
                context,
                [...breadcrumbs, propertyName],
                source,
                namespace
            );
            return {
                key: propertyName,
                schema
            };
        });
    return wrapDiscriminantedOneOf({
        nameOverride,
        generatedName,
        title,
        wrapAsNullable,
        properties: convertedProperties,
        description,
        availability,
        discriminant,
        subtypes: unionSubTypes,
        groupName,
        source
    });
}

export function wrapDiscriminantedOneOf({
    nameOverride,
    generatedName,
    title,
    wrapAsNullable,
    properties,
    description,
    availability,
    discriminant,
    subtypes,
    groupName,
    source
}: {
    nameOverride: string | undefined;
    generatedName: string;
    title: string | undefined;
    wrapAsNullable: boolean;
    properties: CommonPropertyWithExample[];
    description: string | undefined;
    availability: Availability | undefined;
    discriminant: string;
    subtypes: Record<string, SchemaWithExample>;
    groupName: SdkGroupName | undefined;
    source: Source;
}): SchemaWithExample {
    if (wrapAsNullable) {
        return SchemaWithExample.nullable({
            nameOverride,
            generatedName,
            title,
            value: SchemaWithExample.oneOf(
                OneOfSchemaWithExample.discriminated({
                    description,
                    availability,
                    discriminantProperty: discriminant,
                    nameOverride,
                    generatedName,
                    title,
                    schemas: subtypes,
                    commonProperties: properties,
                    groupName,
                    encoding: undefined,
                    source,
                    inline: undefined
                })
            ),
            groupName,
            description,
            availability,
            inline: undefined
        });
    }
    return SchemaWithExample.oneOf(
        OneOfSchemaWithExample.discriminated({
            description,
            availability,
            discriminantProperty: discriminant,
            nameOverride,
            generatedName,
            title,
            schemas: subtypes,
            commonProperties: properties,
            groupName,
            encoding: undefined,
            source,
            inline: undefined
        })
    );
}
