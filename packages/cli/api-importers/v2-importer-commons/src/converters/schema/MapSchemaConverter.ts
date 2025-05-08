import { OpenAPIV3_1 } from "openapi-types";

import { ContainerType, Type, TypeDeclaration, TypeId, TypeReference } from "@fern-api/ir-sdk";

import { AbstractConverter, AbstractConverterContext } from "../..";
import { SchemaOrReferenceConverter } from "./SchemaOrReferenceConverter";

export declare namespace MapSchemaConverter {
    export interface Args extends AbstractConverter.AbstractArgs {
        schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject;
    }

    export interface Output {
        type: Type;
        inlinedTypes: Record<TypeId, TypeDeclaration>;
    }
}

export class MapSchemaConverter extends AbstractConverter<AbstractConverterContext<object>, MapSchemaConverter.Output> {
    private readonly schema: OpenAPIV3_1.SchemaObject;

    constructor({ context, breadcrumbs, schema }: MapSchemaConverter.Args) {
        super({ context, breadcrumbs });
        this.schema = schema;
    }

    public async convert(): Promise<MapSchemaConverter.Output | undefined> {
        const additionalPropertiesSchemaConverter = new SchemaOrReferenceConverter({
            context: this.context,
            breadcrumbs: this.breadcrumbs,
            schemaOrReference: this.schema
        });
        const convertedAdditionalProperties = await additionalPropertiesSchemaConverter.convert();
        if (convertedAdditionalProperties != null) {
            const additionalPropertiesType = TypeReference.container(
                ContainerType.map({
                    keyType: AbstractConverter.STRING,
                    valueType: convertedAdditionalProperties.type
                })
            );
            return {
                type: Type.alias({
                    aliasOf: additionalPropertiesType,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolvedType: additionalPropertiesType as any
                }),
                inlinedTypes: convertedAdditionalProperties.inlinedTypes
            };
        }
        return undefined;
    }
}
