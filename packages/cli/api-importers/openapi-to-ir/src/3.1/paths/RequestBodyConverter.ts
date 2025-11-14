import { MediaType } from "@fern-api/core-utils";
import {
    FileProperty,
    FileUploadBodyPropertyEncoding,
    FileUploadRequestProperty,
    HttpRequestBody,
    ObjectProperty,
    QueryParameter,
    TypeReference
} from "@fern-api/ir-sdk";
import { Converters } from "@fern-api/v3-importer-commons";
import { OpenAPIV3_1 } from "openapi-types";

import { FernStreamingExtension } from "../../extensions/x-fern-streaming";

export declare namespace RequestBodyConverter {
    export interface Args extends Converters.AbstractConverters.AbstractMediaTypeObjectConverter.Args {
        contentType: string;
        mediaType: OpenAPIV3_1.MediaTypeObject;
        description: string | undefined;
        required: boolean | undefined;
        streamingExtension: FernStreamingExtension.Output | undefined;
        queryParameters?: QueryParameter[];
    }

    export interface Output extends Converters.AbstractConverters.AbstractMediaTypeObjectConverter.Output {
        requestBody: HttpRequestBody;
        streamRequestBody: HttpRequestBody | undefined;
    }
}

export class RequestBodyConverter extends Converters.AbstractConverters.AbstractMediaTypeObjectConverter {
    private readonly contentType: string;
    private readonly mediaType: OpenAPIV3_1.MediaTypeObject;
    private readonly description: string | undefined;
    private readonly required: boolean | undefined;
    protected readonly schemaId: string;
    private readonly streamingExtension: FernStreamingExtension.Output | undefined;
    private readonly queryParameters: QueryParameter[];

    constructor({
        context,
        breadcrumbs,
        contentType,
        mediaType,
        description,
        required,
        group,
        method,
        streamingExtension,
        queryParameters
    }: RequestBodyConverter.Args) {
        super({ context, breadcrumbs, group, method });
        this.contentType = contentType;
        this.mediaType = mediaType;
        this.description = description;
        this.required = required;
        this.schemaId = [...this.group, this.method, "Request"].join("_");
        this.streamingExtension = streamingExtension;
        this.queryParameters = queryParameters ?? [];
    }

    public convert(): RequestBodyConverter.Output | undefined {
        if (this.streamingExtension?.type == "streamCondition") {
            return this.convertStreamConditionRequestBody();
        }
        return this.convertNonStreamConditionRequestBody();
    }

    private convertStreamConditionRequestBody(): RequestBodyConverter.Output | undefined {
        const isOrderedJsonOrFormContentType = this.isOrderedJsonOrFormContentType();
        if (isOrderedJsonOrFormContentType) {
            return this.handleStreamConditionJsonOrFormContent({ contentType: this.contentType });
        }

        return undefined;
    }

    private convertNonStreamConditionRequestBody(): RequestBodyConverter.Output | undefined {
        const isOrderedJsonOrFormContentType = this.isOrderedJsonOrFormContentType();
        if (isOrderedJsonOrFormContentType) {
            return this.handleJsonOrFormContent({ contentType: this.contentType });
        }

        const isMultipartContentType = MediaType.parse(this.contentType)?.isMultipart();
        if (isMultipartContentType) {
            return this.handleMultipartContent({ contentType: this.contentType });
        }

        const isBinaryContentType = this.isBinaryContentType();
        if (isBinaryContentType) {
            return this.handleBinaryContent({ contentType: this.contentType });
        }

        return undefined;
    }

    private isOrderedJsonOrFormContentType(): boolean {
        const mediaType = MediaType.parse(this.contentType);
        if (!mediaType) {
            return false;
        }

        return (
            mediaType.isJSON() ||
            mediaType.isURLEncoded() ||
            mediaType.isPlainText() ||
            mediaType.isCSV() ||
            mediaType.isHTML() ||
            mediaType.isXML() ||
            mediaType.isDNS() ||
            mediaType.isApplicationText()
        );
    }

    private isBinaryContentType(): boolean {
        const mediaType = MediaType.parse(this.contentType);
        if (!mediaType) {
            return false;
        }

        return mediaType.isBinary();
    }

