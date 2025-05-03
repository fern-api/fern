import { OpenAPIV3_1 } from "openapi-types";

import { isNonNullish } from "@fern-api/core-utils";
import { Type, TypeDeclaration, TypeId, TypeReference } from "@fern-api/ir-sdk";

import { AbstractConverter, AbstractConverterContext } from "../..";
import { convertProperties } from "../../utils/ConvertProperties";

export declare namespace ObjectSchemaConverter {
    export interface Args extends AbstractConverter.AbstractArgs {
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

    constructor({ context, breadcrumbs, schema }: ObjectSchemaConverter.Args) {
        super({ context, breadcrumbs });
        this.schema = schema;
    }

    public async convert(): Promise<ObjectSchemaConverter.Output | undefined> {
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
                context: this.context,
                errorCollector: this.context.errorCollector
            });

        const extends_: TypeReference[] = [];
        let inlinedTypes: Record<TypeId, TypeDeclaration> = propertiesInlinedTypes;
        for (const [index, allOfSchema] of (this.schema.allOf ?? []).entries()) {
            if (this.context.isReferenceObject(allOfSchema)) {
                const maybeTypeReference = await this.context.convertReferenceToTypeReference(allOfSchema);
                if (maybeTypeReference.ok) {
                    extends_.push(maybeTypeReference.reference);
                }
                continue;
            }

            const { convertedProperties: allOfProperties, inlinedTypesFromProperties: inlinedTypesFromAllOf } =
                await convertProperties({
                    properties: allOfSchema.properties ?? {},
                    required: [...(this.schema.required ?? []), ...(allOfSchema.required ?? [])],
                    breadcrumbs: [...this.breadcrumbs, "allOf", index.toString()],
                    context: this.context,
                    errorCollector: this.context.errorCollector
                });

            properties.push(...allOfProperties);
            inlinedTypes = { ...inlinedTypes, ...inlinedTypesFromAllOf };
        }

        return {
            type: Type.object({
                properties,
                extends: extends_.map((ext) => this.context.typeReferenceToDeclaredTypeName(ext)).filter(isNonNullish),
                extendedProperties: [],
                extraProperties: hasAdditionalProperties
            }),
            inlinedTypes
        };
    }
}
