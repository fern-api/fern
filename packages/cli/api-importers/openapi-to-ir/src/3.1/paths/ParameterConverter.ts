import { OpenAPIV3_1 } from "openapi-types";

import { TypeDeclaration, TypeId, TypeReference } from "@fern-api/ir-sdk";
import { Converters, ErrorCollector } from "@fern-api/v2-importer-commons";

import { OpenAPIConverterContext3_1 } from "../OpenAPIConverterContext3_1";

export class ParameterConverter extends Converters.AbstractConverters
    .AbstractParameterConverter<OpenAPIV3_1.ParameterObject> {
    constructor({
        breadcrumbs,
        parameter
    }: Converters.AbstractConverters.AbstractParameterConverter.Args<OpenAPIV3_1.ParameterObject>) {
        super({ breadcrumbs, parameter });
    }

    public async convert({
        context,
        errorCollector
    }: {
        context: OpenAPIConverterContext3_1;
        errorCollector: ErrorCollector;
    }): Promise<Converters.AbstractConverters.AbstractParameterConverter.Output | undefined> {
        let typeReference: TypeReference | undefined;
        let inlinedTypes: Record<TypeId, TypeDeclaration> = {};

        if (this.parameter.schema != null) {
            const schemaOrReferenceConverter = new Converters.SchemaConverters.SchemaOrReferenceConverter({
                breadcrumbs: [...this.breadcrumbs, "schema"],
                schemaOrReference: this.parameter.schema,
                wrapAsOptional: this.parameter.required == null || !this.parameter.required
            });
            const converted = await schemaOrReferenceConverter.convert({ context, errorCollector });
            if (converted != null) {
                typeReference = converted.type;
                inlinedTypes = converted.inlinedTypes ?? {};
            }
        }

        return this.returnOutput({
            typeReference,
            inlinedTypes,
            context,
            errorCollector
        });
    }
}