    private handleJsonOrFormContent({ contentType }: { contentType: string }): RequestBodyConverter.Output | undefined {
        const mediaTypeObject = this.mediaType;
        if (mediaTypeObject == null) {
            return undefined;
        }
        const convertedSchema = this.parseMediaTypeObject({
            mediaTypeObject,
            schemaId: this.schemaId,
            contentType
        });
        if (convertedSchema == null) {
            return undefined;
        }

        const requestBodyTypeShape = convertedSchema.schema?.typeDeclaration.shape;
        if (requestBodyTypeShape?.type === "object") {
            const hasOverlap = this.hasBodyQueryParameterOverlap(requestBodyTypeShape.properties);

            if (hasOverlap) {
                return {
                    requestBody: HttpRequestBody.reference({
                        contentType,
                        docs: this.description,
                        requestBodyType: convertedSchema.type,
                        v2Examples: this.convertMediaTypeObjectExamples({
                            mediaTypeObject,
                            generateOptionalProperties: true,
                            exampleGenerationStrategy: "request"
                        })
                    }),
                    streamRequestBody: undefined,
                    inlinedTypes: convertedSchema.inlinedTypes ?? {}
                };
            }

            return {
                requestBody: HttpRequestBody.inlinedRequestBody({
                    contentType,
                    docs: this.description,
                    name: this.context.casingsGenerator.generateName(this.schemaId),
                    extendedProperties: requestBodyTypeShape.extendedProperties,
                    extends: requestBodyTypeShape.extends,
                    properties: requestBodyTypeShape.properties,
                    extraProperties: requestBodyTypeShape.extraProperties,
                    v2Examples: this.convertMediaTypeObjectExamples({
                        mediaTypeObject,
                        exampleGenerationStrategy: "request"
                    })
                }),
                streamRequestBody: undefined,
                inlinedTypes: this.context.removeSchemaFromInlinedTypes({
                    id: this.schemaId,
                    inlinedTypes: convertedSchema.inlinedTypes
                })
            };
        } else {
            return {
                requestBody: HttpRequestBody.reference({
                    contentType,
                    docs: this.description,
                    requestBodyType: convertedSchema.type,
                    v2Examples: this.convertMediaTypeObjectExamples({
                        mediaTypeObject,
                        exampleGenerationStrategy: "request"
                    })
                }),
                streamRequestBody: undefined,
                inlinedTypes: convertedSchema.inlinedTypes ?? {}
            };
        }
    }

    private handleMultipartContent({ contentType }: { contentType: string }): RequestBodyConverter.Output | undefined {
        const mediaTypeObject = this.mediaType;
        if (mediaTypeObject == null || mediaTypeObject.schema == null) {
            return undefined;
        }
        const convertedSchema = this.parseMediaTypeObject({
            mediaTypeObject,
            schemaId: this.schemaId,
            resolveSchema: true,
            contentType
        });
        if (convertedSchema == null) {
            return undefined;
        }

        const requestBodyTypeShape = convertedSchema.schema?.typeDeclaration.shape;
        if (requestBodyTypeShape?.type === "object") {
            return {
                requestBody: HttpRequestBody.fileUpload({
                    contentType,
                    docs: this.description,
                    name: this.context.casingsGenerator.generateName(this.schemaId),
                    properties: requestBodyTypeShape.properties.map((property) => {
                        const encoding = mediaTypeObject.encoding?.[property.name.wireValue];
                        return this.convertRequestBodyProperty({ property, contentType, encoding });
                    }),
                    v2Examples: this.convertMediaTypeObjectExamples({
                        mediaTypeObject,
                        exampleGenerationStrategy: "request"
                    })
                }),
                streamRequestBody: undefined,
                inlinedTypes: this.context.removeSchemaFromInlinedTypes({
                    id: this.schemaId,
                    inlinedTypes: convertedSchema.inlinedTypes
                }),
                examples: convertedSchema.examples
            };
        }

        return undefined;
    }

