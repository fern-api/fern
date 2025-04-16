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
            return this.convertReferenceObject({ context, errorCollector, reference: this.schemaOrReference });
        }
        return this.convertSchemaObject({ context, errorCollector, schema: this.schemaOrReference });
    }

    private async convertReferenceObject({
        reference,
        context,
        errorCollector
    }: {
        reference: OpenAPIV3_1.ReferenceObject;
        context: AbstractConverterContext<object>;
        errorCollector: ErrorCollector;
    }): Promise<SchemaOrReferenceConverter.Output | undefined> {
        const response = await context.convertReferenceToTypeReference(reference);
        if (!response.ok) {
            errorCollector.collect({
                message: `Failed to convert reference to type reference: ${reference.$ref}`,
                path: this.breadcrumbs
            });
            return undefined;
        }
        return {
            type: this.wrapTypeReference(response.reference),
            inlinedTypes: {}
        };
    }

    private async convertSchemaObject({
        context,
        errorCollector,
        schema
    }: {
        context: AbstractConverterContext<object>;
        errorCollector: ErrorCollector;
        schema: OpenAPIV3_1.SchemaObject;
    }): Promise<SchemaOrReferenceConverter.Output | undefined> {
        const schemaId = this.schemaIdOverride ?? context.convertBreadcrumbsToName(this.breadcrumbs);
        const schemaConverter = new SchemaConverter({
            breadcrumbs: this.breadcrumbs,
            schema,
            id: schemaId
        });
        const availability = await context.getAvailability({
            node: schema,
            breadcrumbs: this.breadcrumbs,
            errorCollector
        });
        const convertedSchema = await schemaConverter.convert({ context, errorCollector });
        if (convertedSchema != null) {
            const convertedSchemaShape = convertedSchema.typeDeclaration.shape;
            if (convertedSchemaShape.type === "alias") {
                return {
                    type: this.wrapTypeReference(convertedSchemaShape.aliasOf),
                    schema: convertedSchema.typeDeclaration,
                    inlinedTypes: convertedSchema.inlinedTypes,
                    availability
                };
            }
            return {
                type: this.wrapTypeReference(context.createNamedTypeReference(schemaId)),
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
