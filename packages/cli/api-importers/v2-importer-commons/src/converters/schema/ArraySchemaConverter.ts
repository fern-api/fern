import { OpenAPIV3_1 } from "openapi-types";

import { ContainerType, TypeDeclaration, TypeId, TypeReference } from "@fern-api/ir-sdk";

import { AbstractConverter, AbstractConverterContext } from "../..";
import { SchemaOrReferenceConverter } from "./SchemaOrReferenceConverter";

export declare namespace ArraySchemaConverter {
    export interface Args extends AbstractConverter.AbstractArgs {
        schema: OpenAPIV3_1.ArraySchemaObject;
    }

    export interface Output {
        typeReference: TypeReference;
        inlinedTypes: Record<TypeId, TypeDeclaration>;
    }
}

export class ArraySchemaConverter extends AbstractConverter<
    AbstractConverterContext<object>,
    ArraySchemaConverter.Output
> {
    private static LIST_UNKNOWN = TypeReference.container(ContainerType.list(TypeReference.unknown()));

    private readonly schema: OpenAPIV3_1.ArraySchemaObject;

    constructor({ context, breadcrumbs, schema }: ArraySchemaConverter.Args) {
        super({ context, breadcrumbs });
        this.schema = schema;
    }

    public async convert(): Promise<ArraySchemaConverter.Output | undefined> {
        if (this.schema.items == null) {
            return { typeReference: ArraySchemaConverter.LIST_UNKNOWN, inlinedTypes: {} };
        }

        const schemaOrReferenceConverter = new SchemaOrReferenceConverter({
            context: this.context,
            breadcrumbs: [...this.breadcrumbs, "items"],
            schemaOrReference: this.schema.items
        });

        const convertedSchema = await schemaOrReferenceConverter.convert();
        if (convertedSchema != null) {
            return {
                typeReference: TypeReference.container(ContainerType.list(convertedSchema.type)),
                inlinedTypes: convertedSchema.inlinedTypes
            };
        }

        // fallback
        return { typeReference: ArraySchemaConverter.LIST_UNKNOWN, inlinedTypes: {} };
    }
}
