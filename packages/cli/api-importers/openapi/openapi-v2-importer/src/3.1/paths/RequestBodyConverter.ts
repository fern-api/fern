import { OpenAPIV3_1 } from "openapi-types";

import { FileUploadRequestProperty, HttpRequestBody, TypeDeclaration } from "@fern-api/ir-sdk";

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

    public convert({
        context,
        errorCollector
    }: {
        context: OpenAPIConverterContext3_1;
        errorCollector: ErrorCollector;
    }): RequestBodyConverter.Output | undefined {
        console.log("Request Body (v3 RequestBodyConverter)", JSON.stringify(this.requestBody, null, 2));
        if (!this.requestBody.content) {
            return undefined;
        }

        const jsonContentTypes = Object.keys(this.requestBody.content).filter((type) => type.includes("json"));
        const multipartContentTypes = Object.keys(this.requestBody.content).filter((type) => type.includes("multipart")); 
        const urlEncodedContentTypes = Object.keys(this.requestBody.content).filter((type) => type.includes("urlencoded"));

        for (const contentType of [...jsonContentTypes, ...multipartContentTypes, ...urlEncodedContentTypes]) {
            const mediaTypeObject = this.requestBody.content[contentType];
            if (mediaTypeObject == null || mediaTypeObject.schema == null) {
                continue;
            }

            const schemaId = [...this.group, this.method, "Request"].join("_");
            const schemaOrReferenceConverter = new SchemaOrReferenceConverter({
                breadcrumbs: [...this.breadcrumbs, "schema"],
                schemaOrReference: mediaTypeObject.schema,
                schemaIdOverride: schemaId
            });
            const convertedSchema = schemaOrReferenceConverter.convert({ context, errorCollector });
            if (convertedSchema == null) {
                continue;
            }

            console.log("Converted Schema (v3 RequestBodyConverter)", JSON.stringify(convertedSchema, null, 2));

            if (convertedSchema.schema?.shape.type === "object") {
                let requestBody: HttpRequestBody;
                if (contentType.includes("multipart")) {
                    // if the schema is an object, return a HttpRequestBody.fileUpload instance
                    requestBody = HttpRequestBody.fileUpload({
                        docs: this.requestBody.description,
                        name: context.casingsGenerator.generateName(schemaId),
                        properties: convertedSchema.schema?.shape.properties.map((property) => {
                            return FileUploadRequestProperty.bodyProperty({
                                ...property,
                                contentType,
                                style: "form",
                                name: property.name
                            })
                        })
                    });
                } else {
                    // if the schema is an object, return a HttpRequestBody.inlinedRequestBody instance
                    requestBody = HttpRequestBody.inlinedRequestBody({
                        contentType,
                        docs: this.requestBody.description,
                        name: context.casingsGenerator.generateName(schemaId),
                        extendedProperties: convertedSchema.schema?.shape.extendedProperties,
                        extends: convertedSchema.schema?.shape.extends,
                        properties: convertedSchema.schema?.shape.properties,
                        extraProperties: convertedSchema.schema?.shape.extraProperties
                    });
                }
                console.log("Returned (v3 RequestBodyConverter)", JSON.stringify({
                    requestBody,
                    inlinedTypes: Object.fromEntries(
                        Object.entries(convertedSchema.inlinedTypes).filter(([key]) => key !== schemaId)
                    )
                }, null, 2));
                return {
                    requestBody,
                    inlinedTypes: Object.fromEntries(
                        Object.entries(convertedSchema.inlinedTypes).filter(([key]) => key !== schemaId)
                    )
                };
            }
        }

        return undefined;
    }
}
