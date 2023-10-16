import { Example, PartialExample } from "@fern-fern/openapi-ir-model/example";
import {
    AllOfPropertyConflict,
    ObjectProperty,
    ObjectPropertyConflictInfo,
    ReferencedSchema,
    Schema,
    SchemaId,
} from "@fern-fern/openapi-ir-model/ir";
import { OpenAPIV3 } from "openapi-types";
import { AbstractOpenAPIV3ParserContext } from "../../AbstractOpenAPIV3ParserContext";
import { getSchemaInstanceIdFromBreadcrumbs } from "../../getSchemaInstanceIdFromBreadcrumbs";
import { getGeneratedPropertyName } from "../../utils/getSchemaName";
import { isReferenceObject } from "../../utils/isReferenceObject";
import { isSchemaEqual } from "../../utils/isSchemaEqual";
import { convertSchema, convertToReferencedSchema, getSchemaIdFromReference } from "../convertSchemas";
import { getSchemaCompatiableExample } from "../example/getSchemaCompatibleExample";

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
    propertiesToExclude,
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
    propertiesToExclude: Set<string>;
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
            context.markSchemaAsReferencedByNonRequest(schemaId);
        } else {
            if (allOfElement.properties != null) {
                allRequired = [...allRequired, ...(allOfElement.required ?? [])];
                propertiesToConvert = { ...allOfElement.properties, ...propertiesToConvert };
            }
        }
    }

    const allPropertiesMap: Record<string, { schemas: Schema[]; schemaIds: SchemaId[] }> = {};
    for (const parent of parents) {
        for (const [propertyKey, propertySchema] of Object.entries(parent.properties)) {
            const propertyInfo = allPropertiesMap[propertyKey];
            if (propertyInfo != null) {
                propertyInfo.schemaIds.push(parent.schemaId);
                const schemaExists = propertyInfo.schemas.some((schema) => {
                    return isSchemaEqual(schema, propertySchema);
                });
                if (!schemaExists) {
                    propertyInfo.schemas.push(propertySchema);
                }
            } else {
                allPropertiesMap[propertyKey] = { schemaIds: [parent.schemaId], schemas: [propertySchema] };
            }
        }
    }
    const allOfPropertyConflicts: AllOfPropertyConflict[] = [];
    for (const [allOfPropertyKey, allOfPropertyInfo] of Object.entries(allPropertiesMap)) {
        if (allOfPropertyInfo.schemaIds.length > 1) {
            allOfPropertyConflicts.push({
                propertyKey: allOfPropertyKey,
                allOfSchemaIds: allOfPropertyInfo.schemaIds,
                conflictingTypeSignatures: allOfPropertyInfo.schemas.length > 1,
            });
        }
    }

    const includedProperties: Record<string, Example> = {};
    const excludedProperties: Set<string> = new Set<string>();

    const convertedProperties = Object.entries(propertiesToConvert).map(([propertyName, propertySchema]) => {
        const isRequired = allRequired.includes(propertyName);
        const isReference = isReferenceObject(propertySchema);
        const example = isReferenceObject(propertySchema) ? undefined : propertySchema.example;

        let schema;
        if (isRequired) {
            schema = convertSchema(propertySchema, false, context, [...breadcrumbs, propertyName]);
            const parsedExample = example != null ? getSchemaCompatiableExample({ schema, example }) : undefined;
            if (parsedExample == null && isReference) {
                includedProperties[propertyName] = Example.reference({
                    reference: getSchemaIdFromReference(propertySchema),
                });
            } else if (parsedExample == null) {
                excludedProperties.add(propertyName);
            } else {
                includedProperties[propertyName] = Example.full(parsedExample);
            }
        } else {
            schema = Schema.optional({
                description: undefined,
                value: convertSchema(propertySchema, false, context, [...breadcrumbs, propertyName]),
            });
            const parsedExample = example != null ? getSchemaCompatiableExample({ schema, example }) : undefined;
            // eslint-disable-next-line no-console
            console.log(
                `Example is ${example}. Property schemas is ${JSON.stringify(
                    schema
                )}. Parsed example is ${JSON.stringify(parsedExample)}`
            );
            if (parsedExample != null) {
                includedProperties[propertyName] = Example.full(parsedExample);
            }
        }

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
            schema,
            conflict: conflicts,
            generatedName: getGeneratedPropertyName([...breadcrumbs, propertyName]),
        };
    });

    if (excludedProperties.size === 0) {
        context.exampleCollector.collect(
            getSchemaInstanceIdFromBreadcrumbs(breadcrumbs),
            Example.partial(
                PartialExample.object({
                    includedProperties,
                    excludedProperties: {},
                })
            )
        );
    }

    return wrapObject({
        nameOverride,
        generatedName,
        wrapAsNullable,
        properties: convertedProperties.filter((objectProperty) => {
            return !propertiesToExclude.has(objectProperty.key);
        }),
        description,
        allOf: parents.map((parent) => parent.convertedSchema),
        allOfPropertyConflicts,
    });
}

export function wrapObject({
    nameOverride,
    generatedName,
    wrapAsNullable,
    properties,
    description,
    allOf,
    allOfPropertyConflicts,
}: {
    nameOverride: string | undefined;
    generatedName: string;
    wrapAsNullable: boolean;
    properties: ObjectProperty[];
    description: string | undefined;
    allOf: ReferencedSchema[];
    allOfPropertyConflicts: AllOfPropertyConflict[];
}): Schema {
    if (wrapAsNullable) {
        return Schema.nullable({
            value: Schema.object({
                description,
                properties,
                nameOverride,
                generatedName,
                allOf,
                allOfPropertyConflicts,
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
        allOfPropertyConflicts,
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
