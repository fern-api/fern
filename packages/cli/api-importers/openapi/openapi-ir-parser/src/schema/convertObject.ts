import { OpenAPIV3 } from "openapi-types";

import {
    AllOfPropertyConflict,
    Availability,
    Encoding,
    NamedFullExample,
    ObjectPropertyConflictInfo,
    ObjectPropertyWithExample,
    ReferencedSchema,
    SchemaId,
    SchemaWithExample,
    SdkGroupName,
    Source
} from "@fern-api/openapi-ir";

import { getExtension } from "../getExtension";
import { FernOpenAPIExtension } from "../openapi/v3/extensions/fernExtensions";
import { SchemaParserContext } from "./SchemaParserContext";
import { isAdditionalPropertiesAny } from "./convertAdditionalProperties";
import { convertAvailability } from "./convertAvailability";
import { convertSchema, convertToReferencedSchema, getSchemaIdFromReference } from "./convertSchemas";
import { getBreadcrumbsFromReference } from "./utils/getBreadcrumbsFromReference";
import { getGeneratedPropertyName } from "./utils/getSchemaName";
import { isReferenceObject } from "./utils/isReferenceObject";
import { isSchemaWithExampleEqual } from "./utils/isSchemaWithExampleEqual";

interface ReferencedAllOfInfo {
    schemaId: SchemaId;
    convertedSchema: ReferencedSchema;
    properties: Record<string, SchemaWithExample>;
}

