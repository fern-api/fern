import { OpenAPIV3_1 } from "openapi-types";

import { HttpResponseBody, JsonResponse, TypeDeclaration } from "@fern-api/ir-sdk";
import { AbstractConverter, Converters, ErrorCollector } from "@fern-api/v2-importer-commons";

import { OpenAPIConverterContext3_1 } from "../OpenAPIConverterContext3_1";

export declare namespace ResponseBodyConverter {
    export interface Args extends AbstractConverter.Args {
        responseBody: OpenAPIV3_1.ResponseObject;
        group: string[];
        method: string;
        statusCode: string;
    }

    export interface Output {
        responseBody: HttpResponseBody;
        inlinedTypes: Record<string, TypeDeclaration>;
        examples?: Record<string, OpenAPIV3_1.ExampleObject>;
    }
}

export class ResponseBodyConverter extends AbstractConverter<
    OpenAPIConverterContext3_1,
    ResponseBodyConverter.Output | undefined
> {
    private readonly responseBody: OpenAPIV3_1.ResponseObject;
    private readonly group: string[];
    private readonly method: string;
    private readonly statusCode: string;

    constructor({ breadcrumbs, responseBody, group, method, statusCode }: ResponseBodyConverter.Args) {
        super({ breadcrumbs });
        this.responseBody = responseBody;
        this.group = group;
        this.method = method;
        this.statusCode = statusCode;
    }

    public async convert({
        context,
        errorCollector
    }: {
        context: OpenAPIConverterContext3_1;
        errorCollector: ErrorCollector;
    }): Promise<ResponseBodyConverter.Output | undefined> {
        if (!this.responseBody.content) {
            return undefined;
        }

        const jsonContentTypes = Object.keys(this.responseBody.content).filter((type) => type.includes("json"));

        for (const contentType of [...jsonContentTypes]) {
            const mediaTypeObject = this.responseBody.content[contentType];
            if (mediaTypeObject == null) {
                continue;
            }
            if (mediaTypeObject.schema == null) {
                continue;
            }

            const schemaId = [...this.group, this.method, "Response", this.statusCode].join("_");
            const schemaOrReferenceConverter = new Converters.SchemaConverters.SchemaOrReferenceConverter({
                breadcrumbs: [...this.breadcrumbs, "schema"],
                schemaOrReference: mediaTypeObject.schema,
                schemaIdOverride: schemaId
            });

            const convertedSchema = await schemaOrReferenceConverter.convert({ context, errorCollector });
            if (convertedSchema == null) {
                continue;
            }

            const examples =
                mediaTypeObject.examples != null
                    ? Object.fromEntries(
                          await Promise.all(
                              Object.entries(mediaTypeObject.examples).map(async ([key, example]) => [
                                  key,
                                  context.isReferenceObject(example)
                                      ? await context.resolveReference<OpenAPIV3_1.ExampleObject>(example)
                                      : example
                              ])
                          )
                      )
                    : undefined;

            if (contentType.includes("json")) {
                const responseBody = HttpResponseBody.json(
                    JsonResponse.response({
                        responseBodyType: convertedSchema.type,
                        docs: this.responseBody.description
                    })
                );
                return {
                    responseBody,
                    inlinedTypes: convertedSchema.inlinedTypes,
                    examples
                };
            }
        }

        return undefined;
    }
}
