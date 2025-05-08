import { OpenAPIV3_1 } from "openapi-types";

import {
    FileProperty,
    FileUploadRequestProperty,
    HttpRequestBody,
    ObjectProperty,
    TypeReference
} from "@fern-api/ir-sdk";
import { Converters } from "@fern-api/v2-importer-commons";

export declare namespace RequestBodyConverter {
    export interface Args extends Converters.AbstractConverters.AbstractMediaTypeObjectConverter.Args {
        requestBody: OpenAPIV3_1.RequestBodyObject;
    }

    export interface Output extends Converters.AbstractConverters.AbstractMediaTypeObjectConverter.Output {
        requestBody: HttpRequestBody;
    }
}

export class RequestBodyConverter extends Converters.AbstractConverters.AbstractMediaTypeObjectConverter {
    private readonly requestBody: OpenAPIV3_1.RequestBodyObject;

    constructor({ context, breadcrumbs, requestBody, group, method }: RequestBodyConverter.Args) {
        super({ context, breadcrumbs, group, method });
        this.requestBody = requestBody;
    }

    public convert(): RequestBodyConverter.Output | undefined {
        if (!this.requestBody.content) {
            return undefined;
        }

        const jsonContentTypes = Object.keys(this.requestBody.content).filter((type) => type.includes("json"));
        for (const contentType of jsonContentTypes) {
            const result = this.handleJsonOrFormContent({ contentType });
            if (result != null) {
                return result;
            }
        }

        const multipartContentTypes = Object.keys(this.requestBody.content).filter((type) =>
            type.includes("multipart")
        );
        for (const contentType of multipartContentTypes) {
            const mediaTypeObject = this.requestBody.content[contentType];
            const schemaId = [...this.group, this.method, "Request"].join("_");
            const convertedSchema = this.parseMediaTypeObject({
                mediaTypeObject,
                schemaId
            });
            if (convertedSchema == null) {
                continue;
            }

            if (convertedSchema.schema?.shape.type === "object") {
                const requestBody = HttpRequestBody.fileUpload({
                    contentType,
                    docs: this.requestBody.description,
                    name: this.context.casingsGenerator.generateName(schemaId),
                    properties: convertedSchema.schema?.shape.properties.map((property) => {
                        return this.convertRequestBodyProperty({ property, contentType });
                    }),
                    v2Examples: this.convertMediaTypeObjectExamples({
                        mediaTypeObject,
                        exampleGenerationStrategy: "request"
                    })
                });
                return {
                    requestBody,
                    inlinedTypes: this.context.removeSchemaFromInlinedTypes({
                        id: schemaId,
                        inlinedTypes: convertedSchema.inlinedTypes
                    }),
                    examples: convertedSchema.examples
                };
            }
        }

        const urlEncodedContentTypes = Object.keys(this.requestBody.content).filter((type) =>
            type.includes("urlencoded")
        );
        for (const contentType of urlEncodedContentTypes) {
            const result = this.handleJsonOrFormContent({ contentType });
            if (result != null) {
                return result;
            }
        }

        return undefined;
    }

    private handleJsonOrFormContent({ contentType }: { contentType: string }): RequestBodyConverter.Output | undefined {
        const schemaId = [...this.group, this.method, "Request"].join("_");
        const mediaTypeObject = this.requestBody.content[contentType];
        const convertedSchema = this.parseMediaTypeObject({
            mediaTypeObject,
            schemaId
        });
        if (convertedSchema == null) {
            return undefined;
        }

        if (convertedSchema.schema?.shape.type === "object") {
            const requestBody = HttpRequestBody.inlinedRequestBody({
                contentType,
                docs: this.requestBody.description,
                name: this.context.casingsGenerator.generateName(schemaId),
                extendedProperties: convertedSchema.schema?.shape.extendedProperties,
                extends: convertedSchema.schema?.shape.extends,
                properties: convertedSchema.schema?.shape.properties,
                extraProperties: convertedSchema.schema?.shape.extraProperties,
                v2Examples: this.convertMediaTypeObjectExamples({
                    mediaTypeObject,
                    exampleGenerationStrategy: "request"
                })
            });

            return {
                requestBody,
                inlinedTypes: this.context.removeSchemaFromInlinedTypes({
                    id: schemaId,
                    inlinedTypes: convertedSchema.inlinedTypes
                })
            };
        } else {
            const requestBody = HttpRequestBody.reference({
                contentType,
                docs: this.requestBody.description,
                requestBodyType: convertedSchema.type,
                v2Examples: this.convertMediaTypeObjectExamples({
                    mediaTypeObject,
                    exampleGenerationStrategy: "request"
                })
            });

            return {
                requestBody,
                inlinedTypes: convertedSchema.inlinedTypes ?? {}
            };
        }
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
        if (this.context.isFile(typeReference)) {
            return { isFile: true, isOptional: isOptional ?? false, isArray: isArray ?? false };
        } else {
            return { isFile: false, isOptional: isOptional ?? false, isArray: isArray ?? false };
        }
    }
}
