import { MediaType } from "@fern-api/core-utils";
import {
    Availability,
    HttpHeader,
    HttpResponseBody,
    JsonResponse,
    PrimitiveTypeV2,
    StreamingResponse,
    TypeReference,
    V2SchemaExamples
} from "@fern-api/ir-sdk";
import {
    AbstractConverter,
    Converters,
    ExampleConverter,
    SchemaOrReferenceConverter
} from "@fern-api/v3-importer-commons";
import { OpenAPIV3_1 } from "openapi-types";

import { FernStreamingExtension } from "../../extensions/x-fern-streaming.js";

export declare namespace ResponseBodyConverter {
    export interface Args extends Converters.AbstractConverters.AbstractMediaTypeObjectConverter.Args {
        responseBody: OpenAPIV3_1.ResponseObject;
        streamingExtension: FernStreamingExtension.Output | undefined;
        statusCode: string;
    }

    export interface Output extends Converters.AbstractConverters.AbstractMediaTypeObjectConverter.Output {
        responseBody: HttpResponseBody;
        streamResponseBody: HttpResponseBody | undefined;
        headers: HttpHeader[];
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
        // A 204 (No Content) response never carries a body at runtime (RFC 9110 §15.3.5), even when
        // the spec erroneously declares one. Return no body so the operation converter detects the
        // no-content case and wraps the success response optional (rather than parsing the declared
        // 204 body and leaving the return type non-optional). Warn about the spec error so authors
        // can fix it upstream.
        if (parseInt(this.statusCode) === 204) {
            if (this.responseBody.content != null && Object.keys(this.responseBody.content).length > 0) {
                this.context.errorCollector.collect({
                    message:
                        "A 204 (No Content) response declares a body, but a 204 response cannot include one. " +
                        "Ignoring the declared body and treating the success response as optional.",
                    path: this.breadcrumbs
                });
            }
            return undefined;
        }
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

            // When format is SSE, prefer text/event-stream content type over others
            const sortedContentTypes =
                this.streamingExtension.format === "sse"
                    ? [
                          ...contentTypes.filter((type) => type.includes("text/event-stream")),
                          ...contentTypes.filter((type) => !type.includes("text/event-stream"))
                      ]
                    : contentTypes;

