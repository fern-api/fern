import { camelCase } from "lodash-es";
import { OpenAPIV3_1 } from "openapi-types";

import { RawSchemas } from "@fern-api/fern-definition-schema";
import { FernIr, HttpEndpoint, HttpEndpointSource, HttpPath, HttpResponse } from "@fern-api/ir-sdk";
import { constructHttpPath } from "@fern-api/ir-utils";
import { AbstractConverter, ServersConverter } from "@fern-api/v2-importer-commons";

import { FernExamplesExtension } from "../../../extensions/x-fern-examples";
import { FernStreamingExtension } from "../../../extensions/x-fern-streaming";
import { ResponseBodyConverter } from "../ResponseBodyConverter";
import { ResponseErrorConverter } from "../ResponseErrorConverter";
import { AbstractOperationConverter } from "./AbstractOperationConverter";

export declare namespace OperationConverter {
    export interface Args extends AbstractOperationConverter.Args {
        idempotent: boolean | undefined;
        idToAuthScheme?: Record<string, FernIr.AuthScheme>;
        topLevelServers?: OpenAPIV3_1.ServerObject[];
        streamingExtension: FernStreamingExtension.Output | undefined;
    }

    export interface Output extends AbstractOperationConverter.Output {
        endpoint: HttpEndpoint;
        streamEndpoint: HttpEndpoint | undefined;
        audiences: string[];
        errors: Record<FernIr.ErrorId, FernIr.ErrorDeclaration>;
        servers?: OpenAPIV3_1.ServerObject[];
    }

    export interface ConvertedResponseBody {
        response: HttpResponse | undefined;
        streamResponse: HttpResponse | undefined;
        errors: ResponseErrorConverter.Output[];
        examples?: Record<string, OpenAPIV3_1.ExampleObject>;
    }

    type BaseEndpoint = Omit<HttpEndpoint, "requestBody" | "response" | "name" | "docs" | "id" | "v2Examples">;
}

export class OperationConverter extends AbstractOperationConverter {
    private readonly idempotent: boolean | undefined;
    private readonly idToAuthScheme?: Record<string, FernIr.AuthScheme>;
    private readonly topLevelServers?: OpenAPIV3_1.ServerObject[];
    private readonly streamingExtension: FernStreamingExtension.Output | undefined;

    private static readonly AUTHORIZATION_HEADER = "Authorization";

    constructor({
        context,
        breadcrumbs,
        operation,
        method,
        path,
        idempotent,
        idToAuthScheme,
        topLevelServers,
        streamingExtension
    }: OperationConverter.Args) {
        super({ context, breadcrumbs, operation, method, path });
        this.idempotent = idempotent;
        this.idToAuthScheme = idToAuthScheme;
        this.topLevelServers = topLevelServers;
        this.streamingExtension = streamingExtension;
    }

