import { OpenAPIV3_1 } from "openapi-types";

import { TypeDeclaration, TypeId, TypeReference } from "@fern-api/ir-sdk";
import { Converters, Extensions } from "@fern-api/v2-importer-commons";

import { AsyncAPIParameter } from "../sharedTypes";

export class ParameterConverter extends Converters.AbstractConverters.AbstractParameterConverter<AsyncAPIParameter> {
    constructor({
        context,
        breadcrumbs,
        parameter
    }: Converters.AbstractConverters.AbstractParameterConverter.Args<AsyncAPIParameter>) {
        super({ context, breadcrumbs, parameter });
    }

    public async convert(): Promise<Converters.AbstractConverters.AbstractParameterConverter.Output | undefined> {
        let typeReference: TypeReference | undefined;
        let inlinedTypes: Record<TypeId, TypeDeclaration> = {};

        const fernOptional = new Extensions.FernOptionalExtension({
            breadcrumbs: this.breadcrumbs,
            parameter: this.parameter,
            context: this.context
        }).convert();
        const parameterIsOptional = fernOptional ?? this.parameter.required ?? false;
        const maybeParameterSchema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject = this.parameter.schema ?? {
            ...this.parameter,
            type: "string",
            enum: this.parameter.enum,
            default: this.parameter.default,
            example: this.parameter.example,
            examples: Object.values(this.parameter.examples ?? {}),
            required: undefined
        };

        const schemaOrReferenceConverter = new Converters.SchemaConverters.SchemaOrReferenceConverter({
            context: this.context,
            breadcrumbs: [...this.breadcrumbs, "schema"],
            schemaIdOverride: this.parameter.name,
            schemaOrReference: maybeParameterSchema,
            wrapAsOptional: parameterIsOptional
        });
        const converted = await schemaOrReferenceConverter.convert();
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
