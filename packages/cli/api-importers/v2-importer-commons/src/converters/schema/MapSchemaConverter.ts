import { OpenAPIV3_1 } from "openapi-types";

import { isNonNullish } from "@fern-api/core-utils";
import {
    ContainerType,
    ObjectProperty,
    PrimitiveTypeV2,
    Type,
    TypeDeclaration,
    TypeId,
    TypeReference
} from "@fern-api/ir-sdk";

import { AbstractConverter, AbstractConverterContext, ErrorCollector } from "../..";
import { SchemaOrReferenceConverter } from "./SchemaOrReferenceConverter";

export declare namespace MapSchemaConverter {
    export interface Args extends AbstractConverter.Args {
        schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject;
        inlinedTypes: Record<TypeId, TypeDeclaration>;
    }

    export interface Output {
        type: Type;
        inlinedTypes?: Record<TypeId, TypeDeclaration>;
    }
}

const STRING = TypeReference.primitive({
    v1: "STRING",
    v2: PrimitiveTypeV2.string({
        default: undefined,
        validation: undefined
    })
});

export class MapSchemaConverter extends AbstractConverter<AbstractConverterContext<object>, MapSchemaConverter.Output> {
    private readonly schema: OpenAPIV3_1.SchemaObject;

    constructor({ breadcrumbs, schema }: MapSchemaConverter.Args) {
        super({ breadcrumbs });
        this.schema = schema;
    }

    public async convert({
        context,
        errorCollector
    }: {
        context: AbstractConverterContext<object>;
        errorCollector: ErrorCollector;
    }): Promise<MapSchemaConverter.Output | undefined> {
        const additionalPropertiesSchemaConverter = new SchemaOrReferenceConverter({
            breadcrumbs: this.breadcrumbs,
            schemaOrReference: this.schema
        });
        const convertedAdditionalProperties = await additionalPropertiesSchemaConverter.convert({
            context,
            errorCollector
        });
        if (convertedAdditionalProperties != null) {
            const additionalPropertiesType = TypeReference.container(
                ContainerType.map({
                    keyType: STRING,
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
