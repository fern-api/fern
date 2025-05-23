import { OpenAPIV3_1 } from "openapi-types";

import { MediaType } from "@fern-api/core-utils";
import {
    FileProperty,
    FileUploadRequestProperty,
    HttpRequestBody,
    ObjectProperty,
    TypeReference
} from "@fern-api/ir-sdk";
import { Converters } from "@fern-api/v2-importer-commons";

import { FernStreamingExtension } from "../../extensions/x-fern-streaming";

export declare namespace RequestBodyConverter {
    export interface Args extends Converters.AbstractConverters.AbstractMediaTypeObjectConverter.Args {
        requestBody: OpenAPIV3_1.RequestBodyObject;
        streamingExtension: FernStreamingExtension.Output | undefined;
    }

    export interface Output extends Converters.AbstractConverters.AbstractMediaTypeObjectConverter.Output {
        requestBody: HttpRequestBody;
        streamRequestBody: HttpRequestBody | undefined;
    }
}

export class RequestBodyConverter extends Converters.AbstractConverters.AbstractMediaTypeObjectConverter {
    private readonly requestBody: OpenAPIV3_1.RequestBodyObject;
    protected readonly schemaId: string;
    private readonly streamingExtension: FernStreamingExtension.Output | undefined;

    constructor({ context, breadcrumbs, requestBody, group, method, streamingExtension }: RequestBodyConverter.Args) {
        super({ context, breadcrumbs, group, method });
        this.requestBody = requestBody;
        this.schemaId = [...this.group, this.method, "Request"].join("_");
        this.streamingExtension = streamingExtension;
    }

    public convert(): RequestBodyConverter.Output | undefined {
        if (!this.requestBody.content) {
            return undefined;
        }

        const jsonContentTypes = Object.keys(this.requestBody.content).filter((type) => {
            return MediaType.parse(type)?.isJSON();
        });
        for (const contentType of jsonContentTypes) {
            const result = this.handleJsonOrFormContent({ contentType });
            if (result != null) {
                return result;
            }
        }

        const urlEncodedContentTypes = Object.keys(this.requestBody.content).filter((type) => {
            return MediaType.parse(type)?.isURLEncoded();
        });
        for (const contentType of urlEncodedContentTypes) {
            const result = this.handleJsonOrFormContent({ contentType });
            if (result != null) {
                return result;
            }
        }

        const plainTextContentTypes = Object.keys(this.requestBody.content).filter((type) => {
            return MediaType.parse(type)?.isPlainText();
        });
        for (const contentType of plainTextContentTypes) {
            const result = this.handleJsonOrFormContent({ contentType });
            if (result != null) {
                return result;
            }
        }

        const multipartContentTypes = Object.keys(this.requestBody.content).filter((type) => {
            return MediaType.parse(type)?.isMultipart();
        });
        for (const contentType of multipartContentTypes) {
            const result = this.handleMultipartContent({ contentType });
            if (result != null) {
                return result;
            }
        }

        const octetStreamContentTypes = Object.keys(this.requestBody.content).filter((type) => {
            return MediaType.parse(type)?.isOctetStream();
        });
        for (const contentType of octetStreamContentTypes) {
            const result = this.handleOctetStreamContent({ contentType });
            if (result != null) {
                return result;
            }
        }

        return undefined;
    }

    private handleJsonOrFormContent({ contentType }: { contentType: string }): RequestBodyConverter.Output | undefined {
        const mediaTypeObject = this.requestBody.content[contentType];
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

        if (convertedSchema.schema?.typeDeclaration.shape.type === "object") {
            return {
                requestBody: HttpRequestBody.inlinedRequestBody({
                    contentType,
                    docs: this.requestBody.description,
                    name: this.context.casingsGenerator.generateName(this.schemaId),
                    extendedProperties: convertedSchema.schema?.typeDeclaration.shape.extendedProperties,
                    extends: convertedSchema.schema?.typeDeclaration.shape.extends,
                    properties: convertedSchema.schema?.typeDeclaration.shape.properties,
                    extraProperties: convertedSchema.schema?.typeDeclaration.shape.extraProperties,
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
                    docs: this.requestBody.description,
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
        const mediaTypeObject = this.requestBody.content[contentType];
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

        if (convertedSchema.schema?.typeDeclaration.shape.type === "object") {
            return {
                requestBody: HttpRequestBody.fileUpload({
                    contentType,
                    docs: this.requestBody.description,
                    name: this.context.casingsGenerator.generateName(this.schemaId),
                    properties: convertedSchema.schema?.typeDeclaration.shape.properties.map((property) => {
                        return this.convertRequestBodyProperty({ property, contentType });
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

    private handleOctetStreamContent({
        contentType
    }: {
        contentType: string;
    }): RequestBodyConverter.Output | undefined {
        const mediaTypeObject = this.requestBody.content[contentType];
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
                isOptional: this.requestBody.required === false,
                docs: this.requestBody.description,
                v2Examples: this.convertMediaTypeObjectExamples({
                    mediaTypeObject,
                    exampleGenerationStrategy: "request"
                })
            }),
            streamRequestBody: undefined,
            inlinedTypes: convertedSchema?.inlinedTypes ?? {}
        };
    }

    private convertRequestBodyProperty({ property, contentType }: { property: ObjectProperty; contentType: string }) {
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
            contentType,
            style: undefined,
            name: property.name
        });
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
}