    public convert(): OperationConverter.Output | undefined {
        const httpMethod = this.convertHttpMethod();
        if (httpMethod == null) {
            return undefined;
        }

        const { group, method } =
            this.computeGroupNameAndLocationFromExtensions() ?? this.computeGroupNameFromTagAndOperationId();
        const groupDisplayName = this.getGroupDisplayName(group);

        const { headers, pathParameters, queryParameters } = this.convertParameters({
            breadcrumbs: [...this.breadcrumbs, "parameters"]
        });

        const convertedRequestBody = this.convertRequestBody({
            breadcrumbs: [...this.breadcrumbs, "requestBody"],
            group,
            method,
            streamingExtension: this.streamingExtension
        });
        const requestBody = convertedRequestBody != null ? convertedRequestBody.requestBody : undefined;
        const streamRequestBody = convertedRequestBody != null ? convertedRequestBody.streamRequestBody : undefined;

        const convertedResponseBody = this.convertResponseBody({
            breadcrumbs: [...this.breadcrumbs, "responses"],
            group,
            method,
            streamingExtension: this.streamingExtension
        });
        const response = convertedResponseBody != null ? convertedResponseBody.response : undefined;
        const streamResponse = convertedResponseBody != null ? convertedResponseBody.streamResponse : undefined;
        const convertedEndpointErrors = convertedResponseBody != null ? convertedResponseBody.errors : [];
        const topLevelErrors: Record<FernIr.ErrorId, FernIr.ErrorDeclaration> = {};
        const errors = convertedEndpointErrors.map((convertedError) => convertedError.error);

        const path = constructHttpPath(this.path);
        const baseUrl = this.getEndpointBaseUrl();
        const v2BaseUrls = this.getEndpointBaseUrls();
        const fernExamples = this.convertExamples({
            httpPath: path,
            httpMethod,
            baseUrl
        });

        const endpointLevelSecuritySchemes = new Set<string>(
            this.operation.security?.flatMap((securityRequirement) => Object.keys(securityRequirement)) ?? []
        );
        // Convert security scheme IDs to HTTP headers and add them to existing headers
        const securityHeaders = this.authSchemeToHeaders(Array.from(endpointLevelSecuritySchemes));
        if (securityHeaders.length > 0) {
            headers.push(...securityHeaders);
        }

        for (const convertedError of convertedEndpointErrors) {
            const responseError = convertedError.error;
            const responseErrorType = convertedError.errorType;
            const errorId = responseError.error.errorId;
            topLevelErrors[errorId] = {
                name: responseError.error,
                displayName: convertedError.displayName,
                discriminantValue: {
                    name: responseError.error.name,
                    wireValue: errorId
                },
                type: responseErrorType,
                statusCode: convertedError.statusCode,
                docs: responseError.docs,
                examples: [],
                // TODO: Add v2 examples
                v2Examples: undefined
            };
        }

        const baseEndpoint: OperationConverter.BaseEndpoint = {
            displayName: this.operation.summary,
            method: httpMethod,
            baseUrl,
            v2BaseUrls,
            path,
            pathParameters,
            queryParameters,
            headers: headers.filter(
                (header, index, self) => index === self.findIndex((h) => h.name.wireValue === header.name.wireValue)
            ),
            sdkRequest: undefined,
            errors,
            auth: this.operation.security != null || this.context.spec.security != null,
            availability: this.context.getAvailability({
                node: this.operation,
                breadcrumbs: this.breadcrumbs
            }),

            userSpecifiedExamples: [],
            autogeneratedExamples: [],
            idempotent: this.idempotent ?? false,
            basePath: undefined,
            fullPath: path,
            allPathParameters: pathParameters,
            pagination: undefined,
            transport: undefined,
            source: HttpEndpointSource.openapi()
        };

        const endpointGroupParts = this.context.namespace != null ? [this.context.namespace] : [];
        const camelCasedGroup = group?.map((group) => camelCase(group));
        endpointGroupParts.push(...(camelCasedGroup ?? []));

        return {
            audiences:
                this.context.getAudiences({
                    operation: this.operation,
                    breadcrumbs: this.breadcrumbs
                }) ?? [],
            group,
            groupDisplayName,
            errors: topLevelErrors,
            endpoint: {
                ...baseEndpoint,
                id: `endpoint_${endpointGroupParts.join("/")}.${method}`,
                name: this.context.casingsGenerator.generateName(method),
                requestBody,
                response,
                docs: this.operation.description,
                v2Examples: {
                    autogeneratedExamples: {},
                    userSpecifiedExamples: fernExamples.examples
                }
            },
            streamEndpoint:
                streamResponse != null && streamResponse.body != null
                    ? {
                          ...baseEndpoint,
                          id: `endpoint_${endpointGroupParts.join("/")}.${method}_stream`,
                          name: this.context.casingsGenerator.generateName(`${method}_stream`),
                          requestBody: streamRequestBody,
                          response: streamResponse,
                          docs:
                              this.streamingExtension?.type === "streamCondition"
                                  ? (this.streamingExtension.streamDescription ?? this.operation.description)
                                  : this.operation.description,
                          v2Examples: {
                              autogeneratedExamples: {},
                              userSpecifiedExamples: fernExamples.streamExamples
                          }
                      }
                    : undefined,
            inlinedTypes: this.inlinedTypes,
            servers: this.filterOutTopLevelServers(this.operation.servers ?? [])
        };
    }

