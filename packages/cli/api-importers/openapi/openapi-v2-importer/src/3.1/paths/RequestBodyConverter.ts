import { HttpRequestBody, TypeDeclaration } from "@fern-api/ir-sdk";
import { OpenAPIV3_1 } from "openapi-types";
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

export class RequestBodyConverter extends AbstractConverter<OpenAPIConverterContext3_1, RequestBodyConverter.Output | undefined> {
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
        if (!this.requestBody.content) {
            return undefined;
        }

        const jsonContentTypes = Object.keys(this.requestBody.content).filter(type => type.includes('json'));
        const multipartContentTypes = Object.keys(this.requestBody.content).filter(type => type.includes('multipart'));
        const urlEncodedContentTypes = Object.keys(this.requestBody.content).filter(type => type.includes('x-www-form-urlencoded'));

        for (const contentType of [...jsonContentTypes, ...multipartContentTypes, ...urlEncodedContentTypes]) {
            const mediaTypeObject = this.requestBody.content[contentType];
            if (mediaTypeObject == null) {
                continue;
            }
            if (mediaTypeObject.schema == null) {
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

            if (convertedSchema.schema?.shape.type === "object") {
                const requestBody = HttpRequestBody.inlinedRequestBody({
                    contentType: contentType,
                    docs: this.requestBody.description,
                    name: context.casingsGenerator.generateName(schemaId),
                    extendedProperties: convertedSchema.schema?.shape.extendedProperties,
                    extends: convertedSchema.schema?.shape.extends,
                    properties: convertedSchema.schema?.shape.properties,
                    extraProperties: convertedSchema.schema?.shape.extraProperties
                });
                return {
                    requestBody,
                    inlinedTypes: convertedSchema.inlinedTypes
                }
            }
        }

        return undefined;
    }
}
