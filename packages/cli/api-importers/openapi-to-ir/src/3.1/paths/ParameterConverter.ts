import { MediaType } from "@fern-api/core-utils";
import { TypeId, TypeReference } from "@fern-api/ir-sdk";
import { Converters } from "@fern-api/v3-importer-commons";
import { OpenAPIV3_1 } from "openapi-types";

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

        const schema = this.getSchema();

        if (schema != null) {
            const schemaIdOverride = this.context.convertBreadcrumbsToName([...this.breadcrumbs, this.parameter.name]);

            const schemaOrReferenceConverter = new Converters.SchemaConverters.SchemaOrReferenceConverter({
                context: this.context,
                breadcrumbs: [...this.breadcrumbs, this.parameter.name, "schema"],
                schemaOrReference: schema,
                wrapAsOptional: this.parameter.required == null || !this.parameter.required,
                schemaIdOverride
            });
            const converted = schemaOrReferenceConverter.convert();
            if (converted != null) {
                typeReference = converted.type;
                inlinedTypes = converted.inlinedTypes ?? {};
            }
        }

        return this.convertToOutput({
            schema: schema ?? { type: "string" },
            typeReference,
            inlinedTypes
        });
    }

    /**
     * Resolves the schema describing the parameter's value. Parameters normally declare `schema`
     * directly, but the OpenAPI spec also allows a `content` map for values serialized in a media
     * type — most commonly a header holding a JSON-encoded object.
     *
     * Only headers are resolved from `content`: header values are JSON-encoded when sent, whereas
     * an object query parameter is serialized as separate key/value pairs rather than as a single
     * JSON-encoded value, which is not what `content: application/json` describes.
     */
    private getSchema(): OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.SchemaObject | undefined {
        if (this.parameter.schema != null) {
            return this.parameter.schema;
        }
        if (
            !this.context.settings.respectParameterContent ||
            this.parameter.in !== "header" ||
            this.parameter.content == null
        ) {
            return undefined;
        }
        for (const [contentType, mediaTypeObject] of Object.entries(this.parameter.content)) {
            if (mediaTypeObject.schema != null && MediaType.parse(contentType)?.isJSON()) {
                return mediaTypeObject.schema;
            }
        }
        return undefined;
    }
}
