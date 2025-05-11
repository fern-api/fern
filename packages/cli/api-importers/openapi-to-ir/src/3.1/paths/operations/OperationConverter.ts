import { OpenAPIV3_1 } from "openapi-types";

import { FernIr, HttpEndpoint, HttpEndpointSource } from "@fern-api/ir-sdk";
import { constructHttpPath } from "@fern-api/ir-utils";
import { AbstractConverter, ServersConverter } from "@fern-api/v2-importer-commons";

import { FernExamplesExtension } from "../../../extensions/x-fern-examples";
import { FernStreamingExtension } from "../../../extensions/x-fern-streaming";
import { AbstractOperationConverter } from "./AbstractOperationConverter";

export declare namespace OperationConverter {
    export interface Args extends AbstractOperationConverter.Args {
        idempotent: boolean | undefined;
        servers?: OpenAPIV3_1.ServerObject[];
        idToAuthScheme?: Record<string, FernIr.AuthScheme>;
    }

    export interface Output extends AbstractOperationConverter.Output {
        endpoint: HttpEndpoint;
        audiences: string[];
        errors: Record<FernIr.ErrorId, FernIr.ErrorDeclaration>;
        servers?: OpenAPIV3_1.ServerObject[];
    }
}

export class OperationConverter extends AbstractOperationConverter {
    private readonly idempotent: boolean | undefined;
    private readonly servers?: OpenAPIV3_1.ServerObject[];
    private readonly streamingExtensionConverter: FernStreamingExtension;
    private readonly idToAuthScheme?: Record<string, FernIr.AuthScheme>;

    private static readonly AUTHORIZATION_HEADER = "Authorization";

    constructor({
        context,
        breadcrumbs,
        operation,
        method,
        path,
        idempotent,
        servers,
        idToAuthScheme
    }: OperationConverter.Args) {
        super({ context, breadcrumbs, operation, method, path });
        this.idempotent = idempotent;
        this.servers = servers;
        this.idToAuthScheme = idToAuthScheme;
        this.streamingExtensionConverter = new FernStreamingExtension({
            breadcrumbs: this.breadcrumbs,
            operation: this.operation,
            context: this.context
        });
    }

