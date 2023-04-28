import { ObjectProperty, Schema } from "@fern-fern/openapi-ir-model/ir";
import { OpenAPIV3 } from "openapi-types";
import { OpenAPIV3ParserContext } from "../../OpenAPIV3ParserContext";
import { convertSchema } from "../convertSchemas";

export function convertDiscriminatedOneOf({
    properties,
    schemaName,
    description,
    required,
    wrapAsOptional,
    discriminator,
    context,
}: {
    properties: Record<string, OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject>;
    schemaName: string | undefined;
    description: string | undefined;
    required: string[] | undefined;
    wrapAsOptional: boolean;
    discriminator: OpenAPIV3.DiscriminatorObject;
    context: OpenAPIV3ParserContext;
}): Schema {
    const discriminant = discriminator.propertyName;
    const unionSubTypes = Object.fromEntries(
        Object.entries(discriminator.mapping ?? {}).map(([discriminantValue, schema]) => {
            const subtypeReference = convertSchema(
                {
                    $ref: schema,
                },
                false,
                context
            );
            return [discriminantValue, subtypeReference];
        })
    );
    const convertedProperties = Object.entries(properties).map(([propertyName, propertySchema]) => {
        const isRequired = required != null && required.includes(propertyName);
        const schema = convertSchema(propertySchema, !isRequired, context);
        return {
            key: propertyName,
            schema,
        };
    });
    return wrapDiscriminantedOneOf({
        wrapAsOptional,
        schemaName,
        properties: convertedProperties,
        description,
        discriminant,
        subtypes: unionSubTypes,
    });
}

export function wrapDiscriminantedOneOf({
    wrapAsOptional,
    schemaName,
    properties,
    description,
    discriminant,
    subtypes,
}: {
    wrapAsOptional: boolean;
    schemaName: string | undefined;
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
                name: schemaName,
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
        name: schemaName,
        schemas: subtypes,
        commonProperties: properties,
    });
}
