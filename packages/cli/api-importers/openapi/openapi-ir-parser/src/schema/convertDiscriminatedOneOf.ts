import {
    Availability,
    CommonPropertyWithExample,
    Encoding,
    OneOfSchemaWithExample,
    SchemaWithExample,
    SdkGroupName,
    Source
} from "@fern-api/openapi-ir";
import { OpenAPIV3 } from "openapi-types";

import { getExtension } from "../getExtension.js";
import { FernOpenAPIExtension } from "../openapi/v3/extensions/fernExtensions.js";
import { convertReferenceObject, convertSchema, convertSchemaObject } from "./convertSchemas.js";
import { inferDiscriminatorContext, inferDiscriminatorContextFromVariants } from "./inferDiscriminatorContext.js";
import { SchemaParserContext } from "./SchemaParserContext.js";
import { isReferenceObject } from "./utils/isReferenceObject.js";

export function convertDiscriminatedOneOf({
    nameOverride,
    generatedName,
    title,
    breadcrumbs,
    properties,
    description,
    availability,
    required,
    wrapAsOptional,
    wrapAsNullable,
    discriminator,
    context,
    namespace,
    groupName,
    encoding,
    source
}: {
    nameOverride: string | undefined;
    generatedName: string;
    title: string | undefined;
    breadcrumbs: string[];
    properties: Record<string, OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject>;
    description: string | undefined;
    availability: Availability | undefined;
    required: string[] | undefined;
    wrapAsOptional: boolean;
    wrapAsNullable: boolean;
    discriminator: OpenAPIV3.DiscriminatorObject;
    context: SchemaParserContext;
    namespace: string | undefined;
    groupName: SdkGroupName | undefined;
    encoding: Encoding | undefined;
    source: Source;
}): SchemaWithExample {
    const discriminant = discriminator.propertyName;
    const discriminantNameOverride = getExtension<string>(discriminator, FernOpenAPIExtension.FERN_PROPERTY_NAME);
    const discriminatorContext =
        getExtension<"data" | "protocol">(discriminator, FernOpenAPIExtension.DISCRIMINATOR_CONTEXT) ??
        inferDiscriminatorContext({ discriminator, context });
    const unionSubTypes = Object.fromEntries(
        Object.entries(discriminator.mapping ?? {}).map(([discriminantValue, schema]) => {
            const subtypeReference = convertReferenceObject(
                {
                    $ref: schema
                },
                false,
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
            const [isOptional, isNullable] = context.options.coerceOptionalSchemasToNullable
                ? [false, !isRequired]
                : [!isRequired, false];
            const schema = convertSchema(
                propertySchema,
                isOptional,
                isNullable,
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
    return wrapDiscriminatedOneOf({
        nameOverride,
        generatedName,
        title,
        wrapAsOptional,
        wrapAsNullable,
        properties: convertedProperties,
        description,
        availability,
        discriminant,
        discriminantNameOverride,
        discriminatorContext,
        subtypes: unionSubTypes,
        defaultDiscriminantValue: undefined,
        namespace,
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
    wrapAsOptional,
    wrapAsNullable,
    discriminant,
    variants,
    defaultDiscriminantValue,
    context,
    namespace,
    groupName,
    encoding,
    source
}: {
    nameOverride: string | undefined;
    generatedName: string;
    title: string | undefined;
    breadcrumbs: string[];
    properties: Record<string, OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject>;
    description: string | undefined;
    availability: Availability | undefined;
    required: string[] | undefined;
    wrapAsOptional: boolean;
    wrapAsNullable: boolean;
    discriminant: string;
    variants: Record<string, OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject>;
    defaultDiscriminantValue: string | undefined;
    context: SchemaParserContext;
    namespace: string | undefined;
    groupName: SdkGroupName | undefined;
    encoding: Encoding | undefined;
    source: Source;
}): SchemaWithExample {
    const unionSubTypes = Object.fromEntries(
        Object.entries(variants).map(([discriminantValue, schema]) => {
            if (isReferenceObject(schema)) {
                const subtypeReference = convertReferenceObject(
                    schema,
                    false,
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
            const [isOptional, isNullable] = context.options.coerceOptionalSchemasToNullable
                ? [false, !isRequired]
                : [!isRequired, false];
            const schema = convertSchema(
                propertySchema,
                isOptional,
                isNullable,
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
    return wrapDiscriminatedOneOf({
        nameOverride,
        generatedName,
        title,
        wrapAsOptional,
        wrapAsNullable,
        properties: convertedProperties,
        description,
        availability,
        discriminant,
        discriminantNameOverride: undefined,
        discriminatorContext: inferDiscriminatorContextFromVariants({ variants, context }),
        subtypes: unionSubTypes,
        defaultDiscriminantValue,
        namespace,
        groupName,
        source
    });
}

export function wrapDiscriminatedOneOf({
    nameOverride,
    generatedName,
    title,
    wrapAsOptional,
    wrapAsNullable,
    properties,
    description,
    availability,
    discriminant,
    discriminantNameOverride,
    discriminatorContext,
    subtypes,
    defaultDiscriminantValue,
    namespace,
    groupName,
    source
}: {
    nameOverride: string | undefined;
    generatedName: string;
    title: string | undefined;
    wrapAsOptional: boolean;
    wrapAsNullable: boolean;
    properties: CommonPropertyWithExample[];
    description: string | undefined;
    availability: Availability | undefined;
    discriminant: string;
    discriminantNameOverride: string | undefined;
    discriminatorContext: "data" | "protocol";
    subtypes: Record<string, SchemaWithExample>;
    defaultDiscriminantValue: string | undefined;
    namespace: string | undefined;
    groupName: SdkGroupName | undefined;
    source: Source;
}): SchemaWithExample {
    let result: SchemaWithExample = SchemaWithExample.oneOf(
        OneOfSchemaWithExample.discriminated({
            description,
            availability,
            discriminantProperty: discriminant,
            discriminantPropertyNameOverride: discriminantNameOverride,
            discriminatorContext,
            defaultDiscriminantValue,
            nameOverride,
            generatedName,
            title,
            schemas: subtypes,
            commonProperties: properties,
            namespace,
            groupName,
            encoding: undefined,
            source,
            inline: undefined
        })
    );
    if (wrapAsNullable) {
        result = SchemaWithExample.nullable({
            nameOverride,
            generatedName,
            title,
            value: result,
            namespace,
            groupName,
            description,
            availability,
            inline: undefined
        });
    }
    if (wrapAsOptional) {
        result = SchemaWithExample.optional({
            nameOverride,
            generatedName,
            title,
            value: result,
            namespace,
            groupName,
            description,
            availability,
            inline: undefined
        });
    }
    return result;
}
