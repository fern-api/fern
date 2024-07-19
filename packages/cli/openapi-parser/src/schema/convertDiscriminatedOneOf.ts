import {
    Availability,
    CommonPropertyWithExample,
    OneOfSchemaWithExample,
    SchemaWithExample,
    SdkGroupName
} from "@fern-api/openapi-ir-sdk";
import { OpenAPIV3 } from "openapi-types";
import { convertReferenceObject, convertSchema, convertSchemaObject } from "./convertSchemas";
import { SchemaParserContext } from "./SchemaParserContext";
import { isReferenceObject } from "./utils/isReferenceObject";

export function convertDiscriminatedOneOf({
    nameOverride,
    generatedName,
    breadcrumbs,
    properties,
    description,
    availability,
    required,
    wrapAsNullable,
    discriminator,
    context,
    groupName
}: {
    nameOverride: string | undefined;
    generatedName: string;
    breadcrumbs: string[];
    properties: Record<string, OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject>;
    description: string | undefined;
    availability: Availability | undefined;
    required: string[] | undefined;
    wrapAsNullable: boolean;
    discriminator: OpenAPIV3.DiscriminatorObject;
    context: SchemaParserContext;
    groupName: SdkGroupName | undefined;
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
                [schema]
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
            const schema = convertSchema(propertySchema, !isRequired, context, [...breadcrumbs, propertyName]);
            return {
                key: propertyName,
                schema
            };
        });
    return wrapDiscriminantedOneOf({
        nameOverride,
        generatedName,
        wrapAsNullable,
        properties: convertedProperties,
        description,
        availability,
        discriminant,
        subtypes: unionSubTypes,
        groupName
    });
}

export function convertDiscriminatedOneOfWithVariants({
    nameOverride,
    generatedName,
    breadcrumbs,
    properties,
    description,
    availability,
    required,
    wrapAsNullable,
    discriminant,
    variants,
    context,
    groupName
}: {
    nameOverride: string | undefined;
    generatedName: string;
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
}): SchemaWithExample {
    const unionSubTypes = Object.fromEntries(
        Object.entries(variants).map(([discriminantValue, schema]) => {
            if (isReferenceObject(schema)) {
                const subtypeReference = convertReferenceObject(schema, false, context, [schema.$ref]);
                context.markReferencedByDiscriminatedUnion(schema, discriminant, 1);
                return [discriminantValue, subtypeReference];
            } else {
                const variantSchema = convertSchemaObject(
                    schema,
                    false,
                    context,
                    [...breadcrumbs, discriminantValue],
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
            const schema = convertSchema(propertySchema, !isRequired, context, [...breadcrumbs, propertyName]);
            return {
                key: propertyName,
                schema
            };
        });
    return wrapDiscriminantedOneOf({
        nameOverride,
        generatedName,
        wrapAsNullable,
        properties: convertedProperties,
        description,
        availability,
        discriminant,
        subtypes: unionSubTypes,
        groupName
    });
}

export function wrapDiscriminantedOneOf({
    nameOverride,
    generatedName,
    wrapAsNullable,
    properties,
    description,
    availability,
    discriminant,
    subtypes,
    groupName
}: {
    nameOverride: string | undefined;
    generatedName: string;
    wrapAsNullable: boolean;
    properties: CommonPropertyWithExample[];
    description: string | undefined;
    availability: Availability | undefined;
    discriminant: string;
    subtypes: Record<string, SchemaWithExample>;
    groupName: SdkGroupName | undefined;
}): SchemaWithExample {
    if (wrapAsNullable) {
        return SchemaWithExample.nullable({
            nameOverride,
            generatedName,
            value: SchemaWithExample.oneOf(
                OneOfSchemaWithExample.discriminated({
                    description,
                    availability,
                    discriminantProperty: discriminant,
                    nameOverride,
                    generatedName,
                    schemas: subtypes,
                    commonProperties: properties,
                    groupName
                })
            ),
            groupName,
            description,
            availability
        });
    }
    return SchemaWithExample.oneOf(
        OneOfSchemaWithExample.discriminated({
            description,
            availability,
            discriminantProperty: discriminant,
            nameOverride,
            generatedName,
            schemas: subtypes,
            commonProperties: properties,
            groupName
        })
    );
}