    private handleBinaryContent({ contentType }: { contentType: string }): RequestBodyConverter.Output | undefined {
        const mediaTypeObject = this.mediaType;
        if (mediaTypeObject == null) {
            return undefined;
        }
        const convertedSchema = this.parseMediaTypeObject({
            mediaTypeObject,
            schemaId: this.schemaId,
            contentType
        });
        return {
            requestBody: HttpRequestBody.bytes({
                contentType,
                isOptional: this.required === false,
                docs: this.description,
                v2Examples: this.convertMediaTypeObjectExamples({
                    mediaTypeObject,
                    exampleGenerationStrategy: "request"
                })
            }),
            streamRequestBody: undefined,
            inlinedTypes: convertedSchema?.inlinedTypes ?? {}
        };
    }

    private convertRequestBodyProperty({
        property,
        contentType,
        encoding
    }: {
        property: ObjectProperty;
        contentType: string;
        encoding: OpenAPIV3_1.EncodingObject | undefined;
    }): FileUploadRequestProperty {
        const { isFile, isOptional, isArray } = this.recursivelyCheckTypeReferenceIsFile({
            typeReference: property.valueType
        });

        if (isFile) {
            if (isArray) {
                return FileUploadRequestProperty.file(
                    FileProperty.fileArray({
                        key: property.name,
                        isOptional,
                        contentType,
                        docs: property.docs
                    })
                );
            } else {
                return FileUploadRequestProperty.file(
                    FileProperty.file({
                        key: property.name,
                        isOptional,
                        contentType,
                        docs: property.docs
                    })
                );
            }
        }
        return FileUploadRequestProperty.bodyProperty({
            ...property,
            contentType: encoding?.contentType ?? contentType,
            style: getMultipartPartEncoding({ encoding }),
            name: property.name
        });
    }

    private handleStreamConditionJsonOrFormContent({
        contentType
    }: {
        contentType: string;
    }): RequestBodyConverter.Output | undefined {
        if (this.streamingExtension?.type !== "streamCondition") {
            return undefined;
        }
        const mediaTypeObject = this.mediaType;
        if (mediaTypeObject == null || mediaTypeObject.schema == null) {
            return undefined;
        }

        const resolvedMediaTypeSchema = this.context.resolveMaybeReference<OpenAPIV3_1.SchemaObject>({
            schemaOrReference: mediaTypeObject.schema,
            breadcrumbs: [...this.breadcrumbs, "content", contentType, "schema"]
        });
        if (resolvedMediaTypeSchema == null) {
            return undefined;
        }

        const streamConditionProperty =
            resolvedMediaTypeSchema.properties?.[this.streamingExtension.streamConditionProperty];
        if (streamConditionProperty == null || this.context.isReferenceObject(streamConditionProperty)) {
            return undefined;
        }

        const streamingOutput = this.buildStreamConditionInlinedRequestBody({
            streamConditionProperty,
            resolvedMediaTypeSchema,
            isStreaming: true,
            contentType,
            mediaTypeObject
        });

        const nonStreamingOutput = this.buildStreamConditionInlinedRequestBody({
            streamConditionProperty,
            resolvedMediaTypeSchema,
            isStreaming: false,
            contentType,
            mediaTypeObject
        });

        if (streamingOutput == null || nonStreamingOutput == null) {
            return undefined;
        }

        return {
            requestBody: nonStreamingOutput.requestBody,
            streamRequestBody: streamingOutput.requestBody,
            inlinedTypes: this.context.removeSchemaFromInlinedTypes({
                id: this.schemaId,
                inlinedTypes: {
                    ...streamingOutput.inlinedTypes,
                    ...nonStreamingOutput.inlinedTypes
                }
            })
        };
    }

