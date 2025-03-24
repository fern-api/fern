import { OpenAPIV3_1 } from "openapi-types";

import { Availability, ContainerType, TypeDeclaration, TypeReference } from "@fern-api/ir-sdk";

import { AbstractConverter, AbstractConverterContext, ErrorCollector } from "../..";
import { SchemaConverter } from "./SchemaConverter";

export declare namespace SchemaOrReferenceConverter {
    export interface Args extends AbstractConverter.Args {
        schemaOrReference: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject;
        schemaIdOverride?: string;
        wrapAsOptional?: boolean;
        wrapAsNullable?: boolean;
    }

    export interface Output {
        type: TypeReference;
        schema?: TypeDeclaration;
        inlinedTypes: Record<string, TypeDeclaration>;
        availability?: Availability;
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
        breadcrumbs,
        schemaOrReference,
        schemaIdOverride,
        wrapAsOptional = false,
        wrapAsNullable = false
    }: SchemaOrReferenceConverter.Args) {
        super({ breadcrumbs });
        this.schemaOrReference = schemaOrReference;
        this.schemaIdOverride = schemaIdOverride;
        this.wrapAsOptional = wrapAsOptional;
        this.wrapAsNullable = wrapAsNullable;
    }

    public async convert({
        context,
        errorCollector
    }: {
        context: AbstractConverterContext<object>;
        errorCollector: ErrorCollector;
    }): Promise<SchemaOrReferenceConverter.Output | undefined> {
        if (context.isReferenceObject(this.schemaOrReference)) {
            const response = await context.convertReferenceToTypeReference(this.schemaOrReference);
            if (!response.ok) {
                return undefined;
            }
            return { type: response.reference, inlinedTypes: {} };
        }

        const schemaId = this.schemaIdOverride ?? context.convertBreadcrumbsToName(this.breadcrumbs);
        const schemaConverter = new SchemaConverter({
            breadcrumbs: this.breadcrumbs,
            schema: this.schemaOrReference,
            id: schemaId
        });
        const availability = await context.getAvailability({
            node: this.schemaOrReference,
            breadcrumbs: this.breadcrumbs,
            errorCollector
        });
        const convertedSchema = await schemaConverter.convert({ context, errorCollector });

        if (convertedSchema != null) {
            if (convertedSchema.typeDeclaration.shape.type === "alias") {
                const type = convertedSchema.typeDeclaration.shape.aliasOf;
                return {
                    type: this.wrapTypeReference(type),
                    inlinedTypes: convertedSchema.inlinedTypes,
                    availability
                };
            }
            const type = context.createNamedTypeReference(schemaId);
            return {
                type: this.wrapTypeReference(type),
                schema: convertedSchema.typeDeclaration,
                inlinedTypes: {
                    ...convertedSchema.inlinedTypes,
                    [schemaId]: convertedSchema.typeDeclaration
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
