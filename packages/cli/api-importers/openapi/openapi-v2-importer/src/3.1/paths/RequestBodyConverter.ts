import { OpenAPIV3_1 } from "openapi-types";

import {
    FileProperty,
    FileUploadRequestProperty,
    HttpRequestBody,
    ObjectProperty,
    TypeDeclaration
} from "@fern-api/ir-sdk";

import { AbstractConverter } from "../../AbstractConverter";
import { ErrorCollector } from "../../ErrorCollector";
import { OpenAPIConverterContext3_1 } from "../OpenAPIConverterContext3_1";
import { SchemaOrReferenceConverter } from "../schema/SchemaOrReferenceConverter";

export declare namespace RequestBodyConverter {
    export interface Args extends AbstractConverter.Args {
        requestBody: OpenAPIV3_1.RequestBodyObject;
        group: string[];
        method: string;
    }

    export interface Output {
        requestBody: HttpRequestBody;
        inlinedTypes: Record<string, TypeDeclaration>;
    }
}

export class RequestBodyConverter extends AbstractConverter<
    OpenAPIConverterContext3_1,
    RequestBodyConverter.Output | undefined
> {
    private readonly requestBody: OpenAPIV3_1.RequestBodyObject;
    private readonly group: string[];
    private readonly method: string;

    constructor({ breadcrumbs, requestBody, group, method }: RequestBodyConverter.Args) {
        super({ breadcrumbs });
        this.requestBody = requestBody;
        this.group = group;
        this.method = method;
    }

    private tryGetConvertedSchema({
        schemaId,
        contentType,
        context,
        errorCollector
    }: {
        schemaId: string;
        contentType: string;
        context: OpenAPIConverterContext3_1;
        errorCollector: ErrorCollector;
    }): SchemaOrReferenceConverter.Output | undefined {
        const mediaTypeObject = this.requestBody.content[contentType];
        if (mediaTypeObject == null || mediaTypeObject.schema == null) {
            return undefined;
        }

        const schemaOrReferenceConverter = new SchemaOrReferenceConverter({
            breadcrumbs: [...this.breadcrumbs, "schema"],
            schemaOrReference: mediaTypeObject.schema,
            schemaIdOverride: schemaId
        });
        const convertedSchema = schemaOrReferenceConverter.convert({ context, errorCollector });
        if (convertedSchema == null) {
            return undefined;
        }

        return convertedSchema;
    }

    private convertRequestBodyProperty({
        context,
        property,
        contentType
    }: {
        context: OpenAPIConverterContext3_1;
        property: ObjectProperty;
        contentType: string;
    }) {
        if (context.isFile(property.valueType)) {
            return FileUploadRequestProperty.file(
                FileProperty.file({
                    key: property.name,
                    isOptional: false,
                    contentType
                })
            );
        } else if (
            context.isOptional(property.valueType) &&
            // @ts-expect-error: TS2339
            context.isFile(property.valueType.container.optional)
        ) {
            return FileUploadRequestProperty.file(
                FileProperty.file({
                    key: property.name,
                    isOptional: true,
                    contentType
                })
            );
        } else if (
            context.isList(property.valueType) &&
            // @ts-expect-error: TS2339
            context.isFile(property.valueType.container.list)
        ) {
            return FileUploadRequestProperty.file(
                FileProperty.fileArray({
                    key: property.name,
                    isOptional: false,
                    contentType
                })
            );
        } else if (
            context.isList(property.valueType) &&
            // @ts-expect-error: TS2339
            context.isOptional(property.valueType.container.list) &&
            // @ts-expect-error: TS2339
            context.isFile(property.valueType.container.list.container.optional)
        ) {
            return FileUploadRequestProperty.file(
                FileProperty.fileArray({
                    key: property.name,
                    isOptional: false,
                    contentType
                })
            );
        } else if (
            context.isOptional(property.valueType) &&
            // @ts-expect-error: TS2339
            context.isList(property.valueType.container.optional) &&
            // @ts-expect-error: TS2339
            context.isFile(property.valueType.container.optional.container.list)
        ) {
            return FileUploadRequestProperty.file(
                FileProperty.fileArray({
                    key: property.name,
                    isOptional: true,
                    contentType
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

    public convert({
        context,
        errorCollector
    }: {
        context: OpenAPIConverterContext3_1;
        errorCollector: ErrorCollector;
    }): RequestBodyConverter.Output | undefined {
        if (!this.requestBody.content) {
            return undefined;
        }

        const jsonContentTypes = Object.keys(this.requestBody.content).filter((type) => type.includes("json"));
        for (const contentType of [...jsonContentTypes]) {
            const schemaId = [...this.group, this.method, "Request"].join("_");
            const convertedSchema = this.tryGetConvertedSchema({
                schemaId,
                contentType,
                context,
                errorCollector
            });
            if (convertedSchema == null) {
                continue;
            }

            if (convertedSchema.schema?.shape.type === "object") {
                const requestBody = HttpRequestBody.inlinedRequestBody({
                    contentType,
                    docs: this.requestBody.description,
                    name: context.casingsGenerator.generateName(schemaId),
                    extendedProperties: convertedSchema.schema?.shape.extendedProperties,
                    extends: convertedSchema.schema?.shape.extends,
                    properties: convertedSchema.schema?.shape.properties,
                    extraProperties: convertedSchema.schema?.shape.extraProperties
                });

                return {
                    requestBody,
                    inlinedTypes: Object.fromEntries(
                        Object.entries(convertedSchema.inlinedTypes).filter(([key]) => key !== schemaId)
                    )
                };
            } else {
                const requestBody = HttpRequestBody.reference({
                    contentType,
                    docs: this.requestBody.description,
                    requestBodyType: convertedSchema.type
                });

                return {
                    requestBody,
                    inlinedTypes: convertedSchema.inlinedTypes
                };
            }
        }

        const multipartContentTypes = Object.keys(this.requestBody.content).filter((type) =>
            type.includes("multipart")
        );
        for (const contentType of multipartContentTypes) {
            const schemaId = [...this.group, this.method, "Request"].join("_");
            const convertedSchema = this.tryGetConvertedSchema({
                schemaId,
                contentType,
                context,
                errorCollector
            });
            if (convertedSchema == null) {
                continue;
            }

            if (convertedSchema.schema?.shape.type === "object") {
                const requestBody = HttpRequestBody.fileUpload({
                    docs: this.requestBody.description,
                    name: context.casingsGenerator.generateName(schemaId),
                    properties: convertedSchema.schema?.shape.properties.map((property) => {
                        return this.convertRequestBodyProperty({ context, property, contentType });
                    })
                });
                return {
                    requestBody,
                    inlinedTypes: Object.fromEntries(
                        Object.entries(convertedSchema.inlinedTypes).filter(([key]) => key !== schemaId)
                    )
                };
            }
        }

        const urlEncodedContentTypes = Object.keys(this.requestBody.content).filter((type) =>
            type.includes("urlencoded")
        );

        return undefined;
    }
}