    private buildStreamConditionInlinedRequestBody({
        streamConditionProperty,
        resolvedMediaTypeSchema,
        isStreaming,
        contentType,
        mediaTypeObject
    }: {
        streamConditionProperty: OpenAPIV3_1.SchemaObject;
        resolvedMediaTypeSchema: OpenAPIV3_1.SchemaObject;
        isStreaming: boolean;
        contentType: string;
        mediaTypeObject: OpenAPIV3_1.MediaTypeObject;
    }):
        | {
              requestBody: HttpRequestBody.InlinedRequestBody;
              inlinedTypes: Record<string, Converters.SchemaConverters.SchemaConverter.ConvertedSchema>;
          }
        | undefined {
        if (this.streamingExtension == null || this.streamingExtension.type !== "streamCondition") {
            return undefined;
        }
        const modifiedSchema = {
            ...resolvedMediaTypeSchema,
            properties: {
                ...resolvedMediaTypeSchema.properties,
                [this.streamingExtension.streamConditionProperty]: {
                    type: "boolean",
                    const: isStreaming,
                    ...streamConditionProperty
                } as OpenAPIV3_1.SchemaObject
            },
            required: [...(resolvedMediaTypeSchema.required ?? []), this.streamingExtension.streamConditionProperty]
        };

        const modifiedMediaTypeObject = {
            ...mediaTypeObject,
            schema: modifiedSchema
        };

        const convertedSchema = this.parseMediaTypeObject({
            mediaTypeObject: modifiedMediaTypeObject,
            schemaId: this.schemaId,
            contentType
        });

        if (convertedSchema == null) {
            return undefined;
        }
        const requestBodyTypeShape = convertedSchema.schema?.typeDeclaration.shape;
        if (requestBodyTypeShape?.type === "object") {
            return {
                requestBody: HttpRequestBody.inlinedRequestBody({
                    contentType,
                    docs: undefined,
                    name: this.context.casingsGenerator.generateName(
                        isStreaming ? `${this.schemaId}_streaming` : this.schemaId
                    ),
                    extendedProperties: requestBodyTypeShape.extendedProperties,
                    extends: requestBodyTypeShape.extends,
                    properties: requestBodyTypeShape.properties,
                    extraProperties: requestBodyTypeShape.extraProperties,
                    v2Examples: this.convertMediaTypeObjectExamples({
                        mediaTypeObject: modifiedMediaTypeObject,
                        exampleGenerationStrategy: "request"
                    })
                }),
                inlinedTypes: convertedSchema.inlinedTypes
            };
        }

        return undefined;
    }

    private recursivelyCheckTypeReferenceIsFile({
        typeReference,
        isOptional,
        isArray
    }: {
        typeReference: TypeReference;
        isOptional?: boolean;
        isArray?: boolean;
    }): {
        isFile: boolean;
        isOptional: boolean;
        isArray: boolean;
    } {
        if (this.context.isList(typeReference)) {
            return this.recursivelyCheckTypeReferenceIsFile({
                typeReference: typeReference.container.list,
                isOptional,
                isArray: true
            });
        }
        if (this.context.isOptional(typeReference)) {
            return this.recursivelyCheckTypeReferenceIsFile({
                typeReference: typeReference.container.optional,
                isOptional: true,
                isArray
            });
        }
        if (this.context.isNullable(typeReference)) {
            return this.recursivelyCheckTypeReferenceIsFile({
                typeReference: typeReference.container.nullable,
                isOptional,
                isArray
            });
        }
        return {
            isFile: this.context.isFile(typeReference),
            isOptional: isOptional ?? false,
            isArray: isArray ?? false
        };
    }

    private hasBodyQueryParameterOverlap(bodyProperties: ObjectProperty[]): boolean {
        if (this.queryParameters.length === 0) {
            return false;
        }

        const queryParameterNames = new Set(this.queryParameters.map((param) => param.name.wireValue.toLowerCase()));

        return bodyProperties.some((property) => queryParameterNames.has(property.name.wireValue.toLowerCase()));
    }
}

const CONTENT_TYPE_TO_ENCODING_MAP: Record<string, FileUploadBodyPropertyEncoding> = {
    "application/json": "json"
};

function getMultipartPartEncoding({
    encoding
}: {
    encoding: OpenAPIV3_1.EncodingObject | undefined;
}): FileUploadBodyPropertyEncoding | undefined {
    if (!encoding) {
        return undefined;
    }

    if (encoding.explode) {
        return "exploded";
    }

    if (encoding.style === "form") {
        return "form";
    }

    if (encoding.contentType) {
        return CONTENT_TYPE_TO_ENCODING_MAP[encoding.contentType];
    }

    return undefined;
}
