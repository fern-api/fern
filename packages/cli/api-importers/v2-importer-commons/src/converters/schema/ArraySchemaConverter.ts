import { OpenAPIV3_1 } from "openapi-types";

import { ContainerType, TypeId, TypeReference } from "@fern-api/ir-sdk";

import { AbstractConverter, AbstractConverterContext } from "../..";
import { SchemaConverter } from "./SchemaConverter";
import { SchemaOrReferenceConverter } from "./SchemaOrReferenceConverter";

export declare namespace ArraySchemaConverter {
    export interface Args extends AbstractConverter.AbstractArgs {
        schema: OpenAPIV3_1.ArraySchemaObject;
    }

    export interface Output {
        typeReference: TypeReference;
        referencedTypes: Set<string>;
        inlinedTypes: Record<TypeId, SchemaConverter.ConvertedSchema>;
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

    public convert(): ArraySchemaConverter.Output | undefined {
        if (this.schema.items != null) {
            if (Array.isArray(this.schema.items)) {
                this.schema.items = {
                    oneOf: this.schema.items
                };
            }
            const schemaOrReferenceConverter = new SchemaOrReferenceConverter({
                context: this.context,
                breadcrumbs: [...this.breadcrumbs, "items"],
                schemaOrReference: this.schema.items
            });

            const convertedSchema = schemaOrReferenceConverter.convert();
            if (convertedSchema != null) {
                const referencedTypes = new Set<string>();
                for (const type of convertedSchema.schema?.typeDeclaration.referencedTypes ?? []) {
                    referencedTypes.add(type);
                }
                if (convertedSchema.inlinedTypes != null) {
                    Object.values(convertedSchema.inlinedTypes).forEach((type) => {
                        type.typeDeclaration.referencedTypes.forEach((type) => {
                            referencedTypes.add(type);
                        });
                    });
                }
                return {
                    typeReference: TypeReference.container(ContainerType.list(convertedSchema.type)),
                    referencedTypes,
                    inlinedTypes: convertedSchema.inlinedTypes
                };
            }
        }

        return { typeReference: ArraySchemaConverter.LIST_UNKNOWN, referencedTypes: new Set(), inlinedTypes: {} };
    }
}
