import { ContainerType, Type, TypeId, TypeReference } from "@fern-api/ir-sdk";
import { OpenAPIV3_1 } from "openapi-types";

import { AbstractConverter, AbstractConverterContext } from "../..";
import { SchemaConverter } from "./SchemaConverter";
import { SchemaOrReferenceConverter } from "./SchemaOrReferenceConverter";

export declare namespace MapSchemaConverter {
    export interface Args extends AbstractConverter.AbstractArgs {
        schemaOrReferenceOrBoolean: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject | boolean;
    }

    export interface Output {
        type: Type;
        referencedTypes: Set<string>;
        inlinedTypes: Record<TypeId, SchemaConverter.ConvertedSchema>;
    }
}

export class MapSchemaConverter extends AbstractConverter<AbstractConverterContext<object>, MapSchemaConverter.Output> {
    private readonly schemaOrReferenceOrBoolean: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject | boolean;

    constructor({ context, breadcrumbs, schemaOrReferenceOrBoolean }: MapSchemaConverter.Args) {
        super({ context, breadcrumbs });
        this.schemaOrReferenceOrBoolean = schemaOrReferenceOrBoolean;
    }
    public convert(): MapSchemaConverter.Output | undefined {
        const maybeUnknownMap = this.tryConvertUnknownMap();
        if (maybeUnknownMap != null) {
            return maybeUnknownMap;
        }

        const maybeTypedMap = this.tryConvertTypedMap();
        if (maybeTypedMap != null) {
            return maybeTypedMap;
        }

        return undefined;
    }

    private tryConvertUnknownMap(): MapSchemaConverter.Output | undefined {
        if (typeof this.schemaOrReferenceOrBoolean === "boolean") {
            const additionalPropertiesType = TypeReference.container(
                ContainerType.map({
                    keyType: AbstractConverter.STRING,
                    valueType: TypeReference.unknown()
                })
            );
            return {
                type: Type.alias({
                    aliasOf: additionalPropertiesType,
                    // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
                    resolvedType: additionalPropertiesType as any
                }),
                referencedTypes: new Set(),
                inlinedTypes: {}
            };
        }
        return undefined;
    }

    private tryConvertTypedMap(): MapSchemaConverter.Output | undefined {
        if (typeof this.schemaOrReferenceOrBoolean === "boolean") {
            return undefined;
        }

        const additionalPropertiesSchemaConverter = new SchemaOrReferenceConverter({
            context: this.context,
            breadcrumbs: this.breadcrumbs,
            schemaOrReference: this.schemaOrReferenceOrBoolean
        });
        const convertedAdditionalProperties = additionalPropertiesSchemaConverter.convert();
        if (convertedAdditionalProperties != null) {
            const additionalPropertiesType = TypeReference.container(
                ContainerType.map({
                    keyType: AbstractConverter.STRING,
                    valueType: convertedAdditionalProperties.type
                })
            );
            const referencedTypes = new Set<string>();
            for (const type of convertedAdditionalProperties.schema?.typeDeclaration.referencedTypes ?? []) {
                referencedTypes.add(type);
            }
            for (const typeId of Object.keys(convertedAdditionalProperties.inlinedTypes)) {
                referencedTypes.add(typeId);
            }

            return {
                type: Type.alias({
                    aliasOf: additionalPropertiesType,
                    // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
                    resolvedType: additionalPropertiesType as any
                }),
                referencedTypes,
                inlinedTypes: convertedAdditionalProperties.inlinedTypes
            };
        }
        return undefined;
    }
}
