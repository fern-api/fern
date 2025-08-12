import { MediaType } from "@fern-api/core-utils";
import { FernIr, HttpResponseBody, JsonResponse, StreamingResponse } from "@fern-api/ir-sdk";
import { Converters, SchemaOrReferenceConverter } from "@fern-api/v3-importer-commons";
import { OpenAPIV3_1 } from "openapi-types";

import { FernStreamingExtension } from "../../extensions/x-fern-streaming";

export declare namespace ResponseBodyConverter {
    export interface Args extends Converters.AbstractConverters.AbstractMediaTypeObjectConverter.Args {
        responseBody: OpenAPIV3_1.ResponseObject;
        streamingExtension: FernStreamingExtension.Output | undefined;
        statusCode: string;
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
        return this.shouldConvertAsStreaming()
            ? this.convertStreamingResponseBody()
            : this.convertNonStreamingResponseBody();
    }

    private convertStreamingResponseBody(): ResponseBodyConverter.Output | undefined {
        if (this.streamingExtension == null) {
            return undefined;
        }
        if (this.streamingExtension.type == "streamCondition") {
            const streamingResponse = this.streamingExtension.responseStream;
            const nonStreamingResponse = this.streamingExtension.response;
            const nonStreamingSchemaId = [...this.group, this.method, "Response", this.statusCode].join("_");
            const streamingSchemaId = `${nonStreamingSchemaId}_streaming`;

            const convertedStreamingSchema = this.parseMediaTypeSchemaOrReference({
                schemaOrReference: streamingResponse,
                schemaId: streamingSchemaId
            });
            const convertedNonStreamingSchema = this.parseMediaTypeSchemaOrReference({
                schemaOrReference: nonStreamingResponse,
                schemaId: nonStreamingSchemaId
            });

            return this.convertStreamConditionResponse({
                convertedStreamingSchema,
                convertedNonStreamingSchema
            });
        }
        if (this.streamingExtension.type === "stream") {
            const schemaId = [...this.group, this.method, "Response", this.statusCode].join("_");
            const contentTypes = Object.keys(this.responseBody.content ?? {});
            for (const contentType of contentTypes) {
                const mediaTypeObject = this.responseBody.content?.[contentType];
                if (mediaTypeObject == null) {
                    continue;
                }
                const convertedSchema = this.parseMediaTypeObject({
                    mediaTypeObject,
                    schemaId,
                    contentType: this.streamingExtension.format
                });
                if (convertedSchema == null) {
                    continue;
                }
                return this.convertStreamingResponse({
                    mediaTypeObject,
                    convertedSchema
                });
            }
        }

        return undefined;
    }