export function convertObject({
    nameOverride,
    generatedName,
    title,
    breadcrumbs,
    properties,
    description,
    required,
    wrapAsNullable,
    allOf,
    context,
    propertiesToExclude,
    groupName,
    fullExamples,
    additionalProperties,
    availability,
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
    required: string[] | undefined;
    wrapAsNullable: boolean;
    allOf: (OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject)[];
    context: SchemaParserContext;
    propertiesToExclude: Set<string>;
    groupName: SdkGroupName | undefined;
    fullExamples: undefined | NamedFullExample[];
    additionalProperties: boolean | OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject | undefined;
    availability: Availability | undefined;
    encoding: Encoding | undefined;
    source: Source;
    namespace: string | undefined;
}): SchemaWithExample {
    const allRequired = [...(required ?? [])];
    const propertiesToConvert = { ...properties };
    const inlinedParentProperties: ObjectPropertyWithExample[] = [];
    const parents: ReferencedAllOfInfo[] = [];
    for (const allOfElement of allOf) {
        if (isReferenceObject(allOfElement)) {
            // if allOf element is a discriminated union, then don't inherit from it
            const resolvedReference = context.resolveSchemaReference(allOfElement);
            if (resolvedReference.discriminator != null && resolvedReference.discriminator.mapping != null) {
                continue;
            }

            // if allOf element is an undiscriminated union, then try to grab all properties from the oneOf schemas
            if (resolvedReference.oneOf != null) {
                // try to grab all properties from the oneOf schemas
                for (const oneOfSchema of resolvedReference.oneOf) {
                    const resolvedOneOfSchema = isReferenceObject(oneOfSchema)
                        ? context.resolveSchemaReference(oneOfSchema)
                        : oneOfSchema;
                    const convertedOneOfSchema = convertSchema(
                        resolvedOneOfSchema,
                        false,
                        context.DUMMY,
                        breadcrumbs,
                        source,
                        namespace
                    );
                    if (convertedOneOfSchema.type === "object") {
                        inlinedParentProperties.push(
                            ...convertedOneOfSchema.properties.map((property) => {
                                if (property.schema.type !== "optional" && property.schema.type !== "nullable") {
                                    return {
                                        ...property,
                                        schema: SchemaWithExample.optional({
                                            nameOverride: undefined,
                                            generatedName: "",
                                            title: undefined,
                                            value: property.schema,
                                            description: undefined,
                                            availability: property.availability,
                                            groupName: undefined,
                                            inline: undefined
                                        })
                                    };
                                }
                                return property;
                            })
                        );
                    }
                }
                continue;
            }

            const schemaId = getSchemaIdFromReference(allOfElement);
            // HACK: when the allOf is a non schema refere, we can skip for now
            if (schemaId == null) {
                continue;
            }
            parents.push({
                schemaId,
                convertedSchema: convertToReferencedSchema(
                    allOfElement,
                    [schemaId],
                    source,
                    context.options.preserveSchemaIds
                ),
                properties: getAllProperties({ schema: allOfElement, context, breadcrumbs, source, namespace })
            });
            context.markSchemaAsReferencedByNonRequest(schemaId);
        } else {
            const allOfSchema = convertSchema(allOfElement, false, context, breadcrumbs, source, namespace);
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

    const convertedProperties: ObjectPropertyWithExample[] = Object.entries(propertiesToConvert).map(
        ([propertyName, propertySchema]) => {
            const isRequired = allRequired.includes(propertyName);
            const audiences = getExtension<string[]>(propertySchema, FernOpenAPIExtension.AUDIENCES) ?? [];
            const availability = convertAvailability(propertySchema);

            const readonly = isReferenceObject(propertySchema) ? false : propertySchema.readOnly;

            const propertyNameOverride = getExtension<string | undefined>(
                propertySchema,
                FernOpenAPIExtension.FERN_PROPERTY_NAME
            );
            const propertyBreadcrumbs = [...breadcrumbs, propertyName];
            const generatedName = getGeneratedPropertyName(propertyBreadcrumbs);
            const schema = isRequired
                ? convertSchema(propertySchema, false, context, propertyBreadcrumbs, source, namespace)
                : SchemaWithExample.optional({
                      nameOverride,
                      generatedName,
                      title,
                      description: undefined,
                      availability,
                      value: convertSchema(propertySchema, false, context, propertyBreadcrumbs, source, namespace),
                      groupName,
                      inline: undefined
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
                nameOverride: propertyNameOverride,
                audiences,
                conflict: conflicts,
                generatedName: getGeneratedPropertyName([...breadcrumbs, propertyName]),
                availability,
                readonly
            };
        }
    );

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
        title,
        wrapAsNullable,
        properties: convertedProperties.filter((objectProperty) => {
            return !propertiesToExclude.has(objectProperty.key);
        }),
        description,
        allOf: parents.map((parent) => parent.convertedSchema),
        allOfPropertyConflicts,
        groupName,
        fullExamples,
        additionalProperties,
        availability,
        source
    });
}

export function wrapObject({
    nameOverride,
    generatedName,
    title,
    wrapAsNullable,
    properties,
    description,
    allOf,
    allOfPropertyConflicts,
    groupName,
    fullExamples,
    additionalProperties,
    availability,
    source
}: {
    nameOverride: string | undefined;
    generatedName: string;
    title: string | undefined;
    wrapAsNullable: boolean;
    properties: ObjectPropertyWithExample[];
    description: string | undefined;
    allOf: ReferencedSchema[];
    allOfPropertyConflicts: AllOfPropertyConflict[];
    groupName: SdkGroupName | undefined;
    fullExamples: undefined | NamedFullExample[];
    additionalProperties: boolean | OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject | undefined;
    availability: Availability | undefined;
    source: Source;
}): SchemaWithExample {
    if (wrapAsNullable) {
        return SchemaWithExample.nullable({
            nameOverride,
            generatedName,
            title,
            value: SchemaWithExample.object({
                description,
                properties,
                nameOverride,
                generatedName,
                title,
                allOf,
                allOfPropertyConflicts,
                groupName,
                fullExamples,
                additionalProperties: isAdditionalPropertiesAny(additionalProperties),
                availability: undefined,
                source,
                inline: undefined
            }),
            description,
            availability,
            groupName,
            inline: undefined
        });
    }
    return SchemaWithExample.object({
        description,
        properties,
        nameOverride,
        generatedName,
        title,
        allOf,
        allOfPropertyConflicts,
        groupName,
        fullExamples,
        additionalProperties: isAdditionalPropertiesAny(additionalProperties),
        availability,
        source,
        inline: undefined
    });
}

function getAllProperties({
    schema,
    context,
    breadcrumbs,
    source,
    namespace
}: {
    schema: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;
    context: SchemaParserContext;
    breadcrumbs: string[];
    source: Source;
    namespace: string | undefined;
}): Record<string, SchemaWithExample> {
    let properties: Record<string, SchemaWithExample> = {};
    const [resolvedSchema, resolvedBreadCrumbs] = isReferenceObject(schema)
        ? [context.resolveSchemaReference(schema), getBreadcrumbsFromReference(schema.$ref)]
        : [schema, breadcrumbs];
    for (const allOfElement of resolvedSchema.allOf ?? []) {
        properties = {
            ...properties,
            ...getAllProperties({ schema: allOfElement, context, breadcrumbs: resolvedBreadCrumbs, source, namespace })
        };
    }
    for (const [propertyName, propertySchema] of Object.entries(resolvedSchema.properties ?? {})) {
        const convertedPropertySchema = convertSchema(
            propertySchema,
            false,
            context,
            [...resolvedBreadCrumbs, propertyName],
            source,
            namespace
        );
        properties[propertyName] = convertedPropertySchema;
    }
    return properties;
}
