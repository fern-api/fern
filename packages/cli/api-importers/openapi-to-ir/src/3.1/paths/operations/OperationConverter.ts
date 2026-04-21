import { RawSchemas } from "@fern-api/fern-definition-schema";
import {
    ContainerType,
    FernIr,
    HttpEndpoint,
    HttpEndpointSource,
    HttpPath,
    HttpResponse,
    HttpResponseBody,
    JsonResponse,
    TypeReference,
    V2HttpRequestBodies
} from "@fern-api/ir-sdk";
import { constructHttpPath, getWireValue } from "@fern-api/ir-utils";
import { FernOpenAPIExtension } from "@fern-api/openapi-ir-parser";
import { AbstractConverter, Extensions, ServersConverter, sanitizeSecurityScopes } from "@fern-api/v3-importer-commons";
import { camelCase } from "lodash-es";
import { OpenAPIV3_1 } from "openapi-types";
import { RedoclyCodeSamplesExtension } from "../../../extensions/x-code-samples.js";
import { FernExamplesExtension } from "../../../extensions/x-fern-examples.js";
import { FernExplorerExtension } from "../../../extensions/x-fern-explorer.js";
import { FernStreamingExtension } from "../../../extensions/x-fern-streaming.js";
import { ResponseBodyConverter } from "../ResponseBodyConverter.js";
import { ResponseErrorConverter } from "../ResponseErrorConverter.js";
import { AbstractOperationConverter } from "./AbstractOperationConverter.js";

export declare namespace OperationConverter {
    export interface Args extends AbstractOperationConverter.Args {
        idempotent: boolean | undefined;
        idToAuthScheme?: Record<string, FernIr.AuthScheme>;
        topLevelServers?: OpenAPIV3_1.ServerObject[];
        pathLevelServers?: OpenAPIV3_1.ServerObject[];
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
        v2Responses: HttpResponse[] | undefined;
        streamResponse: HttpResponse | undefined;
        errors: ResponseErrorConverter.Output[];
        examples?: Record<string, OpenAPIV3_1.ExampleObject>;
        responseHeaders: FernIr.HttpHeader[];
    }

    type BaseEndpoint = Omit<
        HttpEndpoint,
        "requestBody" | "v2RequestBodies" | "response" | "v2Responses" | "name" | "docs" | "id" | "v2Examples"
    >;
}

