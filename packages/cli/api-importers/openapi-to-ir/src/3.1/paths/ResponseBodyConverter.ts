import { OpenAPIV3_1 } from "openapi-types";

import { HttpResponseBody, JsonResponse } from "@fern-api/ir-sdk";
import { Converters, ErrorCollector, SchemaOrReferenceConverter } from "@fern-api/v2-importer-commons";

import { FernStreamingExtension } from "../../extensions/x-fern-streaming";

export declare namespace ResponseBodyConverter {
    export interface Args extends Converters.AbstractConverters.AbstractMediaTypeObjectConverter.Args {
        responseBody: OpenAPIV3_1.ResponseObject;
        statusCode: string;
        streamingExtension: FernStreamingExtension.Output | undefined;
    }

    export interface Output extends Converters.AbstractConverters.AbstractMediaTypeObjectConverter.Output {
        responseBody: HttpResponseBody;
    }
}

export class ResponseBodyConverter extends Converters.AbstractConverters.AbstractMediaTypeObjectConverter {
    private readonly responseBody: OpenAPIV3_1.ResponseObject;
    private readonly statusCode: string;
    private readonly streamingExtension: FernStreamingExtension.Output | undefined;

    constructor({
        context,
        breadcrumbs,
        responseBody,
        group,
        method,
        statusCode,
        streamingExtension
    }: ResponseBodyConverter.Args) {
        super({ context, breadcrumbs, group, method });
        this.responseBody = responseBody;
        this.statusCode = statusCode;
        this.streamingExtension = streamingExtension;
    }

    public async convert({
        errorCollector
    }: {
        errorCollector: ErrorCollector;
    }): Promise<ResponseBodyConverter.Output | undefined> {
        if (!this.responseBody.content) {
            return undefined;
        }

        const jsonContentTypes = Object.keys(this.responseBody.content).filter((type) => type.includes("json"));
        const schemaId = [...this.group, this.method, "Response", this.statusCode].join("_");
        for (const contentType of [...jsonContentTypes]) {
            const mediaTypeObject = this.responseBody.content?.[contentType];
            const convertedSchema = await this.parseMediaTypeObject({
                mediaTypeObject,
                errorCollector,
                contentType,
                schemaId
            });
            if (convertedSchema == null) {
                continue;
            }
            if (contentType.includes("json")) {
                const responseBody = HttpResponseBody.json(
                    JsonResponse.response({
                        responseBodyType: convertedSchema.type,
                        docs: this.responseBody.description,
                        v2Examples: await this.convertMediaTypeObjectExamples({
                            mediaTypeObject,
                            errorCollector
                        })
                    })
                );
                return {
                    responseBody,
                    inlinedTypes: convertedSchema.inlinedTypes,
                    examples: convertedSchema.examples
                };
            }
        }

        const nonJsonContentTypes = Object.keys(this.responseBody.content).filter((type) => !type.includes("json"));
        for (const contentType of nonJsonContentTypes) {
            const mediaTypeObject = this.responseBody.content?.[contentType];
            const convertedSchema = await this.parseMediaTypeObject({
                mediaTypeObject,
                errorCollector,
                contentType,
                schemaId
            });
            if (convertedSchema == null) {
                continue;
            }
            if (this.isBinarySchema(convertedSchema)) {
                if (this.context.settings?.useBytesForBinaryResponse && this.streamingExtension == null) {
                    const responseBody = HttpResponseBody.bytes({
                        docs: this.responseBody.description,
                        v2Examples: await this.convertMediaTypeObjectExamples({
                            mediaTypeObject,
                            errorCollector
                        })
                    });
                    return {
                        responseBody,
                        inlinedTypes: {}
                    };
                }
                const responseBody = HttpResponseBody.fileDownload({
                    docs: this.responseBody.description,
                    v2Examples: await this.convertMediaTypeObjectExamples({
                        mediaTypeObject,
                        errorCollector
                    })
                });
                return {
                    responseBody,
                    inlinedTypes: {}
                };
            }
        }

        return undefined;
    }

    private isBinarySchema(convertedSchema: SchemaOrReferenceConverter.Output): boolean {
        const typeReference = convertedSchema.type;
        switch (typeReference.type) {
            case "container":
            case "named":
            case "unknown":
                return false;
            case "primitive":
                if (typeReference.primitive.v2 == null) {
                    return false;
                }
                return (
                    typeReference.primitive.v2.type === "string" &&
                    typeReference.primitive.v2.validation?.format === "binary"
                );
            default:
                return false;
        }
    }
}
