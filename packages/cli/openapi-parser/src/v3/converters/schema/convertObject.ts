import { ObjectProperty, ReferencedSchema, Schema } from "@fern-fern/openapi-ir-model/ir";
import { OpenAPIV3 } from "openapi-types";
import { AbstractOpenAPIV3ParserContext } from "../../AbstractOpenAPIV3ParserContext";
import { isReferenceObject } from "../../utils/isReferenceObject";
import { convertSchema, convertToReferencedSchema, getSchemaIdFromReference } from "../convertSchemas";

export function convertObject({
    nameOverride,
    generatedName,
    breadcrumbs,
    properties,
    description,
    required,
    wrapAsNullable,
    allOf,
    context,
}: {
    nameOverride: string | undefined;
    generatedName: string;
    breadcrumbs: string[];
    properties: Record<string, OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject>;
    description: string | undefined;
    required: string[] | undefined;
    wrapAsNullable: boolean;
    allOf: (OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject)[];
    context: AbstractOpenAPIV3ParserContext;
}): Schema {
    let allRequired = [...(required ?? [])];
    let propertiesToConvert = { ...properties };
    const referencedAllOf: ReferencedSchema[] = [];
    for (const allOfElement of allOf) {
        if (isReferenceObject(allOfElement)) {
            // if allOf element is a union, then don't inherit from it
            const resolvedReference = context.resolveSchemaReference(allOfElement);
            if (resolvedReference.discriminator != null && resolvedReference.discriminator.mapping != null) {
                continue;
            }
            referencedAllOf.push(convertToReferencedSchema(allOfElement, [getSchemaIdFromReference(allOfElement)]));
        } else {
            if (allOfElement.properties != null) {
                allRequired = [...allRequired, ...(allOfElement.required ?? [])];
                propertiesToConvert = { ...allOfElement.properties, ...propertiesToConvert };
            }
        }
    }

    const convertedProperties = Object.entries(propertiesToConvert).map(([propertyName, propertySchema]) => {
        const isRequired = allRequired.includes(propertyName);
        const schema = convertSchema(propertySchema, false, context, [...breadcrumbs, propertyName]);
        return {
            key: propertyName,
            schema: isRequired
                ? schema
                : Schema.optional({
                      description: undefined,
                      value: schema,
                  }),
        };
    });
    return wrapObject({
        nameOverride,
        generatedName,
        wrapAsNullable,
        properties: convertedProperties,
        description,
        allOf: referencedAllOf,
    });
}

export function wrapObject({
    nameOverride,
    generatedName,
    wrapAsNullable,
    properties,
    description,
    allOf,
}: {
    nameOverride: string | undefined;
    generatedName: string;
    wrapAsNullable: boolean;
    properties: ObjectProperty[];
    description: string | undefined;
    allOf: ReferencedSchema[];
}): Schema {
    if (wrapAsNullable) {
        return Schema.nullable({
            value: Schema.object({
                description: undefined,
                properties,
                nameOverride,
                generatedName,
                allOf,
            }),
            description,
        });
    }
    return Schema.object({
        description,
        properties,
        nameOverride,
        generatedName,
        allOf,
    });
}
