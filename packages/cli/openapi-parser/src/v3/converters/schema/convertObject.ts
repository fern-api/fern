import { SchemaId, SdkGroupName } from "@fern-fern/openapi-ir-model/commons";
import {
    AllOfPropertyConflict,
    ObjectPropertyConflictInfo,
    ReferencedSchema
} from "@fern-fern/openapi-ir-model/finalIr";
import { ObjectPropertyWithExample, SchemaWithExample } from "@fern-fern/openapi-ir-model/parseIr";
import { OpenAPIV3 } from "openapi-types";
import { AbstractOpenAPIV3ParserContext } from "../../AbstractOpenAPIV3ParserContext";
import { FernOpenAPIExtension } from "../../extensions/fernExtensions";
import { getExtension } from "../../extensions/getExtension";
import { getGeneratedPropertyName } from "../../utils/getSchemaName";
import { isReferenceObject } from "../../utils/isReferenceObject";
import { isSchemaWithExampleEqual } from "../../utils/isSchemaEqual";
import { convertSchema, convertToReferencedSchema, getSchemaIdFromReference } from "../convertSchemas";

interface ReferencedAllOfInfo {
    schemaId: SchemaId;
    convertedSchema: ReferencedSchema;
    properties: Record<string, SchemaWithExample>;
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
    groupName,
    fullExample
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
    groupName: SdkGroupName | undefined;
    fullExample: undefined | unknown;
}): SchemaWithExample {
    const allRequired = [...(required ?? [])];
    const propertiesToConvert = { ...properties };
    const inlinedParentProperties: ObjectPropertyWithExample[] = [];
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
                properties: getAllProperties({ schema: allOfElement, context, breadcrumbs })
            });
            context.markSchemaAsReferencedByNonRequest(schemaId);
        } else {
            const allOfSchema = convertSchema(allOfElement, false, context, breadcrumbs);
            if (allOfSchema.type === "object") {
                inlinedParentProperties.push(...allOfSchema.properties);
            }
        }
    }

    const allPropertiesMap: Record<string, { schemas: SchemaWithExample[]; schemaIds: SchemaId[] }> = {};
    for (const parent of parents) {
        for (const [propertyKey, propertySchema] of Object.entries(parent.properties)) {
            const propertyInfo = allPropertiesMap[propertyKey];
            if (propertyInfo != null) {
                propertyInfo.schemaIds.push(parent.schemaId);
                const schemaExists = propertyInfo.schemas.some((schema) => {
                    return isSchemaWithExampleEqual(schema, propertySchema);
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
                conflictingTypeSignatures: allOfPropertyInfo.schemas.length > 1
            });
        }
    }

    const convertedProperties = Object.entries(propertiesToConvert).map(([propertyName, propertySchema]) => {
        const isRequired = allRequired.includes(propertyName);
        const audiences = getExtension<string[]>(propertySchema, FernOpenAPIExtension.AUDIENCES) ?? [];
        const schema = isRequired
            ? convertSchema(propertySchema, false, context, [...breadcrumbs, propertyName])
            : SchemaWithExample.optional({
                  description: undefined,
                  value: convertSchema(propertySchema, false, context, [...breadcrumbs, propertyName]),
                  groupName
              });

        const conflicts: Record<SchemaId, ObjectPropertyConflictInfo> = {};
        for (const parent of parents) {
            const parentPropertySchema = parent.properties[propertyName];
            if (parentPropertySchema != null && !isSchemaWithExampleEqual(schema, parentPropertySchema)) {
                conflicts[parent.schemaId] = { differentSchema: true };
            } else if (parentPropertySchema != null) {
                conflicts[parent.schemaId] = { differentSchema: false };
            }
        }

        return {
            key: propertyName,
            schema,
            audiences,
            conflict: conflicts,
            generatedName: getGeneratedPropertyName([...breadcrumbs, propertyName])
        };
    });

    convertedProperties.push(
        ...inlinedParentProperties.map((property) => {
            const conflicts: Record<SchemaId, ObjectPropertyConflictInfo> = property.conflict;
            for (const parent of parents) {
                const parentPropertySchema = parent.properties[property.key];
                if (parentPropertySchema != null && !isSchemaWithExampleEqual(property.schema, parentPropertySchema)) {
                    conflicts[parent.schemaId] = { differentSchema: true };
                } else if (parentPropertySchema != null) {
                    conflicts[parent.schemaId] = { differentSchema: false };
                }
            }
            return {
                ...property,
                conflict: conflicts
            };
        })
    );

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
        groupName,
        fullExample
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
    groupName,
    fullExample
}: {
    nameOverride: string | undefined;
    generatedName: string;
    wrapAsNullable: boolean;
    properties: ObjectPropertyWithExample[];
    description: string | undefined;
    allOf: ReferencedSchema[];
    allOfPropertyConflicts: AllOfPropertyConflict[];
    groupName: SdkGroupName | undefined;
    fullExample: unknown | undefined;
}): SchemaWithExample {
    if (wrapAsNullable) {
        return SchemaWithExample.nullable({
            value: SchemaWithExample.object({
                description,
                properties,
                nameOverride,
                generatedName,
                allOf,
                allOfPropertyConflicts,
                groupName,
                fullExample
            }),
            description,
            groupName
        });
    }
    return SchemaWithExample.object({
        description,
        properties,
        nameOverride,
        generatedName,
        allOf,
        allOfPropertyConflicts,
        groupName,
        fullExample
    });
}

function getAllProperties({
    schema,
    context,
    breadcrumbs
}: {
    schema: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;
    context: AbstractOpenAPIV3ParserContext;
    breadcrumbs: string[];
}): Record<string, SchemaWithExample> {
    let properties: Record<string, SchemaWithExample> = {};
    const [resolvedSchema, resolvedBreadCrumbs] = isReferenceObject(schema)
        ? [context.resolveSchemaReference(schema), [getSchemaIdFromReference(schema)]]
        : [schema, breadcrumbs];
    for (const allOfElement of resolvedSchema.allOf ?? []) {
        properties = {
            ...properties,
            ...getAllProperties({ schema: allOfElement, context, breadcrumbs: resolvedBreadCrumbs })
        };
    }
    for (const [propertyName, propertySchema] of Object.entries(resolvedSchema.properties ?? {})) {
        const convertedPropertySchema = convertSchema(propertySchema, false, context, [
            ...resolvedBreadCrumbs,
            propertyName
        ]);
        properties[propertyName] = convertedPropertySchema;
    }
    return properties;
}
