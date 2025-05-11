import { OpenAPIV3_1 } from "openapi-types";

import { TypeId, TypeReference } from "@fern-api/ir-sdk";
import { Converters } from "@fern-api/v2-importer-commons";

export class ParameterConverter extends Converters.AbstractConverters
    .AbstractParameterConverter<OpenAPIV3_1.ParameterObject> {
    constructor({
        context,
        breadcrumbs,
        parameter
    }: Converters.AbstractConverters.AbstractParameterConverter.Args<OpenAPIV3_1.ParameterObject>) {
        super({ context, breadcrumbs, parameter });
    }

    public convert(): Converters.AbstractConverters.AbstractParameterConverter.Output | undefined {
        let typeReference: TypeReference | undefined;
        let inlinedTypes: Record<TypeId, Converters.SchemaConverters.SchemaConverter.ConvertedSchema> = {};

        if (this.parameter.schema != null) {
            const schemaOrReferenceConverter = new Converters.SchemaConverters.SchemaOrReferenceConverter({
                context: this.context,
                breadcrumbs: [...this.breadcrumbs, "schema"],
                schemaOrReference: this.parameter.schema,
                wrapAsOptional: this.parameter.required == null || !this.parameter.required
            });
            const converted = schemaOrReferenceConverter.convert();
            if (converted != null) {
                typeReference = converted.type;
                inlinedTypes = converted.inlinedTypes ?? {};
            }
        }

        return this.convertToOutput({
            schema: this.parameter.schema ?? { type: "string" },
            typeReference,
            inlinedTypes
        });
    }
}
