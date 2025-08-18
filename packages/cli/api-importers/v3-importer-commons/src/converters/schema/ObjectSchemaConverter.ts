import { isNonNullish } from "@fern-api/core-utils";
import { Type, TypeId, TypeReference } from "@fern-api/ir-sdk";
import { OpenAPIV3_1 } from "openapi-types";

import { AbstractConverter, AbstractConverterContext } from "../..";
import { convertProperties } from "../../utils/ConvertProperties";
import { SchemaConverter } from "./SchemaConverter";

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
        for (const [index, allOfSchemaOrReference] of (this.schema.allOf ?? []).entries()) {
            const breadcrumbs = [...this.breadcrumbs, "allOf", index.toString()];
            let allOfSchema: OpenAPIV3_1.SchemaObject;
            if (this.context.isReferenceObject(allOfSchemaOrReference)) {
                if (!objectHasRequiredProperties) {
                    this.addTypeReferenceToExtends({
                        reference: allOfSchemaOrReference,
                        breadcrumbs,
                        extends_,
                        referencedTypes
                    });
                    continue;
                }
                const maybeResolvedReference = this.context.resolveMaybeReference<OpenAPIV3_1.SchemaObject>({
                    schemaOrReference: allOfSchemaOrReference,
                    breadcrumbs
                });
                if (maybeResolvedReference == null) {
                    continue;
                }
                allOfSchema = maybeResolvedReference;
                if (Object.keys(allOfSchema.properties ?? {}).every((key) => !this.schema.required?.includes(key))) {
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
            }

            // Check for additionalProperties in this allOf schema
            if (typeof allOfSchema.additionalProperties === "boolean" && allOfSchema.additionalProperties) {
                hasAdditionalProperties = true;
            }

            const {
                convertedProperties: allOfProperties,
                inlinedTypesFromProperties: inlinedTypesFromAllOf,
                referencedTypes: allOfReferencedTypes,
                propertiesByAudience: allOfPropertiesByAudience
            } = convertProperties({
                properties: allOfSchema.properties ?? {},
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
