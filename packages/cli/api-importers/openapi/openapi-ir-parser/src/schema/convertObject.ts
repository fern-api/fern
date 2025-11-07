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
import { OpenAPIV3 } from "openapi-types";

import { getExtension } from "../getExtension";
import { FernOpenAPIExtension } from "../openapi/v3/extensions/fernExtensions";
import { isAdditionalPropertiesAny } from "./convertAdditionalProperties";
import { convertAvailability } from "./convertAvailability";
import { convertSchema, convertToReferencedSchema, getSchemaIdFromReference } from "./convertSchemas";
import { SchemaParserContext } from "./SchemaParserContext";
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
    wrapAsOptional,
    wrapAsNullable,
    allOf,
    context,
    propertiesToExclude,
    namespace,
    groupName,
    fullExamples,
    additionalProperties,
    availability,
    source
}: {
    nameOverride: string | undefined;
    generatedName: string;
    title: string | undefined;
    breadcrumbs: string[];
    properties: Record<string, OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject>;
    description: string | undefined;
    required: string[] | undefined;
    wrapAsOptional: boolean;
    wrapAsNullable: boolean;
    allOf: (OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject)[];
    context: SchemaParserContext;
    propertiesToExclude: Set<string>;
    namespace: string | undefined;
    groupName: SdkGroupName | undefined;
    fullExamples: undefined | NamedFullExample[];
    additionalProperties: boolean | OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject | undefined;
    availability: Availability | undefined;
    encoding: Encoding | undefined;
    source: Source;
}): SchemaWithExample {
    const allRequired = [...(required ?? [])];
    const propertiesToConvert = { ...getNonIgnoredProperties({ properties, breadcrumbs, context }) };
    let inlinedParentProperties: ObjectPropertyWithExample[] = [];
    const parents: ReferencedAllOfInfo[] = [];

    for (const allOfElement of allOf) {
        if (!context.options.inlineAllOfSchemas && isReferenceObject(allOfElement)) {
            // if allOf element is a discriminated union, then don't inherit from it
            const resolvedReference = context.resolveSchemaReference(allOfElement);
            if (resolvedReference.discriminator != null && resolvedReference.discriminator.mapping != null) {
                continue;
            }

            // if allOf element is an undiscriminated union, then try to grab all properties from the oneOf or anyOfSchemas
            if (resolvedReference.oneOf != null || resolvedReference.anyOf != null) {
                const variants = resolvedReference.oneOf ?? resolvedReference.anyOf;
                if (variants != null) {
                    // try to grab all properties from the oneOf/anyOf schemas
                    for (const variantSchema of variants) {
                        const resolvedVariantSchema = isReferenceObject(variantSchema)
                            ? context.resolveSchemaReference(variantSchema)
                            : variantSchema;
                        const convertedVariantSchema = convertSchema(
                            resolvedVariantSchema,
                            false,
                            false,
                            context.DUMMY,
                            breadcrumbs,
                            source,
                            namespace
                        );
                        if (convertedVariantSchema.type === "object") {
                            inlinedParentProperties.push(
                                ...convertedVariantSchema.properties.map((property) => {
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
                                                namespace: undefined,
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
                    context.options.preserveSchemaIds,
                    context
                ),
                properties: getAllProperties({ schema: allOfElement, context, breadcrumbs, source, namespace })
            });
            context.markSchemaAsReferencedByNonRequest(schemaId);
        } else if (isReferenceObject(allOfElement)) {
            const resolvedReference = context.resolveSchemaReference(allOfElement);
            const convertedSchema = convertSchema(
                resolvedReference,
                false,
                false,
                context,
                breadcrumbs,
                source,
                namespace
            );
            if (convertedSchema.type === "object") {
                inlinedParentProperties.push(...convertedSchema.properties);
            }
        } else {
            const required = allOfElement.required ?? [];
            inlinedParentProperties = inlinedParentProperties.map((property) => {
                if (
                    (property.schema.type === "optional" || property.schema.type === "nullable") &&
                    required.includes(property.key)
                ) {
                    return {
                        ...property,
                        schema: property.schema.value
                    };
                }
                return property;
            });
            const allOfSchema = convertSchema(allOfElement, false, false, context, breadcrumbs, source, namespace);
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

    const filteredPropertiesToConvert = Object.fromEntries(
        Object.entries(propertiesToConvert).filter(([_, propertySchema]) => {
            if (!isReferenceObject(propertySchema) && (propertySchema.type as string) === "null") {
                return false;
            }
            return true;
        })
    );

    const convertedProperties: ObjectPropertyWithExample[] = Object.entries(filteredPropertiesToConvert).map(
        ([propertyName, propertySchema]) => {
            const audiences = getExtension<string[]>(propertySchema, FernOpenAPIExtension.AUDIENCES) ?? [];
            const availability = convertAvailability(propertySchema);

            const readonly = isReferenceObject(propertySchema) ? false : propertySchema.readOnly;
            const writeonly = isReferenceObject(propertySchema) ? false : propertySchema.writeOnly;

            const isRequired = allRequired.includes(propertyName) && !readonly;
            const isPropertyOptional = !isRequired;

            const propertyNameOverride = getExtension<string | undefined>(
                propertySchema,
                FernOpenAPIExtension.FERN_PROPERTY_NAME
            );
            const propertyBreadcrumbs = [...breadcrumbs, propertyName];
            const generatedName = getGeneratedPropertyName(propertyBreadcrumbs);
            const schema = convertSchema(
                propertySchema,
                isPropertyOptional,
                false,
                context,
                propertyBreadcrumbs,
                source,
                namespace
            );

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
                generatedName,
                availability,
                readonly,
                writeonly
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
        wrapAsOptional,
        wrapAsNullable,
        properties: convertedProperties.filter((objectProperty) => {
            return !propertiesToExclude.has(objectProperty.key);
        }),
        description,
        allOf: parents.map((parent) => parent.convertedSchema),
        allOfPropertyConflicts,
        namespace,
        groupName,
        fullExamples,
        additionalProperties,
        availability,
        source,
        context
    });
}

export function wrapObject({
    nameOverride,
    generatedName,
    title,
    wrapAsOptional,
    wrapAsNullable,
    properties,
    description,
    allOf,
    allOfPropertyConflicts,
    namespace,
    groupName,
    fullExamples,
    additionalProperties,
    availability,
    source,
    context
}: {
    nameOverride: string | undefined;
    generatedName: string;
    title: string | undefined;
    wrapAsOptional: boolean;
    wrapAsNullable: boolean;
    properties: ObjectPropertyWithExample[];
    description: string | undefined;
    allOf: ReferencedSchema[];
    allOfPropertyConflicts: AllOfPropertyConflict[];
    namespace: string | undefined;
    groupName: SdkGroupName | undefined;
    fullExamples: undefined | NamedFullExample[];
    additionalProperties: boolean | OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject | undefined;
    availability: Availability | undefined;
    source: Source;
    context: SchemaParserContext;
}): SchemaWithExample {
    let result: SchemaWithExample = SchemaWithExample.object({
        description,
        properties,
        nameOverride,
        generatedName,
        title,
        allOf,
        allOfPropertyConflicts,
        namespace,
        groupName,
        fullExamples,
        additionalProperties: isAdditionalPropertiesAny(additionalProperties, context.options),
        availability,
        source,
        inline: undefined
    });
    if (wrapAsNullable) {
        result = SchemaWithExample.nullable({
            nameOverride,
            generatedName,
            title,
            value: result,
            description,
            availability,
            namespace,
            groupName,
            inline: undefined
        });
    }
    if (wrapAsOptional) {
        result = SchemaWithExample.optional({
            nameOverride,
            generatedName,
            title,
            value: result,
            description,
            availability,
            namespace,
            groupName,
            inline: undefined
        });
    }
    return result;
}

function getNonIgnoredProperties({
    properties,
    breadcrumbs,
    context
}: {
    properties: Record<string, OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject>;
    breadcrumbs: string[];
    context: SchemaParserContext;
}): Record<string, OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject> {
    return Object.fromEntries(
        Object.entries(properties).filter(([key, propertySchema]) => {
            const shouldIgnore = getExtension<boolean>(propertySchema, FernOpenAPIExtension.IGNORE);
            if (shouldIgnore) {
                context.logger.debug(
                    `Property ${breadcrumbs.join(".")}.${key} is marked with x-fern-ignore. Skipping.`
                );
            }
            return !shouldIgnore;
        })
    );
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
    for (const [propertyName, propertySchema] of Object.entries(
        getNonIgnoredProperties({ properties: resolvedSchema.properties ?? {}, breadcrumbs, context })
    )) {
        const convertedPropertySchema = convertSchema(
            propertySchema,
            false,
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
