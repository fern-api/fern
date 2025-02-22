import { ContainerType, TypeDeclaration, TypeId, TypeReference } from "@fern-api/ir-sdk";
import { OpenAPIV3_1 } from "openapi-types";
import { AbstractConverter } from "../../AbstractConverter";
import { ErrorCollector } from "../../ErrorCollector";
import { OpenAPIConverterContext3_1 } from "../OpenAPIConverterContext3_1";
import { SchemaConverter } from "./SchemaConverter";

export declare namespace ArraySchemaConverter {
    export interface Args extends AbstractConverter.Args {
        schema: OpenAPIV3_1.ArraySchemaObject;
        inlinedTypes: Record<TypeId, TypeDeclaration>;
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

    public convert({
        context,
        errorCollector
    }: {
        context: OpenAPIConverterContext3_1;
        errorCollector: ErrorCollector;
    }): ArraySchemaConverter.Output | undefined {
        if (this.schema.items == null) {
            return { typeReference: ArraySchemaConverter.LIST_UNKNOWN }
        }

        // if itmes is a reference
        if (context.isReferenceObject(this.schema.items)) {
            const maybeTypeReference = context.convertReferenceToTypeReference(this.schema.items);
            if (maybeTypeReference.ok) {
                return {
                    typeReference: TypeReference.container(ContainerType.list(maybeTypeReference.reference)),
                }
            }
            return { typeReference: ArraySchemaConverter.LIST_UNKNOWN }
        } 

        // if items is a inlined schema
        const itemsBreadcrumbs = [...this.breadcrumbs, "items"];
        const schemaId = context.convertBreadcrumbsToName(itemsBreadcrumbs);
        const itemSchemaConverter = new SchemaConverter({
            id: schemaId,
            breadcrumbs: itemsBreadcrumbs,
            schema: this.schema.items,
        });
        const itemSchema = itemSchemaConverter.convert({ context, errorCollector });
        if (itemSchema != null) {
            return {
                typeReference: TypeReference.container(ContainerType.list(context.createNamedTypeReference(schemaId))),
                inlinedTypes: {
                    ...itemSchema.inlinedTypes,
                    schemaId: itemSchema.typeDeclaration,
                }
            }
        }

        // fallback
        return { typeReference: ArraySchemaConverter.LIST_UNKNOWN }
    }
}
