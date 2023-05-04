import { ObjectProperty, Schema } from "@fern-fern/openapi-ir-model/ir";
import { OpenAPIV3 } from "openapi-types";
import { OpenAPIV3ParserContext } from "../../OpenAPIV3ParserContext";
import { convertReferenceObject, convertSchema } from "../convertSchemas";

export function convertDiscriminatedOneOf({
    nameOverride,
    generatedName,
    breadcrumbs,
    properties,
    description,
    required,
    wrapAsOptional,
    discriminator,
    context,
}: {
    nameOverride: string | undefined;
    generatedName: string;
    breadcrumbs: string[];
    properties: Record<string, OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject>;
    description: string | undefined;
    required: string[] | undefined;
    wrapAsOptional: boolean;
    discriminator: OpenAPIV3.DiscriminatorObject;
    context: OpenAPIV3ParserContext;
}): Schema {
    const discriminant = discriminator.propertyName;
    const unionSubTypes = Object.fromEntries(
        Object.entries(discriminator.mapping ?? {}).map(([discriminantValue, schema]) => {
            const subtypeReference = convertReferenceObject(
                {
                    $ref: schema,
                },
                false,
                [schema]
            );
            return [discriminantValue, subtypeReference];
        })
    );
    const convertedProperties = Object.entries(properties).map(([propertyName, propertySchema]) => {
        const isRequired = required != null && required.includes(propertyName);
        const schema = convertSchema(propertySchema, !isRequired, context, [...breadcrumbs, propertyName]);
        return {
            key: propertyName,
            schema,
        };
    });
    return wrapDiscriminantedOneOf({
        nameOverride,
        generatedName,
        wrapAsOptional,
        properties: convertedProperties,
        description,
        discriminant,
        subtypes: unionSubTypes,
    });
}

export function wrapDiscriminantedOneOf({
    nameOverride,
    generatedName,
    wrapAsOptional,
    properties,
    description,
    discriminant,
    subtypes,
}: {
    nameOverride: string | undefined;
    generatedName: string;
    wrapAsOptional: boolean;
    properties: ObjectProperty[];
    description: string | undefined;
    discriminant: string;
    subtypes: Record<string, Schema>;
}): Schema {
    if (wrapAsOptional) {
        return Schema.optional({
            value: Schema.oneOf({
                type: "discriminated",
                description: undefined,
                discriminantProperty: discriminant,
                nameOverride,
                generatedName,
                schemas: subtypes,
                commonProperties: properties,
            }),
            description,
        });
    }
    return Schema.oneOf({
        type: "discriminated",
        description,
        discriminantProperty: discriminant,
        nameOverride,
        generatedName,
        schemas: subtypes,
        commonProperties: properties,
    });
}