    protected convertResponseBody({
        breadcrumbs,
        group,
        method,
        streamingExtension
    }: {
        breadcrumbs: string[];
        group: string[] | undefined;
        method: string;
        streamingExtension: FernStreamingExtension.Output | undefined;
    }): OperationConverter.ConvertedResponseBody | undefined {
        if (this.operation.responses == null) {
            return undefined;
        }

        let convertedResponseBody: OperationConverter.ConvertedResponseBody | undefined = undefined;
        // TODO: Our existing Parser will only parse the first successful response.
        // We'll need to update it to parse all successful responses.
        let hasSuccessfulResponse = false;

        for (const [statusCode, response] of Object.entries(this.operation.responses)) {
            const statusCodeNum = parseInt(statusCode);
            if (isNaN(statusCodeNum) || statusCodeNum < 200 || (statusCodeNum >= 300 && statusCodeNum < 400)) {
                continue;
            }
            if (convertedResponseBody == null) {
                convertedResponseBody = {
                    response: undefined,
                    streamResponse: undefined,
                    errors: [],
                    examples: {}
                };
            }
            // Convert Successful Responses (2xx)
            if (statusCodeNum >= 200 && statusCodeNum < 300 && !hasSuccessfulResponse) {
                const resolvedResponse = this.context.resolveMaybeReference<OpenAPIV3_1.ResponseObject>({
                    schemaOrReference: response,
                    breadcrumbs: [...breadcrumbs, statusCode]
                });

                if (resolvedResponse == null) {
                    continue;
                }

                const responseBodyConverter = new ResponseBodyConverter({
                    context: this.context,
                    breadcrumbs: [...breadcrumbs, statusCode],
                    responseBody: resolvedResponse,
                    group: group ?? [],
                    method,
                    statusCode,
                    streamingExtension
                });
                const converted = responseBodyConverter.convert();
                if (converted != null) {
                    hasSuccessfulResponse = true;
                    this.inlinedTypes = {
                        ...this.inlinedTypes,
                        ...converted.inlinedTypes
                    };
                    convertedResponseBody.response = {
                        statusCode: statusCodeNum,
                        body: converted.responseBody
                    };
                    convertedResponseBody.streamResponse = {
                        statusCode: statusCodeNum,
                        body: converted.streamResponseBody
                    };
                }
            }
            // Convert Error Responses (4xx and 5xx)
            if (statusCodeNum >= 400 && statusCodeNum < 600) {
                const resolvedResponse = this.context.resolveMaybeReference<OpenAPIV3_1.ResponseObject>({
                    schemaOrReference: response,
                    breadcrumbs: [...breadcrumbs, statusCode]
                });

                if (resolvedResponse == null) {
                    continue;
                }

                const responseErrorConverter = new ResponseErrorConverter({
                    context: this.context,
                    breadcrumbs: [...breadcrumbs, statusCode],
                    responseError: resolvedResponse,
                    group: group ?? [],
                    method,
                    methodName: this.evaluateMethodNameFromOperation(),
                    statusCode: statusCodeNum
                });
                const converted = responseErrorConverter.convert();
                if (converted != null) {
                    this.inlinedTypes = {
                        ...this.inlinedTypes,
                        ...converted.inlinedTypes
                    };
                    convertedResponseBody.errors.push(converted);
                }
            }
        }

        return convertedResponseBody;
    }