    private convertNonStreamingResponseBody(): ResponseBodyConverter.Output | undefined {
        const schemaId = [...this.group, this.method, "Response", this.statusCode].join("_");
        const jsonContentTypes = Object.keys(this.responseBody.content ?? {}).filter((type) => type.includes("json"));
        for (const contentType of jsonContentTypes) {
            const mediaTypeObject = this.responseBody.content?.[contentType];
            if (mediaTypeObject == null) {
                continue;
            }
            const convertedSchema = this.parseMediaTypeObject({
                mediaTypeObject,
                schemaId,
                contentType
            });
            if (convertedSchema == null) {
                continue;
            }
            if (this.shouldReturnJsonResponse(contentType)) {
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
            if (mediaTypeObject == null) {
                continue;
            }
            const convertedSchema = this.parseMediaTypeObject({
                mediaTypeObject,
                schemaId,
                contentType
            });
            if (convertedSchema == null) {
                continue;
            }
            if (this.isBinarySchema(convertedSchema)) {
                return this.shouldReturnBytesResponse()
                    ? this.returnBytesResponse({
                          mediaTypeObject
                      })
                    : this.returnFileDownloadResponse({
                          mediaTypeObject
                      });
            }
            if (this.shouldReturnTextResponse(contentType)) {
                return this.returnTextResponse({
                    mediaTypeObject
                });
            }
        }

        // For success status codes (2xx), return an empty response instead of undefined
        const statusCodeNum = parseInt(this.statusCode);
        if (!isNaN(statusCodeNum) && statusCodeNum >= 200 && statusCodeNum < 300) {
            const mediaTypeObject: OpenAPIV3_1.MediaTypeObject = {
                schema: {
                    type: "object",
                    description: "Empty response body"
                }
            };

            const convertedSchema = this.parseMediaTypeObject({
                mediaTypeObject,
                schemaId,
                contentType: "application/json",
                resolveSchema: true
            });

            if (convertedSchema != null) {
                return this.returnJsonResponse({
                    mediaTypeObject,
                    convertedSchema
                });
            }
        }

        return undefined;
    }

    private convertStreamConditionResponse({
        convertedStreamingSchema,
        convertedNonStreamingSchema
    }: {
        convertedStreamingSchema:
            | Converters.AbstractConverters.AbstractMediaTypeObjectConverter.MediaTypeObject
            | undefined;
        convertedNonStreamingSchema:
            | Converters.AbstractConverters.AbstractMediaTypeObjectConverter.MediaTypeObject
            | undefined;
    }): ResponseBodyConverter.Output | undefined {
        if (convertedStreamingSchema == null || convertedNonStreamingSchema == null) {
            return undefined;
        }
        return {
            responseBody: HttpResponseBody.json(
                JsonResponse.response({
                    responseBodyType: convertedNonStreamingSchema.type,
                    docs: this.responseBody.description,
                    v2Examples: convertedNonStreamingSchema.schema?.typeDeclaration.v2Examples
                })
            ),
            streamResponseBody: HttpResponseBody.streaming(
                StreamingResponse.json({
                    // TODO: Use the streamExtension.streamDescription
                    docs: this.responseBody.description,
                    payload: convertedStreamingSchema.type,
                    terminator: undefined,
                    v2Examples: convertedStreamingSchema.schema?.typeDeclaration.v2Examples
                })
            ),
            inlinedTypes: {
                ...convertedStreamingSchema.inlinedTypes,
                ...convertedNonStreamingSchema.inlinedTypes
            }
        };
    }

    private convertStreamingResponse({
        mediaTypeObject,
        convertedSchema
    }: {
        mediaTypeObject: OpenAPIV3_1.MediaTypeObject;
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
                    inlinedTypes: convertedSchema.inlinedTypes,
                    examples: convertedSchema.examples
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
                    inlinedTypes: convertedSchema.inlinedTypes,
                    examples: convertedSchema.examples
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
        mediaTypeObject: OpenAPIV3_1.MediaTypeObject;
        convertedSchema: Converters.AbstractConverters.AbstractMediaTypeObjectConverter.MediaTypeObject;
    }): ResponseBodyConverter.Output {
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
        mediaTypeObject: OpenAPIV3_1.MediaTypeObject;
    }): ResponseBodyConverter.Output {
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
        mediaTypeObject: OpenAPIV3_1.MediaTypeObject;
    }): ResponseBodyConverter.Output {
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

    private returnTextResponse({
        mediaTypeObject
    }: {
        mediaTypeObject: OpenAPIV3_1.MediaTypeObject;
    }): ResponseBodyConverter.Output {
        return {
            responseBody: HttpResponseBody.text({
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

    private shouldConvertAsStreaming(): boolean {
        return this.streamingExtension != null;
    }

    private shouldReturnJsonResponse(contentType: string): boolean {
        return contentType.includes("json");
    }

    private shouldReturnBytesResponse(): boolean {
        return this.context.settings.useBytesForBinaryResponse && this.streamingExtension == null;
    }

    private shouldReturnTextResponse(contentType: string): boolean {
        return MediaType.parse(contentType)?.isText() ?? false;
    }
}
