import { isNonNullish } from "@fern-api/core-utils";
import { Type, TypeId, TypeReference } from "@fern-api/ir-sdk";
import { getWireValue } from "@fern-api/ir-utils";
import { OpenAPIV3_1 } from "openapi-types";

import { AbstractConverter, AbstractConverterContext } from "../../index.js";
import { convertProperties } from "../../utils/ConvertProperties.js";
import { SchemaConverter } from "./SchemaConverter.js";

export declare namespace ObjectSchemaConverter {
    export interface Args extends AbstractConverter.AbstractArgs {
        schema: OpenAPIV3_1.SchemaObject;
    }

    export interface Output {
        type: Type;
        propertiesByAudience: Record<string, Set<string>>;
        referencedTypes: Set<string>;
        inlinedTypes: Record<TypeId, SchemaConverter.ConvertedSchema>;
    }
}

export class ObjectSchemaConverter extends AbstractConverter<
    AbstractConverterContext<object>,
    ObjectSchemaConverter.Output
> {
    private readonly schema: OpenAPIV3_1.SchemaObject;

    constructor({ context, breadcrumbs, schema }: ObjectSchemaConverter.Args) {
        super({ context, breadcrumbs });
        this.schema = schema;
    }

    public convert(): ObjectSchemaConverter.Output {
        let hasAdditionalProperties =
            typeof this.schema.additionalProperties === "boolean" && this.schema.additionalProperties;

        if (!this.schema.properties && !this.schema.allOf) {
            return {
                type: Type.object({
                    properties: [],
                    extends: [],
                    extendedProperties: [],
                    extraProperties: hasAdditionalProperties
                }),
                propertiesByAudience: {},
                inlinedTypes: {},
                referencedTypes: new Set()
            };
        }

        const {
            convertedProperties: properties,
            inlinedTypesFromProperties: propertiesInlinedTypes,
            referencedTypes: baseReferencedTypes,
            propertiesByAudience: basePropertiesByAudience
        } = convertProperties({
            properties: this.schema.properties ?? {},
            required: this.schema.required ?? [],
            breadcrumbs: this.breadcrumbs,
            context: this.context,
            errorCollector: this.context.errorCollector
        });

        const extends_: TypeReference[] = [];
        const referencedTypes: Set<string> = baseReferencedTypes;
        const objectHasRequiredProperties = this.schema.required != null && this.schema.required.length > 0;
        let inlinedTypes: Record<TypeId, SchemaConverter.ConvertedSchema> = propertiesInlinedTypes;
        let propertiesByAudience: Record<string, Set<string>> = basePropertiesByAudience;

        // Collect properties from all resolved referenced allOf schemas so we can
        // merge base property schemas (e.g. type: array) into inline overrides that
        // only specify partial info (e.g. items without type: array).
        const resolvedParentProperties: Record<string, OpenAPIV3_1.SchemaObject> = {};
        for (const allOfSchemaOrReference of this.schema.allOf ?? []) {
            if (this.context.isReferenceObject(allOfSchemaOrReference)) {
                const resolved = this.context.resolveMaybeReference<OpenAPIV3_1.SchemaObject>({
                    schemaOrReference: allOfSchemaOrReference,
                    breadcrumbs: this.breadcrumbs
                });
                if (resolved?.properties != null) {
                    for (const [key, propSchema] of Object.entries(resolved.properties)) {
                        if (!this.context.isReferenceObject(propSchema) && resolvedParentProperties[key] == null) {
                            resolvedParentProperties[key] = propSchema;
                        }
                    }
                }
            }
        }

        for (const [index, allOfSchemaOrReference] of (this.schema.allOf ?? []).entries()) {
            const breadcrumbs = [...this.breadcrumbs, "allOf", index.toString()];
            let allOfSchema: OpenAPIV3_1.SchemaObject;
            let isInlineAllOf = false;
            if (this.context.isReferenceObject(allOfSchemaOrReference)) {
                const maybeResolvedReference = this.context.resolveMaybeReference<OpenAPIV3_1.SchemaObject>({
                    schemaOrReference: allOfSchemaOrReference,
                    breadcrumbs
                });
                if (maybeResolvedReference == null) {
                    this.context.logger.debug?.(
                        `[ObjectSchemaConverter] allOf[${index}] reference could not be resolved. Skipping: ${JSON.stringify(allOfSchemaOrReference)}`
                    );
                    continue;
                }
                allOfSchema = maybeResolvedReference;

                // Check for additionalProperties before this is passed by for not having req. properties
                if (typeof allOfSchema.additionalProperties === "boolean" && allOfSchema.additionalProperties) {
                    hasAdditionalProperties = true;
                }

                // if the allOf schema has no properties that are required in the base schema, add the reference to the extends_
                if (
                    !objectHasRequiredProperties ||
                    Object.keys(allOfSchema.properties ?? {}).every((key) => !this.schema.required?.includes(key))
                ) {
                    this.addTypeReferenceToExtends({
                        reference: allOfSchemaOrReference,
                        breadcrumbs,
                        extends_,
                        referencedTypes
                    });
                    continue;
                }
            } else {
                allOfSchema = allOfSchemaOrReference;
                isInlineAllOf = true;
            }

            if (typeof allOfSchema.additionalProperties === "boolean" && allOfSchema.additionalProperties) {
                hasAdditionalProperties = true;
            }

            // Handle bare oneOf/anyOf elements used for mutual exclusion patterns
            // (e.g., oneOf with variants containing `not: {}` properties).
            // Extract properties from each variant as optional properties on the parent object.
            const variants = allOfSchema.oneOf ?? allOfSchema.anyOf;
            if (variants != null && allOfSchema.type == null && allOfSchema.properties == null) {
                const seenKeys = new Set(properties.map((p) => getWireValue(p.name)));
                for (const [variantIndex, variantSchemaOrRef] of variants.entries()) {
                    const variantBreadcrumbs = [
                        ...breadcrumbs,
                        allOfSchema.oneOf != null ? "oneOf" : "anyOf",
                        variantIndex.toString()
                    ];
                    const variantSchema = this.context.isReferenceObject(variantSchemaOrRef)
                        ? this.context.resolveMaybeReference<OpenAPIV3_1.SchemaObject>({
                              schemaOrReference: variantSchemaOrRef,
                              breadcrumbs: variantBreadcrumbs
                          })
                        : variantSchemaOrRef;
                    if (variantSchema == null) {
                        continue;
                    }

                    // Filter out properties with `not: {}` schema (meaning "property must not exist")
                    const filteredProperties: Record<string, OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject> =
                        {};
                    for (const [key, propertySchema] of Object.entries(variantSchema.properties ?? {})) {
                        if (!this.context.isReferenceObject(propertySchema) && "not" in propertySchema) {
                            continue;
                        }
                        filteredProperties[key] = propertySchema;
                    }

                    // All properties from oneOf/anyOf variants are optional on the parent object
                    // since only one variant's properties are present at a time
                    const filteredKeys = Object.keys(filteredProperties).filter((key) => !seenKeys.has(key));
                    if (filteredKeys.length === 0) {
                        continue;
                    }

                    const filteredPropertiesForConvert: Record<
                        string,
                        OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject
                    > = {};
                    for (const key of filteredKeys) {
                        const prop = filteredProperties[key];
                        if (prop != null) {
                            filteredPropertiesForConvert[key] = prop;
                            seenKeys.add(key);
                        }
                    }

                    const {
                        convertedProperties: variantProperties,
                        inlinedTypesFromProperties: inlinedTypesFromVariant,
                        referencedTypes: variantReferencedTypes,
                        propertiesByAudience: variantPropertiesByAudience
                    } = convertProperties({
                        properties: filteredPropertiesForConvert,
                        required: [], // All variant properties are optional on the parent
                        breadcrumbs: variantBreadcrumbs,
                        context: this.context,
                        errorCollector: this.context.errorCollector
                    });

                    properties.push(...variantProperties);
                    inlinedTypes = { ...inlinedTypes, ...inlinedTypesFromVariant };
                    propertiesByAudience = { ...propertiesByAudience, ...variantPropertiesByAudience };
                    variantReferencedTypes.forEach((typeId) => {
                        referencedTypes.add(typeId);
                    });
                }
                continue;
            }

            // Merge base property schemas from referenced allOf parents into inline
            // override properties. This handles cases like allOf narrowing array items
            // without redeclaring type: array — the base schema's type/structure is
            // carried forward so the property is correctly recognized.
            // Only apply to inline allOf elements — resolved references that fell through
            // the extends_ check already have their own complete property schemas.
            let mergedProperties: Record<string, OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject> =
                allOfSchema.properties ?? {};
            if (isInlineAllOf) {
                mergedProperties = {};
                for (const [key, propSchema] of Object.entries(allOfSchema.properties ?? {})) {
                    const parentProp = resolvedParentProperties[key];
                    if (parentProp != null && !this.context.isReferenceObject(propSchema)) {
                        mergedProperties[key] = { ...parentProp, ...propSchema };
                    } else {
                        mergedProperties[key] = propSchema;
                    }
                }
            }

            const {
                convertedProperties: allOfProperties,
                inlinedTypesFromProperties: inlinedTypesFromAllOf,
                referencedTypes: allOfReferencedTypes,
                propertiesByAudience: allOfPropertiesByAudience
            } = convertProperties({
                properties: mergedProperties,
                required: [...(this.schema.required ?? []), ...(allOfSchema.required ?? [])],
                breadcrumbs,
                context: this.context,
                errorCollector: this.context.errorCollector
            });

            properties.push(...allOfProperties);
            inlinedTypes = { ...inlinedTypes, ...inlinedTypesFromAllOf };
            propertiesByAudience = { ...propertiesByAudience, ...allOfPropertiesByAudience };
            allOfReferencedTypes.forEach((typeId) => {
                referencedTypes.add(typeId);
            });
        }
        for (const typeId of Object.keys(inlinedTypes)) {
            referencedTypes.add(typeId);
        }

        return {
            type: Type.object({
                properties,
                extends: extends_.map((ext) => this.context.typeReferenceToDeclaredTypeName(ext)).filter(isNonNullish),
                extendedProperties: [],
                extraProperties: hasAdditionalProperties
            }),
            propertiesByAudience,
            referencedTypes,
            inlinedTypes
        };
    }

    private addTypeReferenceToExtends({
        reference,
        breadcrumbs,
        extends_,
        referencedTypes
    }: {
        reference: OpenAPIV3_1.ReferenceObject;
        breadcrumbs: string[];
        extends_: TypeReference[];
        referencedTypes: Set<string>;
    }) {
        const maybeTypeReference = this.context.convertReferenceToTypeReference({
            reference,
            breadcrumbs
        });
        if (maybeTypeReference.ok) {
            extends_.push(maybeTypeReference.reference);
        }
        const typeId = this.context.getTypeIdFromSchemaReference(reference);
        if (typeId != null) {
            referencedTypes.add(typeId);
        }
    }
}
