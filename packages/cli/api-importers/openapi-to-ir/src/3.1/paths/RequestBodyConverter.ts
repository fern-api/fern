import { OpenAPIV3_1 } from "openapi-types";

import { FileProperty, FileUploadRequestProperty, HttpRequestBody, ObjectProperty } from "@fern-api/ir-sdk";
import { Converters, ErrorCollector } from "@fern-api/v2-importer-commons";

export declare namespace RequestBodyConverter {
    export interface Args extends Converters.AbstractConverters.AbstractMediaTypeConverter.Args {
        requestBody: OpenAPIV3_1.RequestBodyObject;
    }

    export interface Output extends Converters.AbstractConverters.AbstractMediaTypeConverter.Output {
        requestBody: HttpRequestBody;
    }
}

export class RequestBodyConverter extends Converters.AbstractConverters.AbstractMediaTypeConverter {
    private readonly requestBody: OpenAPIV3_1.RequestBodyObject;

    constructor({ context, breadcrumbs, requestBody, group, method }: RequestBodyConverter.Args) {
        super({ context, breadcrumbs, group, method });
        this.requestBody = requestBody;
    }

    public async convert({
        errorCollector
    }: {
        errorCollector: ErrorCollector;
    }): Promise<RequestBodyConverter.Output | undefined> {
        if (!this.requestBody.content) {
            return undefined;
        }

        const jsonContentTypes = Object.keys(this.requestBody.content).filter((type) => type.includes("json"));
        for (const contentType of jsonContentTypes) {
            const result = this.handleJsonOrFormContent({ contentType, errorCollector });
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
            const convertedSchema = await this.parseMediaTypeObject({
                mediaTypeObject,
                schemaId,
                contentType,
                errorCollector
            });
            if (convertedSchema == null) {
                continue;
            }

            if (convertedSchema.schema?.shape.type === "object") {
                const requestBody = HttpRequestBody.fileUpload({
                    docs: this.requestBody.description,
                    name: this.context.casingsGenerator.generateName(schemaId),
                    properties: convertedSchema.schema?.shape.properties.map((property) => {
                        return this.convertRequestBodyProperty({ property, contentType });
                    }),
                    v2Examples: await this.convertMediaTypeObjectExamples({
                        mediaTypeObject,
                        errorCollector
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
            const result = this.handleJsonOrFormContent({ contentType, errorCollector });
            if (result != null) {
                return result;
            }
        }

        return undefined;
    }

    private async handleJsonOrFormContent({
        contentType,
        errorCollector
    }: {
        contentType: string;
        errorCollector: ErrorCollector;
    }): Promise<RequestBodyConverter.Output | undefined> {
        const schemaId = [...this.group, this.method, "Request"].join("_");
        const mediaTypeObject = this.requestBody.content[contentType];
        const convertedSchema = await this.parseMediaTypeObject({
            mediaTypeObject,
            schemaId,
            contentType,
            errorCollector
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
                v2Examples: await this.convertMediaTypeObjectExamples({
                    mediaTypeObject,
                    errorCollector
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
                requestBodyType: convertedSchema.type
            });

            return {
                requestBody,
                inlinedTypes: convertedSchema.inlinedTypes ?? {}
            };
        }
    }

    private convertRequestBodyProperty({ property, contentType }: { property: ObjectProperty; contentType: string }) {
        if (this.context.isFile(property.valueType)) {
            return FileUploadRequestProperty.file(
                FileProperty.file({
                    key: property.name,
                    isOptional: false,
                    contentType,
                    docs: property.docs
                })
            );
        }
        if (this.context.isOptional(property.valueType) && this.context.isFile(property.valueType.container.optional)) {
            return FileUploadRequestProperty.file(
                FileProperty.file({
                    key: property.name,
                    isOptional: true,
                    contentType,
                    docs: property.docs
                })
            );
        }
        if (this.context.isList(property.valueType) && this.context.isFile(property.valueType.container.list)) {
            return FileUploadRequestProperty.file(
                FileProperty.fileArray({
                    key: property.name,
                    isOptional: false,
                    contentType,
                    docs: property.docs
                })
            );
        }
        if (
            this.context.isList(property.valueType) &&
            this.context.isOptional(property.valueType.container.list) &&
            this.context.isFile(property.valueType.container.list.container.optional)
        ) {
            return FileUploadRequestProperty.file(
                FileProperty.fileArray({
                    key: property.name,
                    isOptional: false,
                    contentType,
                    docs: property.docs
                })
            );
        }
        if (
            this.context.isOptional(property.valueType) &&
            this.context.isList(property.valueType.container.optional) &&
            this.context.isFile(property.valueType.container.optional.container.list)
        ) {
            return FileUploadRequestProperty.file(
                FileProperty.fileArray({
                    key: property.name,
                    isOptional: true,
                    contentType,
                    docs: property.docs
                })
            );
        }
        return FileUploadRequestProperty.bodyProperty({
            ...property,
            contentType,
            style: undefined,
            name: property.name
        });
    }
}
