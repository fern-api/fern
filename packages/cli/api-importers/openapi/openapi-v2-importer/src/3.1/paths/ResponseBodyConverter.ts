import { OpenAPIV3_1 } from "openapi-types";

import { HttpResponseBody, JsonResponse, TypeDeclaration } from "@fern-api/ir-sdk";

import { AbstractConverter } from "../../AbstractConverter";
import { ErrorCollector } from "../../ErrorCollector";
import { OpenAPIConverterContext3_1 } from "../OpenAPIConverterContext3_1";
import { SchemaOrReferenceConverter } from "../schema/SchemaOrReferenceConverter";

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

    public convert({
        context,
        errorCollector
    }: {
        context: OpenAPIConverterContext3_1;
        errorCollector: ErrorCollector;
    }): ResponseBodyConverter.Output | undefined {
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
            const schemaOrReferenceConverter = new SchemaOrReferenceConverter({
                breadcrumbs: [...this.breadcrumbs, "schema"],
                schemaOrReference: mediaTypeObject.schema,
                schemaIdOverride: schemaId
            });

            const convertedSchema = schemaOrReferenceConverter.convert({ context, errorCollector });
            if (convertedSchema == null) {
                continue;
            }

            if (contentType.includes("json")) {
                const responseBody = HttpResponseBody.json(
                    JsonResponse.response({
                        responseBodyType: convertedSchema.type,
                        docs: this.responseBody.description
                    })
                );
                return {
                    responseBody,
                    inlinedTypes: convertedSchema.inlinedTypes
                };
            }
        }

        return undefined;
    }
}
