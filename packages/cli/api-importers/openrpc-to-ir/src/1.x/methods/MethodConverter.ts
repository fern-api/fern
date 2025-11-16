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
    TypeId
} from "@fern-api/ir-sdk";
import { constructHttpPath } from "@fern-api/ir-utils";
import { AbstractConverter, Converters, ServersConverter } from "@fern-api/v3-importer-commons";
import {
    ContentDescriptorObject,
    ExampleObject,
    ExamplePairingObject,
    MethodObject,
    ServerObject
} from "@open-rpc/meta-schema";
import { OpenAPIV3 } from "openapi-types";

import { OpenRPCConverterContext3_1 } from "../OpenRPCConverterContext3_1";

export declare namespace MethodConverter {
    export interface Args extends AbstractConverter.Args<OpenRPCConverterContext3_1> {
        method: MethodObject;
        pathParameters?: PathParameter[];
        queryParameters?: FernIr.QueryParameter[];
        headers?: FernIr.HttpHeader[];
        topLevelServers?: ServerObject[];
    }

    export interface Output {
        endpoint: HttpEndpoint;
        audiences: string[];
        inlinedTypes: Record<TypeId, Converters.SchemaConverters.SchemaConverter.ConvertedSchema>;
        servers?: ServerObject[];
    }
}

export class MethodConverter extends AbstractConverter<OpenRPCConverterContext3_1, MethodConverter.Output> {
    private readonly method: MethodObject;
    private readonly pathParameters: PathParameter[];
    private readonly queryParameters: FernIr.QueryParameter[];
    private readonly headers: FernIr.HttpHeader[];
    private readonly topLevelServers: ServerObject[];
    constructor({
        context,
        breadcrumbs,
        method,
        pathParameters = [],
        queryParameters = [],
        headers = [],
        topLevelServers = []
    }: MethodConverter.Args) {
        super({ context, breadcrumbs });
        this.method = method;
        this.pathParameters = pathParameters;
        this.queryParameters = queryParameters;
        this.headers = headers;
        this.topLevelServers = topLevelServers;
    }

    public convert(): MethodConverter.Output | undefined {
        let inlinedTypes: Record<TypeId, Converters.SchemaConverters.SchemaConverter.ConvertedSchema> = {};

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
                const resolvedParamResponse = this.context.resolveReference<ContentDescriptorObject>({
                    reference: param
                });
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
                breadcrumbs: [this.method.name, "Param", resolvedParam.name],
                schemaIdOverride: schemaId,
                context: this.context,
                schemaOrReference: resolvedParam.schema as OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject,
                wrapAsOptional: !resolvedParam.required
            });
            const schema = parameterSchemaConverter.convert();
            if (schema != null) {
                requestProperties.push({
                    docs: resolvedParam.description,
                    availability: this.context.getAvailability({
                        node: param,
                        breadcrumbs: [...this.breadcrumbs, "parameters"]
                    }),
                    name: this.context.casingsGenerator.generateNameAndWireValue({
                        name: resolvedParam.name,
                        wireValue: resolvedParam.name
                    }),
                    valueType: schema.type,
                    v2Examples: schema.schema?.typeDeclaration.v2Examples,
                    propertyAccess: undefined
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
            const resolvedResult = this.context.resolveMaybeReference<ContentDescriptorObject>({
                schemaOrReference: this.method.result,
                breadcrumbs: [...this.breadcrumbs, "result"]
            });

            if (resolvedResult != null) {
                const resultSchemaConverter = new Converters.SchemaConverters.SchemaOrReferenceConverter({
                    breadcrumbs: [this.method.name, "result"],
                    context: this.context,
                    schemaOrReference: resolvedResult.schema as OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject
                });
                const schemaId = [this.method.name, "Result"].join("_");
                const convertedResultSchema = resultSchemaConverter.convert();
                if (convertedResultSchema != null) {
                    jsonResponseBody = {
                        docs: resolvedResult.description,
                        v2Examples: convertedResultSchema.schema?.typeDeclaration.v2Examples,
                        responseBodyType: convertedResultSchema.type
                    };
                    inlinedTypes = {
                        ...convertedResultSchema.inlinedTypes,
                        ...inlinedTypes,
                        ...(convertedResultSchema.schema != null ? { [schemaId]: convertedResultSchema.schema } : {})
                    };
                }
            }
        }

        const v2BaseUrls = this.getEndpointBaseUrls();

        const audiences =
            this.context.getAudiences({
                operation: this.method,
                breadcrumbs: this.breadcrumbs
            }) ?? [];

        const endpoint: HttpEndpoint = {
            baseUrl: undefined,
            v2BaseUrls,
            basePath: undefined,
            auth: false,
            security: undefined,
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
            v2RequestBodies: undefined,
            sdkRequest: undefined,
            response:
                jsonResponseBody != null
                    ? { body: HttpResponseBody.json(JsonResponse.response(jsonResponseBody)), statusCode: undefined }
                    : undefined,
            v2Responses: undefined,
            errors: [],
            idempotent: false,
            pagination: undefined,
            userSpecifiedExamples: [],
            autogeneratedExamples: [],
            v2Examples: {
                autogeneratedExamples: {},
                userSpecifiedExamples: this.convertExamples()
            },
            transport: undefined,
            availability: undefined,
            source: HttpEndpointSource.openrpc(),
            audiences,
            retries: undefined,
            apiPlayground: undefined
        };

        return {
            endpoint,
            audiences,
            inlinedTypes,
            servers: this.filterOutTopLevelServers(this.method.servers ?? [])
        };
    }

    private filterOutTopLevelServers(servers: ServerObject[]): ServerObject[] {
        return servers.filter(
            (server) => !this.topLevelServers.some((topLevelServer) => topLevelServer.url === server.url)
        );
    }

    private getEndpointBaseUrls(): string[] | undefined {
        const methodServers = this.method.servers;
        if (methodServers == null) {
            return undefined;
        }
        const baseUrls = methodServers.map((server) => {
            const matchingTopLevelServerNameWithDifferentUrl = this.topLevelServers.find(
                (topLevelServer) => topLevelServer.name === server.name && topLevelServer.url !== server.url
            );

            if (matchingTopLevelServerNameWithDifferentUrl != null) {
                return server.url;
            }

            const matchingTopLevelServerUrl = this.topLevelServers.find(
                (topLevelServer) => topLevelServer.url === server.url
            );

            const serverToUse = matchingTopLevelServerUrl ?? server;

            return ServersConverter.getServerName({
                server: serverToUse,
                context: this.context
            });
        });
        return baseUrls;
    }

    private convertExamples(): Record<string, FernIr.V2HttpEndpointExample> {
        const examples: Record<string, FernIr.V2HttpEndpointExample> = {};

        // If there are examples in the method, convert them
        let i = 0;
        if (this.method.examples && this.method.examples.length > 0) {
            for (const example of this.method.examples ?? []) {
                let resolvedExample: ExamplePairingObject;
                if (this.context.isReferenceObject(example)) {
                    const resolvedExampleResponse = this.context.resolveReference<ExamplePairingObject>({
                        reference: example
                    });
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
                        const resolvedResultResponse = this.context.resolveReference<ExampleObject>({
                            reference: resolvedExample.result
                        });
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
                            const resolvedParamResponse = this.context.resolveReference<ExampleObject>({
                                reference: param
                            });
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
                    displayName: undefined,
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
