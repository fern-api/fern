import { OpenAPIV3_1 } from "openapi-types";

import { TypeId, TypeReference } from "@fern-api/ir-sdk";
import { Converters, Extensions } from "@fern-api/v2-importer-commons";

import { AsyncAPIParameter } from "../sharedTypes";

export class ParameterConverter extends Converters.AbstractConverters.AbstractParameterConverter<AsyncAPIParameter> {
    private readonly parameterNamePrefix?: string;
    constructor({
        context,
        breadcrumbs,
        parameter,
        parameterNamePrefix
    }: Converters.AbstractConverters.AbstractParameterConverter.Args<AsyncAPIParameter> & {
        parameterNamePrefix?: string;
    }) {
        super({ context, breadcrumbs, parameter });
        this.parameterNamePrefix = parameterNamePrefix;
    }

    public convert(): Converters.AbstractConverters.AbstractParameterConverter.Output | undefined {
        let typeReference: TypeReference | undefined;
        let inlinedTypes: Record<TypeId, Converters.SchemaConverters.SchemaConverter.ConvertedSchema> = {};

        const fernOptional = new Extensions.FernOptionalExtension({
            breadcrumbs: this.breadcrumbs,
            parameter: this.parameter,
            context: this.context
        }).convert();
        const parameterIsOptional = fernOptional ?? this.parameter.required === false;
        const maybeParameterSchema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject = this.parameter.schema ?? {
            ...this.parameter,
            type: "string",
            enum: this.parameter.enum,
            default: this.parameter.default,
            example: this.parameter.example ?? this.parameter.name,
            examples: Object.values(this.parameter.examples ?? {}),
            deprecated: this.parameter.deprecated,
            required: undefined
        };

        const schemaOrReferenceConverter = new Converters.SchemaConverters.SchemaOrReferenceConverter({
            context: this.context,
            breadcrumbs: [...this.breadcrumbs, "schema"],
            schemaIdOverride: this.parameterNamePrefix
                ? `${this.parameterNamePrefix}_${this.parameter.name}`
                : this.parameter.name,
            schemaOrReference: maybeParameterSchema,
            wrapAsOptional: parameterIsOptional
        });
        const converted = schemaOrReferenceConverter.convert();
        if (converted != null) {
            typeReference = converted.type;
            inlinedTypes = converted.inlinedTypes ?? {};
        }

        return this.convertToOutput({
            schema: maybeParameterSchema,
            typeReference,
            inlinedTypes
        });
    }
}