    /**
     * Converts security scheme IDs to HTTP headers
     * @param securitySchemeIds - List of security scheme IDs
     * @returns Array of HTTP headers derived from the security schemes
     */
    private authSchemeToHeaders(securitySchemeIds: string[]): FernIr.HttpHeader[] {
        const headers: FernIr.HttpHeader[] = [];

        for (const id of securitySchemeIds) {
            const authScheme = this.idToAuthScheme?.[id];
            if (authScheme == null) {
                continue;
            }
            const baseHeader: Omit<FernIr.HttpHeader, "name"> = {
                valueType: AbstractConverter.STRING,
                availability: undefined,
                docs: undefined,
                env: undefined,
                v2Examples: undefined
            };

            switch (authScheme.type) {
                case "bearer":
                    headers.push({
                        name: {
                            name: this.context.casingsGenerator.generateName(OperationConverter.AUTHORIZATION_HEADER),
                            wireValue: OperationConverter.AUTHORIZATION_HEADER
                        },
                        ...baseHeader
                    });
                    break;
                case "basic":
                    headers.push({
                        name: {
                            name: this.context.casingsGenerator.generateName(OperationConverter.AUTHORIZATION_HEADER),
                            wireValue: OperationConverter.AUTHORIZATION_HEADER
                        },
                        ...baseHeader
                    });
                    break;
                case "header":
                    headers.push({
                        name: authScheme.name,
                        ...baseHeader
                    });
                    break;
            }
        }

        return headers;
    }

    private convertExamples({
        httpPath,
        httpMethod,
        baseUrl
    }: {
        httpPath: HttpPath;
        httpMethod: FernIr.HttpMethod;
        baseUrl: string | undefined;
    }): {
        examples: Record<string, FernIr.V2HttpEndpointExample>;
        streamExamples: Record<string, FernIr.V2HttpEndpointExample>;
    } {
        const fernExamplesExtension = new FernExamplesExtension({
            context: this.context,
            breadcrumbs: this.breadcrumbs,
            operation: this.operation as object
        });
        const fernExamples = fernExamplesExtension.convert();
        if (fernExamples == null) {
            return { examples: {}, streamExamples: {} };
        }
        if (this.streamingExtension?.type === "streamCondition") {
            return this.convertStreamConditionExamples({ httpPath, httpMethod, baseUrl, fernExamples });
        }
        return {
            examples: this.convertEndpointExamples({ httpPath, httpMethod, baseUrl, fernExamples }),
            streamExamples: {}
        };
    }

    private convertStreamConditionExamples({
        httpPath,
        httpMethod,
        baseUrl,
        fernExamples
    }: {
        httpPath: HttpPath;
        httpMethod: FernIr.HttpMethod;
        baseUrl: string | undefined;
        fernExamples: RawSchemas.ExampleEndpointCallArraySchema;
    }): {
        examples: Record<string, FernIr.V2HttpEndpointExample>;
        streamExamples: Record<string, FernIr.V2HttpEndpointExample>;
    } {
        const filteredJsonExamples = fernExamples.filter(
            (example) => !(example.response != null && "stream" in example.response)
        );
        const filteredStreamExamples = fernExamples.filter(
            (example) => example.response != null && "stream" in example.response
        );
        const examples = this.convertEndpointExamples({
            httpPath,
            httpMethod,
            baseUrl,
            fernExamples: filteredJsonExamples
        });
        const streamExamples = this.convertEndpointExamples({
            httpPath,
            httpMethod,
            baseUrl,
            fernExamples: filteredStreamExamples
        });
        return { examples, streamExamples };
    }

