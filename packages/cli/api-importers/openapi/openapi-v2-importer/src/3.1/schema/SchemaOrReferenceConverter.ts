import { TypeDeclaration, TypeReference } from "@fern-api/ir-sdk";
import { OpenAPIV3_1 } from "openapi-types";
import { AbstractConverter } from "../../AbstractConverter";
import { ErrorCollector } from "../../ErrorCollector";
import { OpenAPIConverterContext3_1 } from "../OpenAPIConverterContext3_1";
import { SchemaConverter } from "./SchemaConverter";

export declare namespace SchemaOrReferenceConverter {
    export interface Args extends AbstractConverter.Args {
        schemaOrReference: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject;
        schemaIdOverride?: string;
    }

    export interface Output {
        type: TypeReference;
        schema?: TypeDeclaration;
        inlinedTypes: Record<string, TypeDeclaration>;
    }
}

export class SchemaOrReferenceConverter extends AbstractConverter<OpenAPIConverterContext3_1, SchemaOrReferenceConverter.Output | undefined> {
    private readonly schemaOrReference: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject;
    private readonly schemaIdOverride: string | undefined;

    constructor({ breadcrumbs, schemaOrReference, schemaIdOverride }: SchemaOrReferenceConverter.Args) {
        super({ breadcrumbs });
        this.schemaOrReference = schemaOrReference;
        this.schemaIdOverride = schemaIdOverride;
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
            return  { type: response.reference, inlinedTypes: {} };
        }

        const schemaId = this.schemaIdOverride ?? context.convertBreadcrumbsToName(this.breadcrumbs);
        const schemaConverter = new SchemaConverter({
            breadcrumbs: this.breadcrumbs,
            schema: this.schemaOrReference,
            id: schemaId,
        });
        const convertedSchema = schemaConverter.convert({ context, errorCollector });
        if (convertedSchema != null) {
            return {
                type: context.createNamedTypeReference(this.breadcrumbs.join("_")),
                schema: convertedSchema.typeDeclaration,
                inlinedTypes: {
                    ...convertedSchema.inlinedTypes,
                }
            };
        }
        
        return undefined;
    }
}
