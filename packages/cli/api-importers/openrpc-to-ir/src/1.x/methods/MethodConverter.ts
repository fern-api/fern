import { ContentDescriptorObject, ExampleObject, ExamplePairingObject, MethodObject } from "@open-rpc/meta-schema";
import { OpenAPIV3 } from "openapi-types";

import {
    FernIr,
    HttpEndpoint,
    HttpEndpointSource,
    HttpPath,
    HttpRequestBody,
    HttpResponseBody,
    InlinedRequestBodyProperty,
    JsonResponse,
    JsonResponseBody,
    PathParameter,
    PrimitiveTypeV2,
    TypeDeclaration,
    TypeId,
    TypeReference
} from "@fern-api/ir-sdk";
import { constructHttpPath } from "@fern-api/ir-utils";
import { AbstractConverter, Converters } from "@fern-api/v2-importer-commons";

import { OpenRPCConverter } from "../OpenRPCConverter";
import { OpenRPCConverterContext3_1 } from "../OpenRPCConverterContext3_1";

export declare namespace MethodConverter {
    export interface Args extends OpenRPCConverter.Args {
        method: MethodObject;
        pathParameters?: PathParameter[];
        queryParameters?: FernIr.QueryParameter[];
        headers?: FernIr.HttpHeader[];
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
    private readonly pathParameters: PathParameter[];
    private readonly queryParameters: FernIr.QueryParameter[];
    private readonly headers: FernIr.HttpHeader[];

    constructor({ context, breadcrumbs, method, pathParameters = [], queryParameters = [], headers = [] }: MethodConverter.Args) {
        super({ context, breadcrumbs });
        this.method = method;
        this.pathParameters = pathParameters;
        this.queryParameters = queryParameters;
        this.headers = headers;
    }

    public async convert(): Promise<MethodConverter.Output | undefined> {
        let inlinedTypes: Record<TypeId, TypeDeclaration> = {};

        // Construct the path with all path parameters
        let pathString = "";
        for (const pathParam of this.pathParameters) {
            pathString += `/{${pathParam.name.originalName}}`;
        }
        const path: HttpPath = constructHttpPath(pathString);

        const requestProperties: InlinedRequestBodyProperty[] = [];
        for (const [index, param] of this.method.params.entries()) {
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
            const schemaId = [this.method.name, "Param", resolvedParam.name].join("_");
            const parameterSchemaConverter = new Converters.SchemaConverters.SchemaOrReferenceConverter({
                breadcrumbs: [...this.breadcrumbs, `params[${index}]`],
                schemaIdOverride: schemaId,
                context: this.context,
                schemaOrReference: resolvedParam.schema as OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject
            });
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
                    v2Examples: schema.schema?.v2Examples
                });
                inlinedTypes = {
                    ...schema.inlinedTypes,
                    ...inlinedTypes,
                    ...(schema.schema != null ? { [schemaId]: schema.schema } : {})
                };
            }
        }

        let jsonResponseBody: JsonResponseBody | undefined = undefined;
        if (this.method.result != null) {
            const resolvedResult = await this.context.resolveMaybeReference<ContentDescriptorObject>({
                schemaOrReference: this.method.result,
                breadcrumbs: [...this.breadcrumbs, "result"]
            });

            if (resolvedResult != null) {
                const resultSchemaConverter = new Converters.SchemaConverters.SchemaOrReferenceConverter({
                    breadcrumbs: [this.method.name, "result"],
                    context: this.context,
                    schemaOrReference: resolvedResult.schema as OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject
                });
                const schemaId = [...this.method.name, "Result"].join("_");
                const schema = await resultSchemaConverter.convert();
                if (schema != null) {
                    jsonResponseBody = {
                        docs: resolvedResult.description,
                        v2Examples: schema?.schema?.v2Examples,
                        responseBodyType: schema.type
                    };
                    inlinedTypes = {
                        ...schema.inlinedTypes,
                        ...inlinedTypes,
                        ...(schema.schema != null ? { [schemaId]: schema.schema } : {})
                    };
                }
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
            headers: this.headers,
            displayName: this.method.name,
            pathParameters: this.pathParameters,
            queryParameters: this.queryParameters,
            allPathParameters: this.pathParameters,
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
            response:
                jsonResponseBody != null
                    ? { body: HttpResponseBody.json(JsonResponse.response(jsonResponseBody)), statusCode: undefined }
                    : undefined,
            errors: [],
            idempotent: false,
            pagination: undefined,
            userSpecifiedExamples: [],
            autogeneratedExamples: [],
            v2Examples: {
                autogeneratedExamples: {},
                userSpecifiedExamples: await this.convertExamples()
            },
            transport: undefined,
            availability: undefined,
            source: HttpEndpointSource.openrpc()
        };

        return {
            endpoint,
            inlinedTypes
        };
    }

    private async convertExamples(): Promise<Record<string, FernIr.V2HttpEndpointExample>> {
        const examples: Record<string, FernIr.V2HttpEndpointExample> = {};

        // If there are examples in the method, convert them
        let i = 0;
        if (this.method.examples && this.method.examples.length > 0) {
            for (const example of this.method.examples ?? []) {
                let resolvedExample: ExamplePairingObject;
                if (this.context.isReferenceObject(example)) {
                    const resolvedExampleResponse = await this.context.resolveReference<ExamplePairingObject>(example);
                    if (resolvedExampleResponse.resolved) {
                        resolvedExample = resolvedExampleResponse.value;
                    } else {
                        continue;
                    }
                } else {
                    resolvedExample = example;
                }

                // Extract the result from the example
                let resolvedResult: ExampleObject | undefined;
                if (resolvedExample.result) {
                    if (this.context.isReferenceObject(resolvedExample.result)) {
                        const resolvedResultResponse = await this.context.resolveReference<ExampleObject>(
                            resolvedExample.result
                        );
                        if (resolvedResultResponse.resolved) {
                            resolvedResult = resolvedResultResponse.value;
                        }
                    } else {
                        resolvedResult = resolvedExample.result;
                    }
                }

                const exampleName = resolvedExample.name ?? `Example ${i + 1}`;

                // Extract the request params from the example
                let resolvedParams: ExampleObject[] = [];
                if (resolvedExample.params && Array.isArray(resolvedExample.params)) {
                    resolvedParams = [];
                    for (const param of resolvedExample.params) {
                        if (this.context.isReferenceObject(param)) {
                            const resolvedParamResponse = await this.context.resolveReference<ExampleObject>(param);
                            if (resolvedParamResponse.resolved) {
                                resolvedParams.push(resolvedParamResponse.value);
                            } else {
                                continue;
                            }
                        } else {
                            resolvedParams.push(param);
                        }
                    }
                }

                // Create the example with request and response
                examples[exampleName] = {
                    request: {
                        docs: undefined,
                        endpoint: {
                            method: "POST",
                            path: "/{apiKey}"
                        },
                        baseUrl: undefined,
                        environment: undefined,
                        auth: undefined,
                        pathParameters: {},
                        queryParameters: {},
                        headers: {},
                        requestBody: resolvedParams.map((param) => param.value) ?? undefined
                    },
                    response: {
                        docs: undefined,
                        statusCode: undefined,
                        body: resolvedResult?.value
                            ? FernIr.V2HttpEndpointResponseBody.json({
                                  jsonrpc: "2.0",
                                  id: resolvedExample.examplePairedRequest?.id || "1",
                                  result: resolvedResult.value
                              })
                            : undefined
                    },
                    codeSamples: []
                };
            }

            ++i;
        }

        return examples;
    }
}
