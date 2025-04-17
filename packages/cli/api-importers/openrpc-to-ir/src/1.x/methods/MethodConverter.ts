import { ContentDescriptorObject, MethodObject } from "@open-rpc/meta-schema";
import { OpenAPIV3 } from "openapi-types";

import {
    HttpEndpoint,
    HttpPath,
    HttpRequestBody,
    InlinedRequestBodyProperty,
    PathParameter,
    PrimitiveTypeV2,
    TypeDeclaration,
    TypeId,
    TypeReference
} from "@fern-api/ir-sdk";
import { AbstractConverter, Converters } from "@fern-api/v2-importer-commons";

import { OpenRPCConverter } from "../OpenRPCConverter";
import { OpenRPCConverterContext3_1 } from "../OpenRPCConverterContext3_1";

export declare namespace MethodConverter {
    export interface Args extends OpenRPCConverter.Args {
        method: MethodObject;
    }

    export interface Output {
        endpoint: HttpEndpoint;
        inlinedTypes: Record<TypeId, TypeDeclaration>;
    }
}

export class MethodConverter extends AbstractConverter<OpenRPCConverterContext3_1, MethodConverter.Output> {
    public static STRING = TypeReference.primitive({
        v1: "STRING",
        v2: PrimitiveTypeV2.string({
            default: undefined,
            validation: undefined
        })
    });

    private readonly method: MethodObject;

    constructor({ context, breadcrumbs, method }: MethodConverter.Args) {
        super({ context, breadcrumbs });
        this.method = method;
    }

    public async convert(): Promise<MethodConverter.Output | undefined> {
        let inlinedTypes: Record<TypeId, TypeDeclaration> = {};

        const apiKeyPathParameter: PathParameter = {
            name: this.context.casingsGenerator.generateName("apiKey"),
            docs: undefined,
            valueType: MethodConverter.STRING,
            location: "ENDPOINT",
            variable: undefined,
            v2Examples: undefined
        };
        const path: HttpPath = {
            head: "/",
            parts: [
                {
                    pathParameter: "apiKey",
                    tail: ""
                }
            ]
        };

        const requestProperties: InlinedRequestBodyProperty[] = [];
        for (const param of this.method.params) {
            let resolvedParam: ContentDescriptorObject;
            if (this.context.isReferenceObject(param)) {
                const resolvedParamResponse = await this.context.resolveReference<ContentDescriptorObject>(param);
                if (resolvedParamResponse.resolved) {
                    resolvedParam = resolvedParamResponse.value;
                } else {
                    continue;
                }
            } else {
                resolvedParam = param;
            }

            const parameterSchemaConverter = new Converters.SchemaConverters.SchemaOrReferenceConverter({
                breadcrumbs: [...this.breadcrumbs, "params"],
                context: this.context,
                schemaOrReference: resolvedParam.schema as OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject
            });
            const schemaId = [...this.method.name, "Request", resolvedParam.name].join("_");
            const schema = await parameterSchemaConverter.convert();
            if (schema != null) {
                requestProperties.push({
                    docs: resolvedParam.description,
                    availability: await this.context.getAvailability({
                        node: param,
                        breadcrumbs: [...this.breadcrumbs, "parameters"]
                    }),
                    name: this.context.casingsGenerator.generateNameAndWireValue({
                        name: resolvedParam.name,
                        wireValue: resolvedParam.name
                    }),
                    valueType: schema.type,
                    v2Examples: undefined
                });
                inlinedTypes = {
                    ...schema.inlinedTypes,
                    ...inlinedTypes,
                    ...(schema.schema != null ? { [schemaId]: schema.schema } : {})
                };
            }
        }

        const endpoint: HttpEndpoint = {
            baseUrl: undefined,
            basePath: undefined,
            auth: false,
            method: "POST",
            id: this.method.name,
            docs: this.method.description,
            name: this.context.casingsGenerator.generateName(this.method.name),
            headers: [],
            displayName: this.method.name,
            pathParameters: [apiKeyPathParameter],
            queryParameters: [],
            allPathParameters: [apiKeyPathParameter],
            path,
            fullPath: path,
            requestBody:
                requestProperties.length > 0
                    ? HttpRequestBody.inlinedRequestBody({
                          name: this.context.casingsGenerator.generateName([this.method.name, "Request"].join("_")),
                          docs: undefined,
                          properties: requestProperties,
                          extends: [],
                          extendedProperties: [],
                          contentType: "application/json",
                          extraProperties: false,
                          v2Examples: undefined
                      })
                    : undefined,
            sdkRequest: undefined,
            response: undefined,
            errors: [],
            idempotent: false,
            pagination: undefined,
            userSpecifiedExamples: [],
            autogeneratedExamples: [],
            v2Examples: undefined,
            transport: undefined,
            availability: undefined
        };

        return {
            endpoint,
            inlinedTypes
        };
    }
}
