import {
    type AllOfPropertyConflict,
    type Availability,
    type Encoding,
    type NamedFullExample,
    type ObjectPropertyConflictInfo,
    type ObjectPropertyWithExample,
    type ReferencedSchema,
    type SchemaId,
    SchemaWithExample,
    type SdkGroupName,
    type Source
} from "@fern-api/openapi-ir";
import type { OpenAPIV3 } from "openapi-types";

import { getExtension } from "../getExtension.js";
import { FernOpenAPIExtension } from "../openapi/v3/extensions/fernExtensions.js";
import { isAdditionalPropertiesAny } from "./convertAdditionalProperties.js";
import { convertAvailability } from "./convertAvailability.js";
import { convertSchema, convertToReferencedSchema, getSchemaIdFromReference } from "./convertSchemas.js";
import type { SchemaParserContext } from "./SchemaParserContext.js";
import { getBreadcrumbsFromReference } from "./utils/getBreadcrumbsFromReference.js";
import { getGeneratedPropertyName } from "./utils/getSchemaName.js";
import { isReferenceObject } from "./utils/isReferenceObject.js";
import { isSchemaWithExampleEqual } from "./utils/isSchemaWithExampleEqual.js";

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
    encoding,
    source,
    minProperties,
    maxProperties
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
    minProperties: number | undefined;
    maxProperties: number | undefined;
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

            // Merge base property schemas from referenced allOf parents into inline
            // override properties. This handles cases like allOf narrowing array items
            // without redeclaring type: array — the base schema's type/structure is
            // carried forward so the property is correctly recognized.
            // We build a new element to avoid mutating the parsed OpenAPI document.
            let mergedAllOfElement = allOfElement;
            if (allOfElement.properties != null) {
                const mergedProperties: Record<string, OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject> = {};
                for (const [key, overridePropSchema] of Object.entries(allOfElement.properties)) {
                    let merged: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject = overridePropSchema;
                    if (!isReferenceObject(overridePropSchema)) {
                        for (const otherAllOfElement of allOf) {
                            if (otherAllOfElement === allOfElement || !isReferenceObject(otherAllOfElement)) {
                                continue;
                            }
                            const resolvedParent = context.resolveSchemaReference(otherAllOfElement);
                            const basePropSchema = resolvedParent.properties?.[key];
                            if (basePropSchema != null && !isReferenceObject(basePropSchema)) {
                                merged = { ...basePropSchema, ...overridePropSchema };
                                break;
                            }
                        }
                    }
                    mergedProperties[key] = merged;
                }
                mergedAllOfElement = { ...allOfElement, properties: mergedProperties };
            }

            // When an inline allOf element is a oneOf/anyOf (no type, no properties of its own),
            // extract properties from each variant and make them optional.
            // This handles patterns like allOf + oneOf used for mutual exclusion (e.g. content vs templateId).
            const variants = mergedAllOfElement.oneOf ?? mergedAllOfElement.anyOf;
            if (variants != null && mergedAllOfElement.type == null && mergedAllOfElement.properties == null) {
                const seenKeys = new Set(inlinedParentProperties.map((p) => p.key));
                for (const variantSchema of variants) {
                    const resolvedVariantSchema = isReferenceObject(variantSchema)
                        ? context.resolveSchemaReference(variantSchema)
                        : variantSchema;
                    // Filter out properties with `not: {}` schema (meaning "property must not exist")
                    const filteredSchema = filterNotProperties(resolvedVariantSchema);
                    const convertedVariantSchema = convertSchema(
                        filteredSchema,
                        false,
                        false,
                        context,
                        breadcrumbs,
                        source,
                        namespace
                    );
                    if (convertedVariantSchema.type === "object") {
                        for (const property of convertedVariantSchema.properties) {
                            if (seenKeys.has(property.key)) {
                                continue;
                            }
                            seenKeys.add(property.key);
                            if (property.schema.type !== "optional" && property.schema.type !== "nullable") {
                                inlinedParentProperties.push({
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
                                });
                            } else {
                                inlinedParentProperties.push(property);
                            }
                        }
                    }
                }
            } else {
                const allOfSchema = convertSchema(
                    mergedAllOfElement,
                    false,
                    false,
                    context,
                    breadcrumbs,
                    source,
                    namespace
                );
                if (allOfSchema.type === "object") {
                    inlinedParentProperties.push(...allOfSchema.properties);
                }
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
            const audiences = getExtension<string[]>(propertySchema, FernOpenAPIExtension.AUDIENCES) ?? [];
            const availability = convertAvailability(propertySchema);

            const resolvedPropertySchema = isReferenceObject(propertySchema)
                ? context.resolveSchemaReference(propertySchema)
                : propertySchema;
            const readonly =
                ("readOnly" in propertySchema && propertySchema.readOnly === true) || resolvedPropertySchema.readOnly;
            const writeonly =
                ("writeOnly" in propertySchema && propertySchema.writeOnly === true) ||
                resolvedPropertySchema.writeOnly;

            const isRequired =
                allRequired.includes(propertyName) && (!readonly || context.options.respectReadonlySchemas);
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
            // Apply top-level required to inlined allOf properties that may have been
            // marked optional by their inline member's own (missing) required array.
            if (
                allRequired.includes(property.key) &&
                (property.schema.type === "optional" || property.schema.type === "nullable")
            ) {
                const isPropertyReadonly = property.readonly;
                const isRequired = !isPropertyReadonly || context.options.respectReadonlySchemas;
                if (isRequired) {
                    return {
                        ...property,
                        schema: property.schema.value,
                        conflict: conflicts
                    };
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
        encoding,
        source,
        context,
        minProperties,
        maxProperties
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
    encoding,
    source,
    context,
    minProperties,
    maxProperties
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
    encoding: Encoding | undefined;
    source: Source;
    context: SchemaParserContext;
    minProperties: number | undefined;
    maxProperties: number | undefined;
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
        encoding,
        source,
        inline: undefined,
        minProperties,
        maxProperties
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

/**
 * Filters out properties with `not: {}` schema from an OpenAPI schema object.
 * In OpenAPI/JSON Schema, `not: {}` means "does not match any schema", effectively
 * meaning the property must not be present. This pattern is commonly used in oneOf
 * variants for mutual exclusion (e.g., content vs templateId).
 */
function filterNotProperties(schema: OpenAPIV3.SchemaObject): OpenAPIV3.SchemaObject {
    if (schema.properties == null) {
        return schema;
    }
    const filteredProperties: Record<string, OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject> = {};
    for (const [key, propertySchema] of Object.entries(schema.properties)) {
        if (!isReferenceObject(propertySchema) && "not" in propertySchema) {
            continue;
        }
        filteredProperties[key] = propertySchema;
    }
    return { ...schema, properties: filteredProperties };
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