    public convert(): OperationConverter.Output | undefined {
        const httpMethod = this.convertHttpMethod();
        if (httpMethod == null) {
            return undefined;
        }

        const { group, method } =
            this.computeGroupNameAndLocationFromExtensions() ?? this.computeGroupNameFromTagAndOperationId();

        const streamingExtension = this.streamingExtensionConverter.convert();

        const { headers, pathParameters, queryParameters } = this.convertParameters({
            breadcrumbs: [...this.breadcrumbs, "parameters"]
        });

        const convertedRequestBody = this.convertRequestBody({
            breadcrumbs: [...this.breadcrumbs, "requestBody"],
            group,
            method
        });
        const requestBody = convertedRequestBody != null ? convertedRequestBody.value : undefined;

        const convertedResponseBody = this.convertResponseBody({
            breadcrumbs: [...this.breadcrumbs, "responses"],
            group,
            method,
            streamingExtension
        });
        const response = convertedResponseBody != null ? convertedResponseBody.value : undefined;
        const server = this.operation.servers?.[0] ?? this.servers?.[0];
        const convertedEndpointErrors = convertedResponseBody != null ? convertedResponseBody.errors : [];
        const errors = convertedEndpointErrors.map((convertedError) => convertedError.error);
        const topLevelErrors: Record<FernIr.ErrorId, FernIr.ErrorDeclaration> = {};

        const endpointId = [];
        if (this.context.namespace != null) {
            endpointId.push(this.context.namespace);
        }
        endpointId.push(...(group ?? []));
        endpointId.push(method);

        const path = constructHttpPath(this.path);
        const baseUrl = server != null ? ServersConverter.getServerName({ server, context: this.context }) : undefined;

        const fernExamples = this.convertExamples({
            pathHead: path.head,
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

        return {
            audiences:
                this.context.getAudiences({
                    operation: this.operation,
                    breadcrumbs: this.breadcrumbs
                }) ?? [],
            group,
            errors: topLevelErrors,
            endpoint: {
                id: endpointId.join("."),
                displayName: this.operation.summary,
                method: httpMethod,
                name: this.context.casingsGenerator.generateName(method),
                baseUrl,
                path,
                pathParameters,
                queryParameters,
                headers: headers.filter(
                    (header, index, self) => index === self.findIndex((h) => h.name.wireValue === header.name.wireValue)
                ),
                requestBody,
                sdkRequest: undefined,
                response,
                errors,
                auth: this.operation.security != null || this.context.spec.security != null,
                availability: this.context.getAvailability({
                    node: this.operation,
                    breadcrumbs: this.breadcrumbs
                }),
                docs: this.operation.description,
                userSpecifiedExamples: [],
                autogeneratedExamples: [],
                idempotent: this.idempotent ?? false,
                basePath: undefined,
                fullPath: path,
                allPathParameters: pathParameters,
                pagination: undefined,
                transport: undefined,
                v2Examples: {
                    autogeneratedExamples: {},
                    userSpecifiedExamples: fernExamples
                },
                source: HttpEndpointSource.openapi()
            },
            inlinedTypes: this.inlinedTypes,
            servers: this.filterOutTopLevelServers(this.operation.servers ?? [])
        };
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

            switch (authScheme.type) {
                case "bearer":
                    headers.push({
                        name: {
                            name: this.context.casingsGenerator.generateName(OperationConverter.AUTHORIZATION_HEADER),
                            wireValue: OperationConverter.AUTHORIZATION_HEADER
                        },
                        valueType: AbstractConverter.STRING,
                        availability: undefined,
                        docs: undefined,
                        env: undefined,
                        v2Examples: undefined
                    });
                    break;
                case "basic":
                    headers.push({
                        name: {
                            name: this.context.casingsGenerator.generateName(OperationConverter.AUTHORIZATION_HEADER),
                            wireValue: OperationConverter.AUTHORIZATION_HEADER
                        },
                        valueType: AbstractConverter.STRING,
                        availability: undefined,
                        docs: undefined,
                        env: undefined,
                        v2Examples: undefined
                    });
                    break;
                case "header":
                    headers.push({
                        name: authScheme.name,
                        valueType: AbstractConverter.STRING,
                        availability: undefined,
                        docs: undefined,
                        env: undefined,
                        v2Examples: undefined
                    });
                    break;
            }
        }

        return headers;
    }

    private convertExamples({
        pathHead,
        httpMethod,
        baseUrl
    }: {
        pathHead: string;
        httpMethod: FernIr.HttpMethod;
        baseUrl: string | undefined;
    }): Record<string, FernIr.V2HttpEndpointExample> {
        const fernExamplesExtension = new FernExamplesExtension({
            context: this.context,
            breadcrumbs: this.breadcrumbs,
            operation: this.operation as object
        });
        const fernExamples = fernExamplesExtension.convert();
        if (fernExamples == null) {
            return {};
        }
        return Object.fromEntries(
            fernExamples.map((example, index) => {
                return [
                    example.id ?? index.toString(),
                    {
                        request: {
                            docs: undefined,
                            endpoint: {
                                method: httpMethod,
                                path: pathHead
                            },
                            baseUrl: undefined,
                            environment: baseUrl,
                            auth: undefined,
                            pathParameters: example["path-parameters"] ?? {},
                            queryParameters: example["query-parameters"] ?? {},
                            headers: example.headers ?? {},
                            requestBody: example.request
                        },
                        response: {
                            docs: undefined,
                            statusCode: undefined,
                            body: FernIr.V2HttpEndpointResponseBody.json(example.response)
                        },
                        codeSamples: example["code-samples"]?.map((codeSample) => {
                            const language =
                                ("language" in codeSample ? codeSample.language : codeSample.sdk) ?? undefined;
                            return {
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

    private filterOutTopLevelServers(servers: OpenAPIV3_1.ServerObject[]): OpenAPIV3_1.ServerObject[] {
        return servers.filter(
            (server) => !this.context.spec.servers?.some((topLevelServer) => topLevelServer.url === server.url)
        );
    }
}
