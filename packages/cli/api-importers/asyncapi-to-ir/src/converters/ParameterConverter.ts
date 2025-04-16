import { OpenAPIV3_1 } from "openapi-types";

import { TypeDeclaration, TypeId, TypeReference } from "@fern-api/ir-sdk";
import { Converters, ErrorCollector, Extensions } from "@fern-api/v2-importer-commons";

import { AsyncAPIConverterContext } from "../AsyncAPIConverterContext";
import { AsyncAPIParameter } from "../sharedTypes";

export class ParameterConverter extends Converters.AbstractConverters.AbstractParameterConverter<AsyncAPIParameter> {
    constructor({
        breadcrumbs,
        parameter
    }: Converters.AbstractConverters.AbstractParameterConverter.Args<AsyncAPIParameter>) {
        super({ breadcrumbs, parameter });
    }

    public async convert({
        context,
        errorCollector
    }: {
        context: AsyncAPIConverterContext;
        errorCollector: ErrorCollector;
    }): Promise<Converters.AbstractConverters.AbstractParameterConverter.Output | undefined> {
        let typeReference: TypeReference | undefined;
        let inlinedTypes: Record<TypeId, TypeDeclaration> = {};

        const fernOptionalExtension = new Extensions.FernOptionalExtension({
            breadcrumbs: this.breadcrumbs,
            parameter: this.parameter
        });
        const fernOptional = fernOptionalExtension.convert({ context, errorCollector });
        const parameterIsOptional = fernOptional ?? this.parameter.required ?? false;
        let maybeParameterSchema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject | undefined =
            this.parameter.schema;
        if (maybeParameterSchema == null) {
            maybeParameterSchema = {
                ...this.parameter,
                type: "string",
                enum: this.parameter.enum,
                default: this.parameter.default,
                example: this.parameter.examples?.[0],
                examples: undefined,
                required: undefined
            };
        }

        const schemaOrReferenceConverter = new Converters.SchemaConverters.SchemaOrReferenceConverter({
            breadcrumbs: [...this.breadcrumbs, "schema"],
            schemaIdOverride: this.parameter.name,
            schemaOrReference: maybeParameterSchema,
            wrapAsOptional: parameterIsOptional
        });
        const converted = await schemaOrReferenceConverter.convert({ context, errorCollector });
        if (converted != null) {
            typeReference = converted.type;
            inlinedTypes = converted.inlinedTypes ?? {};
        }

        return this.convertToOutput({
            typeReference,
            inlinedTypes,
            context,
            errorCollector
        });
    }
}
