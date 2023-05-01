import { ObjectProperty, ReferencedSchema, Schema } from "@fern-fern/openapi-ir-model/ir";
import { OpenAPIV3 } from "openapi-types";
import { OpenAPIV3ParserContext } from "../../OpenAPIV3ParserContext";
import { isReferenceObject } from "../../utils/isReferenceObject";
import { convertSchema, convertToReferencedSchema } from "../convertSchemas";

export function convertObject({
    nameOverride,
    generatedName,
    breadcrumbs,
    properties,
    description,
    required,
    wrapAsOptional,
    allOf,
    context,
}: {
    nameOverride: string | undefined;
    generatedName: string;
    breadcrumbs: string[];
    properties: Record<string, OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject>;
    description: string | undefined;
    required: string[] | undefined;
    wrapAsOptional: boolean;
    allOf: (OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject)[];
    context: OpenAPIV3ParserContext;
}): Schema {
    let propertiesToConvert = { ...properties };
    const referencedAllOf: ReferencedSchema[] = [];
    for (const allOfElement of allOf) {
        if (isReferenceObject(allOfElement)) {
            referencedAllOf.push(convertToReferencedSchema(allOfElement));
        } else {
            if (allOfElement.properties != null) {
                propertiesToConvert = { ...allOfElement.properties, ...propertiesToConvert };
            }
        }
    }

    const convertedProperties = Object.entries(propertiesToConvert).map(([propertyName, propertySchema]) => {
        const isRequired = required != null && required.includes(propertyName);
        const schema = convertSchema(propertySchema, !isRequired, context, [...breadcrumbs, propertyName]);
        return {
            key: propertyName,
            schema,
        };
    });
    return wrapObject({
        nameOverride,
        generatedName,
        wrapAsOptional,
        properties: convertedProperties,
        description,
        allOf: referencedAllOf,
    });
}

export function wrapObject({
    nameOverride,
    generatedName,
    wrapAsOptional,
    properties,
    description,
    allOf,
}: {
    nameOverride: string | undefined;
    generatedName: string;
    wrapAsOptional: boolean;
    properties: ObjectProperty[];
    description: string | undefined;
    allOf: ReferencedSchema[];
}): Schema {
    if (wrapAsOptional) {
        return Schema.optional({
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