    private convertEndpointExamples({
        httpPath,
        httpMethod,
        baseUrl,
        fernExamples
    }: {
        httpPath: HttpPath;
        httpMethod: FernIr.HttpMethod;
        baseUrl: string | undefined;
        fernExamples: RawSchemas.ExampleEndpointCallArraySchema;
    }): Record<string, FernIr.V2HttpEndpointExample> {
        return Object.fromEntries(
            fernExamples.map((example, exampleIndex) => {
                return [
                    this.getExampleName({ example, exampleIndex }),
                    {
                        request:
                            example.request != null
                                ? {
                                      docs: undefined,
                                      endpoint: {
                                          method: httpMethod,
                                          path: this.buildExamplePath(httpPath, example["path-parameters"] ?? {})
                                      },
                                      baseUrl: undefined,
                                      environment: baseUrl,
                                      auth: undefined,
                                      pathParameters: example["path-parameters"] ?? {},
                                      queryParameters: example["query-parameters"] ?? {},
                                      headers: example.headers ?? {},
                                      requestBody: example.request
                                  }
                                : undefined,
                        response:
                            example.response != null
                                ? {
                                      docs: undefined,
                                      statusCode: undefined,
                                      body: this.getExampleResponseBody({ example })
                                  }
                                : undefined,
                        codeSamples: example["code-samples"]?.map((codeSample) => {
                            const language =
                                ("language" in codeSample ? codeSample.language : codeSample.sdk) ?? undefined;
                            return {
                                name: codeSample.name,
                                docs: undefined,
                                language,
                                code: codeSample.code
                            };
                        })
                    }
                ];
            })
        );
    }

    private getExampleName({
        example,
        exampleIndex
    }: {
        example: RawSchemas.ExampleEndpointCallSchema;
        exampleIndex: number;
    }): string {
        return example.name ?? example["code-samples"]?.[0]?.name ?? `Example_${exampleIndex}`;
    }

    private getExampleResponseBody({
        example
    }: {
        example: RawSchemas.ExampleEndpointCallSchema;
    }): FernIr.V2HttpEndpointResponseBody | undefined {
        if (example.response == null) {
            return undefined;
        }
        if ("stream" in example.response) {
            return FernIr.V2HttpEndpointResponseBody.stream(example.response.stream);
        }
        if ("body" in example.response) {
            return FernIr.V2HttpEndpointResponseBody.json(example.response.body);
        }
        return undefined;
    }

    private getEndpointBaseUrl(): string | undefined {
        const operationServer = this.operation.servers?.[0];
        if (operationServer == null) {
            return undefined;
        }
        const matchingTopLevelServer = this.topLevelServers?.find((server) => server.url === operationServer.url);
        const serverToUse = matchingTopLevelServer ?? operationServer;

        return ServersConverter.getServerName({
            server: serverToUse,
            context: this.context
        });
    }

    private getEndpointBaseUrls(): string[] | undefined {
        const operationServers = this.operation.servers;
        if (operationServers == null) {
            return undefined;
        }
        const baseUrls = operationServers.map((server) => {
            const matchingTopLevelServer = this.topLevelServers?.find(
                (topLevelServer) => topLevelServer.url === server.url
            );
            const serverToUse = matchingTopLevelServer ?? server;
            return ServersConverter.getServerName({
                server: serverToUse,
                context: this.context
            });
        });
        return baseUrls;
    }

    private buildExamplePath(httpPath: HttpPath, pathParameters: Record<string, unknown>): string {
        return (
            httpPath.head +
            httpPath.parts
                .map((part) => {
                    const pathParamValue = pathParameters[part.pathParameter]?.toString() ?? part.pathParameter;
                    return `${pathParamValue}${part.tail}`;
                })
                .join("")
        );
    }

    private filterOutTopLevelServers(servers: OpenAPIV3_1.ServerObject[]): OpenAPIV3_1.ServerObject[] {
        return servers.filter(
            (server) => !this.topLevelServers?.some((topLevelServer) => topLevelServer.url === server.url)
        );
    }

    private getGroupDisplayName(group: string[] | undefined): string | undefined {
        const rawOperationTag = this.operation.tags?.[0];
        const baseGroupName = group?.[group.length - 1];
        if (baseGroupName != null && rawOperationTag != null) {
            const lowerCaseRawOperationTag = rawOperationTag.toLowerCase().replaceAll(" ", "");
            return lowerCaseRawOperationTag === baseGroupName ? rawOperationTag : undefined;
        }
        return undefined;
    }
}
