import {
    ObjectProperty,
    ObjectPropertyConflictInfo,
    ReferencedSchema,
    Schema,
    SchemaId,
} from "@fern-fern/openapi-ir-model/ir";
import { OpenAPIV3 } from "openapi-types";
import { AbstractOpenAPIV3ParserContext } from "../../AbstractOpenAPIV3ParserContext";
import { isReferenceObject } from "../../utils/isReferenceObject";
import { isSchemaEqual } from "../../utils/isSchemaEqual";
import { convertSchema, convertToReferencedSchema, getSchemaIdFromReference } from "../convertSchemas";

interface ReferencedAllOfInfo {
    schemaId: SchemaId;
    convertedSchema: ReferencedSchema;
    properties: Record<string, Schema>;
}

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
    const parents: ReferencedAllOfInfo[] = [];
    for (const allOfElement of allOf) {
        if (isReferenceObject(allOfElement)) {
            // if allOf element is a union, then don't inherit from it
            const resolvedReference = context.resolveSchemaReference(allOfElement);
            if (resolvedReference.discriminator != null && resolvedReference.discriminator.mapping != null) {
                continue;
            }
            const schemaId = getSchemaIdFromReference(allOfElement);
            parents.push({
                schemaId,
                convertedSchema: convertToReferencedSchema(allOfElement, [schemaId]),
                properties: getAllProperties({ schema: allOfElement, context, breadcrumbs }),
            });
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

        const conflicts: Record<SchemaId, ObjectPropertyConflictInfo> = {};
        for (const parent of parents) {
            const parentPropertySchema = parent.properties[propertyName];
            if (parentPropertySchema != null && !isSchemaEqual(schema, parentPropertySchema)) {
                conflicts[parent.schemaId] = { differentSchema: true };
            } else if (parentPropertySchema != null) {
                conflicts[parent.schemaId] = { differentSchema: false };
            }
        }

        return {
            key: propertyName,
            schema: isRequired
                ? schema
                : Schema.optional({
                      description: undefined,
                      value: schema,
                  }),
            conflict: conflicts,
        };
    });

    return wrapObject({
        nameOverride,
        generatedName,
        wrapAsNullable,
        properties: convertedProperties,
        description,
        allOf: parents.map((parent) => parent.convertedSchema),
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
                description,
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

function getAllProperties({
    schema,
    context,
    breadcrumbs,
}: {
    schema: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;
    context: AbstractOpenAPIV3ParserContext;
    breadcrumbs: string[];
}): Record<string, Schema> {
    let properties: Record<string, Schema> = {};
    const [resolvedSchema, resolvedBreadCrumbs] = isReferenceObject(schema)
        ? [context.resolveSchemaReference(schema), [getSchemaIdFromReference(schema)]]
        : [schema, breadcrumbs];
    for (const allOfElement of resolvedSchema.allOf ?? []) {
        properties = {
            ...properties,
            ...getAllProperties({ schema: allOfElement, context, breadcrumbs: resolvedBreadCrumbs }),
        };
    }
    for (const [propertyName, propertySchema] of Object.entries(resolvedSchema.properties ?? {})) {
        const convertedPropertySchema = convertSchema(propertySchema, false, context, [
            ...resolvedBreadCrumbs,
            propertyName,
        ]);
        properties[propertyName] = convertedPropertySchema;
    }
    return properties;
}