            for (const contentType of sortedContentTypes) {
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
                    mediaTypeObject,
                    contentType
                });
            }
        }

        // For success status codes (2xx), return an empty response instead of undefined.
        // Skip 204 No Content responses — they have no body by definition,
        // and creating a synthetic body would prevent generators from detecting
        // the no-content case and making the return type optional.
        const statusCodeNum = parseInt(this.statusCode);
        if (!isNaN(statusCodeNum) && statusCodeNum >= 200 && statusCodeNum < 300 && statusCodeNum !== 204) {
            // Preserve examples from the original media type object when the response
            // has no schema but does have examples (e.g., OpenAPI specs that define
            // response examples without a corresponding schema).
            const originalJsonMediaTypeObject = jsonContentTypes
                .map((ct) => this.responseBody.content?.[ct])
                .find((mto) => mto != null);

            const mediaTypeObject: OpenAPIV3_1.MediaTypeObject = {
                schema: {
                    type: "object",
                    description: "Empty response body"
                },
                ...(originalJsonMediaTypeObject?.examples != null && {
                    examples: originalJsonMediaTypeObject.examples
                }),
                ...(originalJsonMediaTypeObject?.example != null && {
                    example: originalJsonMediaTypeObject.example
                })
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
        let description = this.responseBody.description;
        if (this.streamingExtension?.type === "streamCondition" && this.streamingExtension.streamDescription != null) {
            description = this.streamingExtension.streamDescription;
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
                    docs: description,
                    payload: convertedStreamingSchema.type,
                    terminator: this.streamingExtension?.terminator,
                    v2Examples: convertedStreamingSchema.schema?.typeDeclaration.v2Examples
                })
            ),
            inlinedTypes: {
                ...convertedStreamingSchema.inlinedTypes,
                ...convertedNonStreamingSchema.inlinedTypes,
                ...this.convertResponseHeaders().inlinedTypes
            },
            headers: this.convertResponseHeaders().headers
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
                            terminator: this.streamingExtension?.terminator,
                            v2Examples: this.convertMediaTypeObjectExamples({
                                mediaTypeObject,
                                generateOptionalProperties: true,
                                exampleGenerationStrategy: "response"
                            })
                        })
                    ),
                    streamResponseBody: undefined,
                    inlinedTypes: {
                        ...convertedSchema.inlinedTypes,
                        ...this.convertResponseHeaders().inlinedTypes
                    },
                    examples: convertedSchema.examples,
                    headers: this.convertResponseHeaders().headers
                };
            }
            case "sse": {
                return {
                    responseBody: HttpResponseBody.streaming(
                        StreamingResponse.sse({
                            docs: this.responseBody.description,
                            payload: convertedSchema.type,
                            terminator: this.streamingExtension?.terminator,
                            resumable: this.streamingExtension?.resumable,
                            v2Examples: this.convertMediaTypeObjectExamples({
                                mediaTypeObject,
                                generateOptionalProperties: true,
                                exampleGenerationStrategy: "response"
                            })
                        })
                    ),
                    streamResponseBody: undefined,
                    inlinedTypes: {
                        ...convertedSchema.inlinedTypes,
                        ...this.convertResponseHeaders().inlinedTypes
                    },
                    examples: convertedSchema.examples,
                    headers: this.convertResponseHeaders().headers
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
            inlinedTypes: {
                ...convertedSchema.inlinedTypes,
                ...this.convertResponseHeaders().inlinedTypes
            },
            examples: convertedSchema.examples,
            headers: this.convertResponseHeaders().headers
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
            inlinedTypes: this.convertResponseHeaders().inlinedTypes,
            headers: this.convertResponseHeaders().headers
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
            inlinedTypes: this.convertResponseHeaders().inlinedTypes,
            headers: this.convertResponseHeaders().headers
        };
    }

    private returnTextResponse({
        mediaTypeObject,
        contentType
    }: {
        mediaTypeObject: OpenAPIV3_1.MediaTypeObject;
        contentType: string;
    }): ResponseBodyConverter.Output {
        return {
            responseBody: HttpResponseBody.text({
                docs: this.responseBody.description,
                v2Examples: this.convertMediaTypeObjectExamples({
                    mediaTypeObject,
                    generateOptionalProperties: true,
                    exampleGenerationStrategy: "response"
                }),
                contentType: MediaType.parse(contentType)?.isPlainText() ? undefined : contentType
            }),
            streamResponseBody: undefined,
            inlinedTypes: this.convertResponseHeaders().inlinedTypes,
            headers: this.convertResponseHeaders().headers
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

    private convertedResponseHeaders:
        | {
              headers: HttpHeader[];
              inlinedTypes: Record<string, Converters.SchemaConverters.SchemaConverter.ConvertedSchema>;
          }
        | undefined;

    public convertResponseHeaders(): {
        headers: HttpHeader[];
        inlinedTypes: Record<string, Converters.SchemaConverters.SchemaConverter.ConvertedSchema>;
    } {
        this.convertedResponseHeaders ??= this.doConvertResponseHeaders();
        return this.convertedResponseHeaders;
    }

    private doConvertResponseHeaders(): {
        headers: HttpHeader[];
        inlinedTypes: Record<string, Converters.SchemaConverters.SchemaConverter.ConvertedSchema>;
    } {
        const headers: HttpHeader[] = [];
        const inlinedTypes: Record<string, Converters.SchemaConverters.SchemaConverter.ConvertedSchema> = {};
        const responseHeaders = this.responseBody.headers;

        if (responseHeaders == null) {
            return { headers, inlinedTypes };
        }

        for (const [headerName, headerOrRef] of Object.entries(responseHeaders)) {
            const resolvedHeader = this.context.resolveMaybeReference<OpenAPIV3_1.HeaderObject>({
                schemaOrReference: headerOrRef,
                breadcrumbs: [...this.breadcrumbs, "headers", headerName]
            });

            if (resolvedHeader == null) {
                continue;
            }

            const headerSchema = this.getHeaderSchema(resolvedHeader);
            let valueType: TypeReference = AbstractConverter.OPTIONAL_STRING;
            let resolvedSchema: OpenAPIV3_1.SchemaObject | undefined;
            let availability: Availability | undefined;

            if (headerSchema != null) {
                resolvedSchema = this.context.resolveMaybeReference<OpenAPIV3_1.SchemaObject>({
                    schemaOrReference: headerSchema,
                    breadcrumbs: [...this.breadcrumbs, "headers", headerName, "schema"]
                });

                if (resolvedSchema?.type === "number" || resolvedSchema?.type === "integer") {
                    valueType = TypeReference.primitive({
                        v1: resolvedSchema.type === "integer" ? "INTEGER" : "DOUBLE",
                        v2:
                            resolvedSchema.type === "integer"
                                ? PrimitiveTypeV2.integer({ default: undefined, validation: undefined })
                                : PrimitiveTypeV2.double({ default: undefined, validation: undefined })
                    });
                } else if (resolvedSchema?.type === "boolean") {
                    valueType = TypeReference.primitive({
                        v1: "BOOLEAN",
                        v2: PrimitiveTypeV2.boolean({ default: undefined })
                    });
                } else {
                    // Convert the header's schema like a request-header parameter's schema so
                    // object/enum/array/$ref response headers keep their shape (expandable
                    // properties in docs) instead of collapsing to optional<string>.
                    const convertedHeaderSchema = new SchemaOrReferenceConverter({
                        context: this.context,
                        breadcrumbs: [...this.breadcrumbs, "headers", headerName, "schema"],
                        schemaOrReference: headerSchema,
                        wrapAsOptional: true,
                        schemaIdOverride: this.context.convertBreadcrumbsToName([
                            ...this.breadcrumbs,
                            "headers",
                            headerName
                        ])
                    }).convert();
                    if (convertedHeaderSchema != null) {
                        valueType = convertedHeaderSchema.type;
                        availability = convertedHeaderSchema.availability;
                        for (const [typeId, inlinedType] of Object.entries(convertedHeaderSchema.inlinedTypes)) {
                            inlinedTypes[typeId] = inlinedType;
                        }
                    }
                }
            }

            const v2Examples = this.convertHeaderExamples({
                header: resolvedHeader,
                headerName,
                schema: headerSchema
            });

            headers.push({
                name: this.context.casingsGenerator.generateNameAndWireValue({
                    name: headerName,
                    wireValue: headerName
                }),
                docs: resolvedHeader.description,
                valueType,
                env: undefined,
                v2Examples,
                availability,
                clientDefault: undefined,
                defaultValue: resolvedSchema?.default
            });
        }

        return { headers, inlinedTypes };
    }

    /**
     * Resolves the schema describing the response header's value. Headers normally declare
     * `schema` directly, but the OpenAPI spec also allows a `content` map for values serialized
     * in a media type — most commonly a JSON-encoded object. Mirrors the request-header
     * handling in `ParameterConverter`.
     */
    private getHeaderSchema(
        header: OpenAPIV3_1.HeaderObject
    ): OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject | undefined {
        if (header.schema != null) {
            return header.schema;
        }
        if (!this.context.settings.respectParameterContent || header.content == null) {
            return undefined;
        }
        for (const [contentType, mediaTypeObject] of Object.entries(header.content)) {
            if (mediaTypeObject.schema != null && MediaType.parse(contentType)?.isJSON()) {
                return mediaTypeObject.schema;
            }
        }
        return undefined;
    }

    private convertHeaderExamples({
        header,
        headerName,
        schema
    }: {
        header: OpenAPIV3_1.HeaderObject;
        headerName: string;
        schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject | undefined;
    }): V2SchemaExamples {
        const v2Examples: V2SchemaExamples = {
            userSpecifiedExamples: {},
            autogeneratedExamples: {}
        };

        const headerExample = header.example;
        const headerExamples = header.examples;

        for (const [key, example] of Object.entries(headerExamples ?? {})) {
            const resolvedExample = this.context.resolveExampleWithValue(example);
            if (resolvedExample != null) {
                v2Examples.userSpecifiedExamples[key] = this.generateHeaderExample({
                    schema,
                    example: resolvedExample
                });
            }
        }

        if (headerExample != null) {
            const exampleName = this.context.generateUniqueName({
                prefix: `${headerName}_example`,
                existingNames: Object.keys(v2Examples.userSpecifiedExamples)
            });
            v2Examples.userSpecifiedExamples[exampleName] = this.generateHeaderExample({
                schema,
                example: headerExample
            });
        }

        if (Object.keys(v2Examples.userSpecifiedExamples).length === 0 && schema != null) {
            const exampleName = `${headerName}_example`;
            v2Examples.autogeneratedExamples[exampleName] = this.generateHeaderExample({
                schema,
                example: undefined,
                ignoreErrors: true
            });
        }

        return v2Examples;
    }

    private generateHeaderExample({
        schema,
        example,
        ignoreErrors
    }: {
        schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject | undefined;
        example: unknown;
        ignoreErrors?: boolean;
    }): unknown {
        if (schema == null) {
            return example;
        }

        const exampleConverter = new ExampleConverter({
            breadcrumbs: this.breadcrumbs,
            context: this.context,
            schema,
            example
        });
        const { validExample: convertedExample, errors } = exampleConverter.convert();
        if (!ignoreErrors) {
            errors.forEach((error) => {
                this.context.errorCollector.collect({
                    message: error.message,
                    path: error.path
                });
            });
        }
        return convertedExample;
    }
}
