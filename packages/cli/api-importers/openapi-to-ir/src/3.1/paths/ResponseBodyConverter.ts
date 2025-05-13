import { OpenAPIV3_1 } from "openapi-types";

import { HttpResponseBody, JsonResponse, StreamingResponse } from "@fern-api/ir-sdk";
import { Converters, SchemaOrReferenceConverter } from "@fern-api/v2-importer-commons";

import { FernStreamingExtension } from "../../extensions/x-fern-streaming";

export declare namespace ResponseBodyConverter {
    export interface Args extends Converters.AbstractConverters.AbstractMediaTypeObjectConverter.Args {
        responseBody: OpenAPIV3_1.ResponseObject;
        statusCode: string;
        streamingExtension: FernStreamingExtension.Output | undefined;
    }

    export interface Output extends Converters.AbstractConverters.AbstractMediaTypeObjectConverter.Output {
        responseBody: HttpResponseBody;
        streamResponseBody: HttpResponseBody | undefined;
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

    public convert(): ResponseBodyConverter.Output | undefined {
        const jsonContentTypes = Object.keys(this.responseBody.content ?? {}).filter((type) => type.includes("json"));
        const schemaId = [...this.group, this.method, "Response", this.statusCode].join("_");
        for (const contentType of [...jsonContentTypes]) {
            const mediaTypeObject = this.responseBody.content?.[contentType];
            const convertedSchema = this.parseMediaTypeObject({
                mediaTypeObject,
                schemaId
            });
            if (convertedSchema == null) {
                continue;
            }
            if (this.streamingExtension != null) {
                return this.convertStreamingResponse({
                    mediaTypeObject,
                    convertedSchema
                });
            }
            if (contentType.includes("json")) {
                return this.returnJsonResponse({
                    mediaTypeObject,
                    convertedSchema
                });
            }
        }

        const nonJsonContentTypes = Object.keys(this.responseBody.content ?? {}).filter(
            (type) => !type.includes("json")
        );
        for (const contentType of nonJsonContentTypes) {
            const mediaTypeObject = this.responseBody.content?.[contentType];
            const convertedSchema = this.parseMediaTypeObject({
                mediaTypeObject,
                schemaId
            });
            if (convertedSchema == null) {
                continue;
            }
            if (this.isBinarySchema(convertedSchema)) {
                if (this.context.settings?.useBytesForBinaryResponse && this.streamingExtension == null) {
                    return this.returnBytesResponse({
                        mediaTypeObject
                    });
                }
                return this.returnFileDownloadResponse({
                    mediaTypeObject
                });
            }
        }

        return undefined;
    }

    private convertStreamingResponse({
        mediaTypeObject,
        convertedSchema
    }: {
        mediaTypeObject: OpenAPIV3_1.MediaTypeObject | undefined;
        convertedSchema: Converters.AbstractConverters.AbstractMediaTypeObjectConverter.MediaTypeObject;
    }): ResponseBodyConverter.Output | undefined {
        if (this.streamingExtension == null) {
            return undefined;
        }
        const format = this.streamingExtension.format;
        switch (format) {
            case "json": {
                // TODO: continue this impl. here
                return {
                    responseBody: HttpResponseBody.streaming(
                        StreamingResponse.json({
                            docs: this.responseBody.description,
                            payload: convertedSchema.type,
                            terminator: undefined,
                            v2Examples: this.convertMediaTypeObjectExamples({
                                mediaTypeObject,
                                generateOptionalProperties: true,
                                exampleGenerationStrategy: "response"
                            })
                        })
                    ),
                    streamResponseBody: undefined,
                    inlinedTypes: {},
                    examples: {}
                };
            }
            case "sse": {
                return {
                    responseBody: HttpResponseBody.streaming(
                        StreamingResponse.sse({
                            docs: this.responseBody.description,
                            payload: convertedSchema.type,
                            terminator: undefined,
                            v2Examples: this.convertMediaTypeObjectExamples({
                                mediaTypeObject,
                                generateOptionalProperties: true,
                                exampleGenerationStrategy: "response"
                            })
                        })
                    ),
                    streamResponseBody: undefined,
                    inlinedTypes: {},
                    examples: {}
                };
            }
            default: {
                return undefined;
            }
        }
    }

    private returnJsonResponse({
        mediaTypeObject,
        convertedSchema
    }: {
        mediaTypeObject: OpenAPIV3_1.MediaTypeObject | undefined;
        convertedSchema: Converters.AbstractConverters.AbstractMediaTypeObjectConverter.MediaTypeObject;
    }): ResponseBodyConverter.Output | undefined {
        return {
            responseBody: HttpResponseBody.json(
                JsonResponse.response({
                    responseBodyType: convertedSchema.type,
                    docs: this.responseBody.description,
                    v2Examples: this.convertMediaTypeObjectExamples({
                        mediaTypeObject,
                        generateOptionalProperties: true,
                        exampleGenerationStrategy: "response"
                    })
                })
            ),
            streamResponseBody: undefined,
            inlinedTypes: convertedSchema.inlinedTypes,
            examples: convertedSchema.examples
        };
    }

    private returnBytesResponse({
        mediaTypeObject
    }: {
        mediaTypeObject: OpenAPIV3_1.MediaTypeObject | undefined;
    }): ResponseBodyConverter.Output | undefined {
        return {
            responseBody: HttpResponseBody.bytes({
                docs: this.responseBody.description,
                v2Examples: this.convertMediaTypeObjectExamples({
                    mediaTypeObject,
                    generateOptionalProperties: true,
                    exampleGenerationStrategy: "response"
                })
            }),
            streamResponseBody: undefined,
            inlinedTypes: {}
        };
    }

    private returnFileDownloadResponse({
        mediaTypeObject
    }: {
        mediaTypeObject: OpenAPIV3_1.MediaTypeObject | undefined;
    }): ResponseBodyConverter.Output | undefined {
        return {
            responseBody: HttpResponseBody.fileDownload({
                docs: this.responseBody.description,
                v2Examples: this.convertMediaTypeObjectExamples({
                    mediaTypeObject,
                    generateOptionalProperties: true,
                    exampleGenerationStrategy: "response"
                })
            }),
            streamResponseBody: undefined,
            inlinedTypes: {}
        };
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
