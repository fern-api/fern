import { Availability, ContainerType, TypeReference } from "@fern-api/ir-sdk";
import { OpenAPIV3_1 } from "openapi-types";

import { AbstractConverter, AbstractConverterContext } from "../..";
import { SchemaConverter } from "./SchemaConverter";

export declare namespace SchemaOrReferenceConverter {
    export interface Args extends AbstractConverter.AbstractArgs {
        schemaOrReference: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject;
        schemaIdOverride?: string;
        wrapAsOptional?: boolean;
        wrapAsNullable?: boolean;
    }

    export interface Output {
        type: TypeReference;
        schema?: SchemaConverter.ConvertedSchema;
        inlinedTypes: Record<string, SchemaConverter.ConvertedSchema>;
        availability?: Availability;
        encoding?: {
            [media: string]: OpenAPIV3_1.EncodingObject;
        };
    }
}

export class SchemaOrReferenceConverter extends AbstractConverter<
    AbstractConverterContext<object>,
    SchemaOrReferenceConverter.Output | undefined
> {
    private readonly schemaOrReference: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject;
    private readonly schemaIdOverride: string | undefined;
    private readonly wrapAsOptional: boolean;
    private readonly wrapAsNullable: boolean;

    constructor({
        context,
        breadcrumbs,
        schemaOrReference,
        schemaIdOverride,
        wrapAsOptional = false,
        wrapAsNullable = false
    }: SchemaOrReferenceConverter.Args) {
        super({ context, breadcrumbs });
        this.schemaOrReference = schemaOrReference;
        this.schemaIdOverride = schemaIdOverride;
        this.wrapAsOptional = wrapAsOptional;
        this.wrapAsNullable = wrapAsNullable;
    }

    public convert(): SchemaOrReferenceConverter.Output | undefined {
        const maybeConvertedReferenceObject = this.maybeConvertReferenceObject({
            schemaOrReference: this.schemaOrReference
        });
        if (maybeConvertedReferenceObject != null) {
            return maybeConvertedReferenceObject;
        }
        const maybeSingularAllOfReferenceOutput = this.maybeConvertSingularAllOfReferenceObject();
        if (maybeSingularAllOfReferenceOutput != null) {
            return maybeSingularAllOfReferenceOutput;
        }
        return this.convertSchemaObject({ schema: this.schemaOrReference });
    }

    private maybeConvertReferenceObject({
        schemaOrReference
    }: {
        schemaOrReference: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject;
    }): SchemaOrReferenceConverter.Output | undefined {
        if (this.context.isReferenceObject(schemaOrReference)) {
            const response = this.context.convertReferenceToTypeReference({
                reference: schemaOrReference,
                breadcrumbs: this.breadcrumbs
            });
            if (response.ok) {
                return {
                    type: this.wrapTypeReference(response.reference),
                    inlinedTypes: response.inlinedTypes ?? {}
                };
            }
        }
        return undefined;
    }

    private maybeConvertSingularAllOfReferenceObject(): SchemaOrReferenceConverter.Output | undefined {
        if (
            this.context.isReferenceObject(this.schemaOrReference) ||
            this.schemaOrReference.allOf == null ||
            this.schemaOrReference.allOf.length !== 1
        ) {
            return undefined;
        }
        const allOfReference = this.schemaOrReference.allOf[0];
        if (this.context.isReferenceObject(allOfReference)) {
            const response = this.context.convertReferenceToTypeReference({
                reference: allOfReference,
                breadcrumbs: this.breadcrumbs
            });
            if (response.ok) {
                return {
                    type: this.wrapTypeReference(response.reference),
                    inlinedTypes: {}
                };
            }
        }
        return undefined;
    }

    private convertSchemaObject({
        schema
    }: {
        schema: OpenAPIV3_1.SchemaObject;
    }): SchemaOrReferenceConverter.Output | undefined {
        const schemaId = this.schemaIdOverride ?? this.context.convertBreadcrumbsToName(this.breadcrumbs);
        const schemaConverter = new SchemaConverter({
            context: this.context,
            breadcrumbs: this.breadcrumbs,
            schema,
            id: schemaId
        });
        const availability = this.context.getAvailability({
            node: schema,
            breadcrumbs: this.breadcrumbs
        });
        const convertedSchema = schemaConverter.convert();
        if (convertedSchema != null) {
            const convertedSchemaShape = convertedSchema.convertedSchema.typeDeclaration.shape;
            if (convertedSchemaShape.type === "alias") {
                return {
                    type: this.wrapTypeReference(convertedSchemaShape.aliasOf),
                    schema: convertedSchema.convertedSchema,
                    inlinedTypes: convertedSchema.inlinedTypes,
                    availability
                };
            }
            return {
                type: this.wrapTypeReference(this.context.createNamedTypeReference(schemaId)),
                schema: convertedSchema.convertedSchema,
                inlinedTypes: {
                    ...convertedSchema.inlinedTypes,
                    [schemaId]: convertedSchema.convertedSchema
                },
                availability
            };
        }
        return undefined;
    }

    private wrapTypeReference(type: TypeReference): TypeReference {
        if (this.wrapAsOptional && this.wrapAsNullable) {
            return this.wrapInOptional(this.wrapInNullable(type));
        }
        if (this.wrapAsOptional) {
            return this.wrapInOptional(type);
        }
        if (this.wrapAsNullable) {
            return this.wrapInNullable(type);
        }
        return type;
    }

    private wrapInOptional(type: TypeReference): TypeReference {
        return TypeReference.container(ContainerType.optional(type));
    }

    private wrapInNullable(type: TypeReference): TypeReference {
        return TypeReference.container(ContainerType.nullable(type));
    }
}
