import { OpenAPIV3_1 } from "openapi-types";

import { ContainerType, TypeDeclaration, TypeId, TypeReference } from "@fern-api/ir-sdk";

import { AbstractConverter } from "../../AbstractConverter";
import { ErrorCollector } from "../../ErrorCollector";
import { OpenAPIConverterContext3_1 } from "../OpenAPIConverterContext3_1";
import { SchemaOrReferenceConverter } from "./SchemaOrReferenceConverter";

export declare namespace ArraySchemaConverter {
    export interface Args extends AbstractConverter.Args {
        schema: OpenAPIV3_1.ArraySchemaObject;
    }

    export interface Output {
        typeReference: TypeReference;
        inlinedTypes?: Record<TypeId, TypeDeclaration>;
    }
}

export class ArraySchemaConverter extends AbstractConverter<OpenAPIConverterContext3_1, ArraySchemaConverter.Output> {
    private static LIST_UNKNOWN = TypeReference.container(ContainerType.list(TypeReference.unknown()));

    private readonly schema: OpenAPIV3_1.ArraySchemaObject;

    constructor({ breadcrumbs, schema }: ArraySchemaConverter.Args) {
        super({ breadcrumbs });
        this.schema = schema;
    }

    public async convert({
        context,
        errorCollector
    }: {
        context: OpenAPIConverterContext3_1;
        errorCollector: ErrorCollector;
    }): Promise<ArraySchemaConverter.Output | undefined> {
        if (this.schema.items == null) {
            return { typeReference: ArraySchemaConverter.LIST_UNKNOWN };
        }

        const schemaOrReferenceConverter = new SchemaOrReferenceConverter({
            breadcrumbs: [...this.breadcrumbs, "items"],
            schemaOrReference: this.schema.items
        });

        const convertedSchema = await schemaOrReferenceConverter.convert({ context, errorCollector });
        if (convertedSchema != null) {
            return {
                typeReference: TypeReference.container(ContainerType.list(convertedSchema.type)),
                inlinedTypes: convertedSchema.inlinedTypes
            };
        }

        // fallback
        return { typeReference: ArraySchemaConverter.LIST_UNKNOWN };
    }
}
