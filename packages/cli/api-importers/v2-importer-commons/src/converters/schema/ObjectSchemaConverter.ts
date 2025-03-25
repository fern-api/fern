import { OpenAPIV3_1 } from "openapi-types";

import { isNonNullish } from "@fern-api/core-utils";
import { ObjectProperty, Type, TypeDeclaration, TypeId, TypeReference } from "@fern-api/ir-sdk";

import { AbstractConverter, AbstractConverterContext, ErrorCollector } from "../..";
import { SchemaOrReferenceConverter } from "./SchemaOrReferenceConverter";

export declare namespace ObjectSchemaConverter {
    export interface Args extends AbstractConverter.Args {
        schema: OpenAPIV3_1.SchemaObject;
        inlinedTypes: Record<TypeId, TypeDeclaration>;
    }

    export interface Output {
        object: Type;
        inlinedTypes?: Record<TypeId, TypeDeclaration>;
    }
}

export class ObjectSchemaConverter extends AbstractConverter<
    AbstractConverterContext<object>,
    ObjectSchemaConverter.Output
> {
    private readonly schema: OpenAPIV3_1.SchemaObject;

    constructor({ breadcrumbs, schema }: ObjectSchemaConverter.Args) {
        super({ breadcrumbs });
        this.schema = schema;
    }

    public async convert({
        context,
        errorCollector
    }: {
        context: AbstractConverterContext<object>;
        errorCollector: ErrorCollector;
    }): Promise<ObjectSchemaConverter.Output | undefined> {
        // TODO (eden): Refine this logic to handle more complex cases
        if (!this.schema.properties && !this.schema.allOf) {
            return {
                object: Type.object({
                    properties: [],
                    extends: [],
                    extendedProperties: [],
                    extraProperties: this.schema.additionalProperties != null
                })
            };
        }

        const properties: ObjectProperty[] = [];
        let inlinedTypes: Record<TypeId, TypeDeclaration> = {};

        for (const [propertyName, propertySchema] of Object.entries(this.schema.properties ?? {})) {
            const propertyBreadcrumbs = [...this.breadcrumbs, "properties", propertyName];
            const isNullable = "nullable" in propertySchema ? (propertySchema.nullable as boolean) : false;

            const propertyId = context.convertBreadcrumbsToName(propertyBreadcrumbs);
            const propertySchemaConverter = new SchemaOrReferenceConverter({
                breadcrumbs: propertyBreadcrumbs,
                schemaOrReference: propertySchema,
                schemaIdOverride: propertyId,
                wrapAsOptional: !this.schema.required?.includes(propertyName),
                wrapAsNullable: isNullable
            });
            const convertedProperty = await propertySchemaConverter.convert({ context, errorCollector });
            if (convertedProperty != null) {
                properties.push({
                    name: context.casingsGenerator.generateNameAndWireValue({
                        name: propertyName,
                        wireValue: propertyName
                    }),
                    valueType: convertedProperty.type,
                    docs: propertySchema.description,
                    availability: convertedProperty.availability,
                    propertyAccess: await context.getPropertyAccess(propertySchema)
                });
                inlinedTypes = {
                    ...inlinedTypes,
                    ...convertedProperty.inlinedTypes
                };
            }
        }

        const extends_: TypeReference[] = [];

        for (const [index, allOfSchema] of (this.schema.allOf ?? []).entries()) {
            const subBreadcrumbs = [...this.breadcrumbs, "allOf", index.toString()];

            // if allOf is a schema reference, add to extends
            if (context.isReferenceObject(allOfSchema)) {
                const maybeTypeReference = await context.convertReferenceToTypeReference(allOfSchema);
                if (maybeTypeReference.ok) {
                    extends_.push(maybeTypeReference.reference);
                }
                continue;
            }

            // if allOf schema is inlined and has properties, add them to the object properties
            for (const [propertyName, propertySchema] of Object.entries(allOfSchema.properties ?? {})) {
                const propertyBreadcrumbs = [...subBreadcrumbs, propertyName];

                const propertySchemaId = context.convertBreadcrumbsToName(propertyBreadcrumbs);
                const propertySchemaConverter = new SchemaOrReferenceConverter({
                    breadcrumbs: propertyBreadcrumbs,
                    schemaOrReference: propertySchema,
                    schemaIdOverride: propertySchemaId,
                    wrapAsOptional: !allOfSchema.required?.includes(propertyName),
                    wrapAsNullable: "nullable" in propertySchema ? (propertySchema.nullable as boolean) : false
                });
                const convertedProperty = await propertySchemaConverter.convert({ context, errorCollector });
                if (convertedProperty != null) {
                    properties.push({
                        name: context.casingsGenerator.generateNameAndWireValue({
                            name: propertyName,
                            wireValue: propertyName
                        }),
                        valueType: convertedProperty.type,
                        docs: propertySchema.description,
                        availability: convertedProperty.availability,
                        propertyAccess: await context.getPropertyAccess(propertySchema)
                    });
                    inlinedTypes = {
                        ...inlinedTypes,
                        ...convertedProperty.inlinedTypes
                    };
                }
            }
        }

        return {
            object: Type.object({
                properties,
                extends: extends_.map((ext) => context.typeReferenceToDeclaredTypeName(ext)).filter(isNonNullish),
                extendedProperties: [],
                extraProperties: this.schema.additionalProperties != null
            }),
            inlinedTypes
        };
    }
}