export class OperationConverter extends AbstractOperationConverter {
    private readonly idempotent: boolean | undefined;
    private readonly idToAuthScheme?: Record<string, FernIr.AuthScheme>;
    private readonly topLevelServers?: OpenAPIV3_1.ServerObject[];
    private readonly pathLevelServers?: OpenAPIV3_1.ServerObject[];
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
        pathLevelServers,
        streamingExtension
    }: OperationConverter.Args) {
        super({ context, breadcrumbs, operation, method, path });
        this.idempotent = idempotent;
        this.idToAuthScheme = idToAuthScheme;
        this.topLevelServers = topLevelServers;
        this.pathLevelServers = pathLevelServers;
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

        const convertedRequestBodies = this.convertRequestBody({
            breadcrumbs: [...this.breadcrumbs, "requestBody"],
            group,
            method,
            streamingExtension: this.streamingExtension,
            queryParameters
        });
        const requestBody = convertedRequestBodies != null ? convertedRequestBodies[0]?.requestBody : undefined;
        const streamRequestBody =
            convertedRequestBodies != null ? convertedRequestBodies[0]?.streamRequestBody : undefined;

        const v2RequestBodies: V2HttpRequestBodies = {
            requestBodies: convertedRequestBodies?.map((body) => body.requestBody)
        };

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

        // When there are no x-fern-examples but the request body has native OpenAPI
        // examples (e.g. mediaType.example/examples without a schema), synthesize
        // endpoint-level v2Examples so docs/code snippets can render the request body.
        if (Object.keys(fernExamples.examples).length === 0 && Object.keys(fernExamples.streamExamples).length === 0) {
            const nativeExamples = this.synthesizeEndpointExamplesFromNativeRequestBody({
                httpPath: path,
                httpMethod,
                baseUrl
            });
            if (nativeExamples != null) {
                for (const [name, example] of Object.entries(nativeExamples)) {
                    fernExamples.examples[name] = example;
                }
            }
        }

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
            const errorExamples = convertedError.examples;
            topLevelErrors[errorId] = {
                name: responseError.error,
                displayName: convertedError.displayName,
                discriminantValue: {
                    name: responseError.error.name,
                    wireValue: errorId
                },
                type: responseErrorType,
                statusCode: convertedError.statusCode,
                isWildcardStatusCode: convertedError.isWildcardStatusCode,
                docs: responseError.docs,
                examples: [],
                // TODO: Add v2 examples
                v2Examples: {
                    userSpecifiedExamples: errorExamples ?? {},
                    autogeneratedExamples: {}
                },
                headers: convertedError.headers
            };
        }

        const audiences =
            this.context.getAudiences({
                operation: this.operation,
                breadcrumbs: this.breadcrumbs
            }) ?? [];

        const globalExplorerExtension = new FernExplorerExtension({
            context: this.context,
            breadcrumbs: this.breadcrumbs,
            document: this.context.spec as object
        });
        const globalExplorer = globalExplorerExtension.convert();

        const operationExplorerExtension = new FernExplorerExtension({
            context: this.context,
            breadcrumbs: this.breadcrumbs,
            document: this.operation as object
        });
        const operationExplorer = operationExplorerExtension.convert();

        const apiPlayground = operationExplorer ?? globalExplorer;

        const baseEndpoint: OperationConverter.BaseEndpoint = {
            displayName: this.operation.summary,
            method: httpMethod,
            baseUrl,
            v2BaseUrls,
            path,
            pathParameters,
            queryParameters,
            headers: headers.filter(
                (header, index, self) =>
                    index === self.findIndex((h) => getWireValue(h.name) === getWireValue(header.name))
            ),
            responseHeaders: convertedResponseBody?.responseHeaders,
            sdkRequest: undefined,
            errors,
            auth: this.computeEndpointAuth(),
            security: this.computeEndpointSecurity(),
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
            source: HttpEndpointSource.openapi(),
            audiences,
            retries: undefined,
            apiPlayground
        };

        const endpointGroupParts = this.context.namespace != null ? [this.context.namespace] : [];
        const camelCasedGroup = group?.map((group) => camelCase(group));
        endpointGroupParts.push(...(camelCasedGroup ?? []));

        return {
            audiences,
            group,
            groupDisplayName,
            errors: topLevelErrors,
            endpoint: {
                ...baseEndpoint,
                id: `endpoint_${endpointGroupParts.join("/")}.${method}`,
                name: this.context.casingsGenerator.generateName(method),
                requestBody,
                v2RequestBodies,
                response,
                docs: this.operation.description,
                v2Examples: {
                    autogeneratedExamples: {},
                    userSpecifiedExamples: fernExamples.examples
                },
                v2Responses: {
                    responses: convertedResponseBody?.v2Responses
                }
            },
            streamEndpoint:
                streamResponse != null && streamResponse.body != null
                    ? {
                          ...baseEndpoint,
                          id: `endpoint_${endpointGroupParts.join("/")}.${method}_stream`,
                          name: this.context.casingsGenerator.generateName(`${method}_stream`),
                          requestBody: streamRequestBody,
                          v2RequestBodies: undefined,
                          response: streamResponse,
                          docs:
                              this.streamingExtension?.type === "streamCondition"
                                  ? (this.streamingExtension.streamDescription ?? this.operation.description)
                                  : this.operation.description,
                          v2Examples: {
                              autogeneratedExamples: {},
                              userSpecifiedExamples: fernExamples.streamExamples
                          },
                          v2Responses: {
                              responses: [
                                  {
                                      statusCode: 200,
                                      isWildcardStatusCode: undefined,
                                      body: streamResponse.body,
                                      docs: streamResponse.docs
                                  }
                              ]
                          }
                      }
                    : undefined,
            inlinedTypes: this.inlinedTypes,
            servers: this.filterOutTopLevelServers(this.operation.servers ?? this.pathLevelServers ?? [])
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
        let hasNoContentResponse = false;
        for (const [statusCode, response] of Object.entries(this.operation.responses)) {
            const isWildcardStatusCode = /^[45]XX$/i.test(statusCode);
            let statusCodeNum: number;
            let isErrorResponse = false;

            if (isWildcardStatusCode) {
                const firstDigit = parseInt(statusCode.charAt(0));
                statusCodeNum = firstDigit * 100;
                isErrorResponse = true;
            } else {
                statusCodeNum = parseInt(statusCode);
                if (isNaN(statusCodeNum) || statusCodeNum < 200 || (statusCodeNum >= 300 && statusCodeNum < 400)) {
                    continue;
                }
                isErrorResponse = statusCodeNum >= 400 && statusCodeNum < 600;
            }

            if (convertedResponseBody == null) {
                convertedResponseBody = {
                    response: undefined,
                    v2Responses: undefined,
                    streamResponse: undefined,
                    errors: [],
                    examples: {},
                    responseHeaders: []
                };
            }
            // Convert Successful Responses (2xx)
            if (statusCodeNum >= 200 && statusCodeNum < 300) {
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
                if (converted == null) {
                    // A 2xx response with no body (e.g., 204 No Content with content: {})
                    hasNoContentResponse = true;
                    continue;
                }
                if (converted != null) {
                    this.inlinedTypes = {
                        ...this.inlinedTypes,
                        ...converted.inlinedTypes
                    };

                    if (!hasSuccessfulResponse) {
                        hasSuccessfulResponse = true;

                        convertedResponseBody.response = {
                            statusCode: statusCodeNum,
                            isWildcardStatusCode: isWildcardStatusCode ? true : undefined,
                            body: converted.responseBody,
                            docs: resolvedResponse.description
                        };

                        convertedResponseBody.streamResponse = {
                            statusCode: statusCodeNum,
                            isWildcardStatusCode: isWildcardStatusCode ? true : undefined,
                            body: converted.streamResponseBody,
                            docs: resolvedResponse.description
                        };

                        if (converted.headers != null) {
                            convertedResponseBody.responseHeaders = converted.headers;
                        }
                    }

                    convertedResponseBody.v2Responses = [
                        ...(convertedResponseBody.v2Responses ?? []),
                        {
                            statusCode: statusCodeNum,
                            isWildcardStatusCode: isWildcardStatusCode ? true : undefined,
                            body: converted.responseBody,
                            docs: resolvedResponse.description
                        }
                    ];
                }
            }

            if (isErrorResponse) {
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
                    statusCode: statusCodeNum,
                    isWildcardStatusCode: isWildcardStatusCode ? true : undefined
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

        if (this.streamingExtension != null) {
            if (convertedResponseBody == null) {
                convertedResponseBody = {
                    response: undefined,
                    v2Responses: undefined,
                    streamResponse: undefined,
                    errors: [],
                    examples: {},
                    responseHeaders: []
                };
            }
            const responseBodyConverter = new ResponseBodyConverter({
                context: this.context,
                breadcrumbs: [...breadcrumbs, "stream"],
                responseBody: { description: "" },
                group: group ?? [],
                method,
                statusCode: "stream",
                streamingExtension
            });
            const converted = responseBodyConverter.convert();
            if (converted != null) {
                this.inlinedTypes = {
                    ...this.inlinedTypes,
                    ...converted.inlinedTypes
                };
                convertedResponseBody.response = {
                    statusCode: 200,
                    isWildcardStatusCode: undefined,
                    body: converted.responseBody,
                    docs: undefined
                };
                convertedResponseBody.streamResponse = {
                    statusCode: 200,
                    isWildcardStatusCode: undefined,
                    body: converted.streamResponseBody,
                    docs: undefined
                };
                convertedResponseBody.v2Responses = [
                    {
                        statusCode: 200,
                        isWildcardStatusCode: undefined,
                        body: converted.responseBody,
                        docs: undefined
                    }
                ];
            }
        }

        // If there's both a successful response with a body and a no-content response (e.g., 204),
        // wrap the response body type in optional so generators produce nullable return types.
        if (hasNoContentResponse && hasSuccessfulResponse && convertedResponseBody?.response?.body != null) {
            const body = convertedResponseBody.response.body;
            if (body.type === "json" && body.value.type === "response") {
                const innerType = body.value.responseBodyType;
                // Only wrap if not already optional
                if (innerType.type !== "container" || innerType.container.type !== "optional") {
                    convertedResponseBody.response = {
                        ...convertedResponseBody.response,
                        body: HttpResponseBody.json(
                            JsonResponse.response({
                                ...body.value,
                                responseBodyType: TypeReference.container(ContainerType.optional(innerType))
                            })
                        )
                    };
                }
            }
        }

        return convertedResponseBody;
    }

    private computeEndpointAuth(): boolean {
        if (this.operation.security != null && this.operation.security.length === 0) {
            return false;
        }

        if (this.operation.security != null && this.operation.security.length > 0) {
            return true;
        }

        return (
            (this.context.spec.security != null && this.context.spec.security.length > 0) ||
            this.shouldApplyDefaultAuthOverrides()
        );
    }

    private computeEndpointSecurity(): OpenAPIV3_1.SecurityRequirementObject[] | undefined {
        // If endpoint explicitly has no auth (empty security array), respect that
        if (this.operation.security != null && this.operation.security.length === 0) {
            return [];
        }

        // When auth overrides are specified, use them instead of OpenAPI security
        if (this.context.authOverrides?.auth != null) {
            return this.getDefaultSecurityFromAuthOverrides();
        }

        // Fall back to OpenAPI security
        return sanitizeSecurityScopes(this.operation.security ?? this.context.spec.security);
    }

    /**
     * Converts security scheme IDs to HTTP headers
     * @param securitySchemeIds - List of security scheme IDs
     * @returns Array of HTTP headers derived from the security schemes
     */
    private shouldApplyDefaultAuthOverrides(): boolean {
        if (!this.context.authOverrides?.auth) {
            return false;
        }

        const hasGlobalSecurity = this.context.spec.security != null && this.context.spec.security.length > 0;
        // Check for non-empty endpoint security (empty array means explicit no-auth, not "has security")
        const hasEndpointSecurity = this.operation.security != null && this.operation.security.length > 0;

        // If there's already security defined (global or endpoint), don't apply defaults
        return !(hasGlobalSecurity || hasEndpointSecurity);
    }

    private getDefaultSecurityFromAuthOverrides(): OpenAPIV3_1.SecurityRequirementObject[] | undefined {
        // If we have auth overrides but no OpenAPI security, create a default security requirement
        // that references the global auth scheme from generators.yml
        if (!this.context.authOverrides?.auth) {
            return undefined;
        }

        const authConfig = this.context.authOverrides.auth;

        // Handle string auth (single scheme)
        if (typeof authConfig === "string") {
            const securityRequirement: OpenAPIV3_1.SecurityRequirementObject = {};
            securityRequirement[authConfig] = [];
            return [securityRequirement];
        }

        // Handle "any" auth (OR semantics - each scheme in its own array element)
        if (typeof authConfig === "object" && "any" in authConfig) {
            const anySchemes = authConfig.any;
            if (Array.isArray(anySchemes)) {
                return anySchemes.map((scheme) => {
                    const schemeName = typeof scheme === "string" ? scheme : scheme.scheme;
                    const securityRequirement: OpenAPIV3_1.SecurityRequirementObject = {};
                    securityRequirement[schemeName] = [];
                    return securityRequirement;
                });
            }
        }

        return undefined;
    }

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
                v2Examples: undefined,
                clientDefault: undefined
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
            operation: this.operation as object,
            baseDir: this.context.documentBaseDir
        });
        const fernExamples = fernExamplesExtension.convert() ?? [];

        const redoclyCodeSamplesExtension = new RedoclyCodeSamplesExtension({
            context: this.context,
            breadcrumbs: this.breadcrumbs,
            operation: this.operation as object,
            baseDir: this.context.documentBaseDir
        });
        const redoclyCodeSamples = redoclyCodeSamplesExtension.convert() ?? [];

        const hasFernCodeSamples = fernExamples.some(
            (example) => Array.isArray(example["code-samples"]) && example["code-samples"].length > 0
        );
        const allExamples = hasFernCodeSamples ? fernExamples : [...fernExamples, ...redoclyCodeSamples];

        if (allExamples.length === 0) {
            return { examples: {}, streamExamples: {} };
        }
        if (this.streamingExtension?.type === "streamCondition") {
            return this.convertStreamConditionExamples({ httpPath, httpMethod, baseUrl, fernExamples: allExamples });
        }
        return {
            examples: this.convertEndpointExamples({ httpPath, httpMethod, baseUrl, fernExamples: allExamples }),
            streamExamples: {}
        };
    }

    /**
     * Synthesizes endpoint-level v2Examples from native OpenAPI request body
     * examples (mediaType.example / mediaType.examples) when no x-fern-examples
     * or x-code-samples extensions are present.
     *
     * This ensures that specs like Close's, which have native examples on
     * schemaless request bodies, get rendered in docs and code snippets.
     *
     * Also extracts native response examples from the operation's successful (2xx)
     * responses so that the 200 response panel is preserved in docs.
     */
    private synthesizeEndpointExamplesFromNativeRequestBody({
        httpPath,
        httpMethod,
        baseUrl
    }: {
        httpPath: HttpPath;
        httpMethod: FernIr.HttpMethod;
        baseUrl: string | undefined;
    }): Record<string, FernIr.V2HttpEndpointExample> | undefined {
        if (this.operation.requestBody == null) {
            return undefined;
        }
        const resolvedRequestBody = this.context.resolveMaybeReference<OpenAPIV3_1.RequestBodyObject>({
            schemaOrReference: this.operation.requestBody,
            breadcrumbs: [...this.breadcrumbs, "requestBody"]
        });
        if (resolvedRequestBody == null) {
            return undefined;
        }

        // Extract the first native response example from a successful (2xx) response
        const responseExample = this.extractNativeResponseExample();

        const result: Record<string, FernIr.V2HttpEndpointExample> = {};
        for (const [, mediaType] of Object.entries(resolvedRequestBody.content)) {
            // Only synthesize for schemaless media types. Media types WITH schemas
            // already have their examples handled by the normal schema-based pipeline.
            if (mediaType.schema != null) {
                continue;
            }
            const namedExamples = this.context.getNamedExamplesFromMediaTypeObject({
                mediaTypeObject: mediaType,
                breadcrumbs: [...this.breadcrumbs, "requestBody"],
                defaultExampleName: "Example"
            });
            for (const [name, example] of namedExamples) {
                const resolvedValue = this.context.resolveExampleWithValue(example);
                if (resolvedValue != null) {
                    result[name] = {
                        displayName: undefined,
                        request: {
                            docs: undefined,
                            endpoint: {
                                method: httpMethod,
                                path: this.buildExamplePath(httpPath, {})
                            },
                            baseUrl: undefined,
                            environment: baseUrl,
                            auth: undefined,
                            pathParameters: {},
                            queryParameters: {},
                            headers: {},
                            requestBody: resolvedValue
                        },
                        response: responseExample,
                        codeSamples: undefined
                    };
                }
            }
        }

        return Object.keys(result).length > 0 ? result : undefined;
    }

    /**
     * Extracts the first native example from the operation's successful (2xx) response.
     * This is used to populate the response body in synthesized endpoint examples
     * so that the 200 response panel is preserved in docs.
     */
    private extractNativeResponseExample(): FernIr.V2HttpEndpointResponse | undefined {
        if (this.operation.responses == null) {
            return undefined;
        }
        for (const [statusCode, response] of Object.entries(this.operation.responses)) {
            const statusCodeNum = parseInt(statusCode);
            if (isNaN(statusCodeNum) || statusCodeNum < 200 || statusCodeNum >= 300) {
                continue;
            }
            const resolvedResponse = this.context.resolveMaybeReference<OpenAPIV3_1.ResponseObject>({
                schemaOrReference: response,
                breadcrumbs: [...this.breadcrumbs, "responses", statusCode]
            });
            if (resolvedResponse?.content == null) {
                continue;
            }
            for (const [, responseMediaType] of Object.entries(resolvedResponse.content)) {
                const namedExamples = this.context.getNamedExamplesFromMediaTypeObject({
                    mediaTypeObject: responseMediaType,
                    breadcrumbs: [...this.breadcrumbs, "responses", statusCode],
                    defaultExampleName: "Example"
                });
                for (const [, example] of namedExamples) {
                    const resolvedValue = this.context.resolveExampleWithValue(example);
                    if (resolvedValue != null) {
                        return {
                            docs: undefined,
                            statusCode: statusCodeNum,
                            body: FernIr.V2HttpEndpointResponseBody.json(resolvedValue)
                        };
                    }
                }
            }
        }
        return undefined;
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
                        displayName: undefined,
                        request:
                            example.request != null ||
                            example["path-parameters"] != null ||
                            example["query-parameters"] != null ||
                            example.headers != null
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
                                      requestBody: example.request ?? undefined
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

    /**
     * Gets the example name from x-fern-examples extension.
     *
     * Note: This uses the 'name' field directly without collision
     * disambiguation. This is intentional because x-fern-examples is a
     * Fern-specific extension where users explicitly provide unique names.
     */
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
        const serverFromOperationNameExtension = new Extensions.ServerFromOperationNameExtension({
            breadcrumbs: this.breadcrumbs,
            operation: this.operation,
            context: this.context
        });
        const serverFromOperationName = serverFromOperationNameExtension.convert();
        if (serverFromOperationName != null) {
            this.context.logger.debug(
                `[getEndpointBaseUrl] Endpoint ${this.method.toUpperCase()} ${this.path} specifies a server with "${FernOpenAPIExtension.SERVER_NAME_V2}" extension. Returning server type: ${serverFromOperationName}`
            );
            return serverFromOperationName;
        }

        const operationServer = this.operation.servers?.[0] ?? this.pathLevelServers?.[0];
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
        const operationServers = this.operation.servers ?? this.pathLevelServers;
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
        let rawOperationTag = this.operation.tags?.[0];
        if (rawOperationTag != null) {
            rawOperationTag = this.context.getDisplayNameForTag(rawOperationTag);
        }
        const baseGroupName = group?.[group.length - 1];
        if (baseGroupName != null && rawOperationTag != null) {
            const lowerCaseRawOperationTag = rawOperationTag.toLowerCase().replaceAll(" ", "");
            return lowerCaseRawOperationTag === baseGroupName ? rawOperationTag : undefined;
        }
        return undefined;
    }
}
