import { OpenAPIV3_1 } from "openapi-types";

import { ContainerType, TypeDeclaration, TypeReference } from "@fern-api/ir-sdk";

import { AbstractConverter } from "../../AbstractConverter";
import { ErrorCollector } from "../../ErrorCollector";
import { OpenAPIConverterContext3_1 } from "../OpenAPIConverterContext3_1";
import { SchemaConverter } from "./SchemaConverter";

export declare namespace SchemaOrReferenceConverter {
    export interface Args extends AbstractConverter.Args {
        schemaOrReference: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject;
        schemaIdOverride?: string;
        wrapAsOptional?: boolean;
    }

    export interface Output {
        type: TypeReference;
        schema?: TypeDeclaration;
        inlinedTypes: Record<string, TypeDeclaration>;
    }
}

export class SchemaOrReferenceConverter extends AbstractConverter<
    OpenAPIConverterContext3_1,
    SchemaOrReferenceConverter.Output | undefined
> {
    private readonly schemaOrReference: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject;
    private readonly schemaIdOverride: string | undefined;
    private readonly wrapAsOptional: boolean;

    constructor({
        breadcrumbs,
        schemaOrReference,
        schemaIdOverride,
        wrapAsOptional = false
    }: SchemaOrReferenceConverter.Args) {
        super({ breadcrumbs });
        this.schemaOrReference = schemaOrReference;
        this.schemaIdOverride = schemaIdOverride;
        this.wrapAsOptional = wrapAsOptional;
    }

    public convert({
        context,
        errorCollector
    }: {
        context: OpenAPIConverterContext3_1;
        errorCollector: ErrorCollector;
    }): SchemaOrReferenceConverter.Output | undefined {
        if (context.isReferenceObject(this.schemaOrReference)) {
            const response = context.convertReferenceToTypeReference(this.schemaOrReference);
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
        const convertedSchema = schemaConverter.convert({ context, errorCollector });

        if (convertedSchema != null) {
            if (convertedSchema.typeDeclaration.shape.type === "alias") {
                const type = convertedSchema.typeDeclaration.shape.aliasOf;
                return {
                    type: this.wrapAsOptional ? this.wrapInOptional(type) : type,
                    inlinedTypes: convertedSchema.inlinedTypes
                };
            }
            const type = context.createNamedTypeReference(schemaId);
            return {
                type: this.wrapAsOptional ? this.wrapInOptional(type) : type,
                schema: convertedSchema.typeDeclaration,
                inlinedTypes: {
                    ...convertedSchema.inlinedTypes,
                    [schemaId]: convertedSchema.typeDeclaration
                }
            };
        }

        return undefined;
    }

    private wrapInOptional(type: TypeReference): TypeReference {
        return TypeReference.container(ContainerType.optional(type));
    }
}
