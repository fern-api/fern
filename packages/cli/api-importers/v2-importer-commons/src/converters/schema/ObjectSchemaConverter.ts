import { OpenAPIV3_1 } from "openapi-types";

import { isNonNullish } from "@fern-api/core-utils";
import { Type, TypeDeclaration, TypeId, TypeReference } from "@fern-api/ir-sdk";

import { AbstractConverter, AbstractConverterContext, ErrorCollector } from "../..";
import { convertProperties } from "../../utils/ConvertProperties";

export declare namespace ObjectSchemaConverter {
    export interface Args extends AbstractConverter.Args {
        schema: OpenAPIV3_1.SchemaObject;
    }

    export interface Output {
        type: Type;
        inlinedTypes: Record<TypeId, TypeDeclaration>;
    }
}

export class ObjectSchemaConverter extends AbstractConverter<
    AbstractConverterContext<object>,
    ObjectSchemaConverter.Output
> {
    private readonly schema: OpenAPIV3_1.SchemaObject;

    constructor({ breadcrumbs, schema }: ObjectSchemaConverter.Args) {
        super({ breadcrumbs });
        this.schema = schema;
    }

    public async convert({
        context,
        errorCollector
    }: {
        context: AbstractConverterContext<object>;
        errorCollector: ErrorCollector;
    }): Promise<ObjectSchemaConverter.Output | undefined> {
        const hasAdditionalProperties =
            typeof this.schema.additionalProperties === "boolean" && this.schema.additionalProperties;

        if (!this.schema.properties && !this.schema.allOf) {
            return {
                type: Type.object({
                    properties: [],
                    extends: [],
                    extendedProperties: [],
                    extraProperties: hasAdditionalProperties
                }),
                inlinedTypes: {}
            };
        }

        const { convertedProperties: properties, inlinedTypesFromProperties: propertiesInlinedTypes } =
            await convertProperties({
                properties: this.schema.properties ?? {},
                required: this.schema.required ?? [],
                breadcrumbs: this.breadcrumbs,
                context,
                errorCollector
            });

        const extends_: TypeReference[] = [];
        let inlinedTypes: Record<TypeId, TypeDeclaration> = propertiesInlinedTypes;
        for (const [index, allOfSchema] of (this.schema.allOf ?? []).entries()) {
            if (context.isReferenceObject(allOfSchema)) {
                const maybeTypeReference = await context.convertReferenceToTypeReference(allOfSchema);
                if (maybeTypeReference.ok) {
                    extends_.push(maybeTypeReference.reference);
                }
                continue;
            }

            const { convertedProperties: allOfProperties, inlinedTypesFromProperties: inlinedTypesFromAllOf } =
                await convertProperties({
                    properties: allOfSchema.properties ?? {},
                    required: allOfSchema.required ?? [],
                    breadcrumbs: [...this.breadcrumbs, "allOf", index.toString()],
                    context,
                    errorCollector
                });

            properties.push(...allOfProperties);
            inlinedTypes = { ...inlinedTypes, ...inlinedTypesFromAllOf };
        }

        return {
            type: Type.object({
                properties,
                extends: extends_.map((ext) => context.typeReferenceToDeclaredTypeName(ext)).filter(isNonNullish),
                extendedProperties: [],
                extraProperties: hasAdditionalProperties
            }),
            inlinedTypes
        };
    }
}
