import { getOriginalName } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { Fetcher, GetReferenceOpts, PackageId } from "@fern-typescript/commons";
import { EndpointSampleCode, FileContext, GeneratedEndpointImplementation } from "@fern-typescript/contexts";
import { OptionalKind, ParameterDeclarationStructure, ts } from "ts-morph";
import { GeneratedEndpointRequest } from "../endpoint-request/GeneratedEndpointRequest.js";
import { GeneratedSdkClientClassImpl } from "../GeneratedSdkClientClassImpl.js";
import { getReadableTypeNode } from "../getReadableTypeNode.js";
import { GeneratedEndpointResponse } from "./default/endpoint-response/GeneratedEndpointResponse.js";
import { buildUrl } from "./utils/buildUrl.js";
import { generateEndpointMetadata } from "./utils/generateEndpointMetadata.js";
import { getAvailabilityDocs } from "./utils/getAvailabilityDocs.js";
import {
    getAbortSignalExpression,
    getMaxRetriesExpression,
    getRequestOptionsParameter,
    getTimeoutExpression
} from "./utils/requestOptionsParameter.js";

export const RECONNECT_FUNCTION_VARIABLE_NAME = "_reconnect";

export declare namespace GeneratedStreamingEndpointImplementation {
    export interface Init {
        packageId: PackageId;
        endpoint: FernIr.HttpEndpoint;
        response: GeneratedEndpointResponse;
        generatedSdkClientClass: GeneratedSdkClientClassImpl;
        includeCredentialsOnCrossOriginRequests: boolean;
        defaultTimeout: number | "infinity" | undefined;
        request: GeneratedEndpointRequest;
        includeSerdeLayer: boolean;
        retainOriginalCasing: boolean;
        omitUndefined: boolean;
        streamType: "wrapper" | "web";
        generateEndpointMetadata: boolean;
        parameterNaming: "originalName" | "wireValue" | "camelCase" | "snakeCase" | "default";
    }
}

export class GeneratedStreamingEndpointImplementation implements GeneratedEndpointImplementation {
    public static readonly DATA_PARAMETER_NAME = "data";

    public readonly endpoint: FernIr.HttpEndpoint;

    public readonly response: GeneratedEndpointResponse;
    private readonly generatedSdkClientClass: GeneratedSdkClientClassImpl;
    private readonly includeCredentialsOnCrossOriginRequests: boolean;
    private readonly defaultTimeout: number | "infinity" | undefined;
    private readonly request: GeneratedEndpointRequest;
    private readonly includeSerdeLayer: boolean;
    private readonly retainOriginalCasing: boolean;
    private readonly omitUndefined: boolean;
    private readonly streamType: "wrapper" | "web";
    private readonly generateEndpointMetadata: boolean;
    private readonly parameterNaming: "originalName" | "wireValue" | "camelCase" | "snakeCase" | "default";

    constructor({
        endpoint,
        generatedSdkClientClass,
        includeCredentialsOnCrossOriginRequests,
        response,
        defaultTimeout,
        request,
        includeSerdeLayer,
        retainOriginalCasing,
        omitUndefined,
        streamType,
        generateEndpointMetadata,
        parameterNaming
    }: GeneratedStreamingEndpointImplementation.Init) {
        this.endpoint = endpoint;
        this.generatedSdkClientClass = generatedSdkClientClass;
        this.includeCredentialsOnCrossOriginRequests = includeCredentialsOnCrossOriginRequests;
        this.response = response;
        this.defaultTimeout = defaultTimeout;
        this.request = request;
        this.includeSerdeLayer = includeSerdeLayer;
        this.retainOriginalCasing = retainOriginalCasing;
        this.omitUndefined = omitUndefined;
        this.streamType = streamType;
        this.generateEndpointMetadata = generateEndpointMetadata;
        this.parameterNaming = parameterNaming;
    }

    public isPaginated(context: FileContext): boolean {
        return false;
    }

    public getExample(args: {
        context: FileContext;
        example: FernIr.ExampleEndpointCall;
        opts: GetReferenceOpts;
        clientReference: ts.Identifier;
    }): EndpointSampleCode | undefined {
        const imports = this.request.getExampleEndpointImports({
            context: args.context,
            example: args.example,
            opts: { ...args.opts, isForRequest: true }
        });
        const exampleParameters = this.request.getExampleEndpointParameters({
            context: args.context,
            example: args.example,
            opts: { ...args.opts, isForRequest: true }
        });
        if (exampleParameters == null) {
            return undefined;
        }
        return {
            imports,
            endpointInvocation: ts.factory.createAwaitExpression(
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        this.generatedSdkClientClass.accessFromRootClient({
                            referenceToRootClient: args.clientReference
                        }),
                        ts.factory.createIdentifier(args.context.case.camelUnsafe(this.endpoint.name))
                    ),
                    undefined,
                    exampleParameters
                )
            )
        };
    }

    public maybeLeverageInvocation({
        invocation,
        context
    }: {
        invocation: ts.Expression;
        context: FileContext;
    }): ts.Node[] {
        const responseVariableName = "response";
        const itemVariableName = "item";
        return [
            ts.factory.createVariableStatement(
                undefined,
                ts.factory.createVariableDeclarationList(
                    [
                        ts.factory.createVariableDeclaration(
                            ts.factory.createIdentifier(responseVariableName),
                            undefined,
                            undefined,
                            invocation
                        )
                    ],
                    ts.NodeFlags.Const
                )
            ),
            ts.factory.createForOfStatement(
                ts.factory.createToken(ts.SyntaxKind.AwaitKeyword),
                ts.factory.createVariableDeclarationList(
                    [
                        ts.factory.createVariableDeclaration(
                            ts.factory.createIdentifier(itemVariableName),
                            undefined,
                            undefined,
                            undefined
                        )
                    ],
                    ts.NodeFlags.Const
                ),
                ts.factory.createIdentifier(responseVariableName),
                ts.factory.createBlock(
                    [
                        ts.factory.createExpressionStatement(
                            ts.factory.createCallExpression(
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createIdentifier("console"),
                                    ts.factory.createIdentifier("log")
                                ),
                                undefined,
                                [ts.factory.createIdentifier(itemVariableName)]
                            )
                        )
                    ],
                    true
                )
            )
        ];
    }

    public getOverloads(): GeneratedEndpointImplementation.EndpointSignature[] {
        return [];
    }

    public getSignature(context: FileContext): GeneratedEndpointImplementation.EndpointSignature {
        const returnType = this.response.getReturnType(context);
        return {
            parameters: this.getEndpointParameters(context),
            returnTypeWithoutPromise: returnType
        };
    }

    private getEndpointParameters(context: FileContext): OptionalKind<ParameterDeclarationStructure>[] {
        return [
            ...this.request.getEndpointParameters(context),
            getRequestOptionsParameter({
                requestOptionsReference: this.generatedSdkClientClass.getReferenceToRequestOptions(this.endpoint)
            })
        ];
    }

    public getDocs(): string | undefined {
        const groups: string[] = [];
        const availabilityDoc = getAvailabilityDocs(this.endpoint);
        if (availabilityDoc != null) {
            groups.push(availabilityDoc);
        }
        if (this.endpoint.docs) {
            groups.push(this.endpoint.docs);
        }
        if (groups.length === 0) {
            return undefined;
        }
        return groups.join("\n\n");
    }

    public getStatements(context: FileContext): ts.Statement[] {
        return [
            ...(this.generateEndpointMetadata
                ? generateEndpointMetadata({
                      httpEndpoint: this.endpoint,
                      context
                  })
                : []),
            ...this.getRequestBuilderStatements(context),
            ...this.invokeFetcher(context),
            ...this.response.getReturnResponseStatements(context)
        ];
    }

    public getRequestBuilderStatements(context: FileContext): ts.Statement[] {
        return this.request.getBuildRequestStatements(context);
    }

    private getReferenceToBaseUrl(context: FileContext): ts.Expression {
        const baseUrl = this.generatedSdkClientClass.getBaseUrl(this.endpoint, context);
        const url = buildUrl({
            endpoint: this.endpoint,
            generatedClientClass: this.generatedSdkClientClass,
            context,
            includeSerdeLayer: this.includeSerdeLayer,
            retainOriginalCasing: this.retainOriginalCasing,
            omitUndefined: this.omitUndefined,
            getReferenceToPathParameterVariableFromRequest: (pathParameter) => {
                return this.request.getReferenceToPathParameter(getOriginalName(pathParameter.name), context);
            },
            parameterNaming: this.parameterNaming
        });
        if (url != null) {
            return context.coreUtilities.urlUtils.join._invoke([baseUrl, url]);
        } else {
            return baseUrl;
        }
    }

    private getResponseTypeForStreaming(): Fetcher.Args["responseType"] {
        const responseBody = this.endpoint.response?.body;
        if (responseBody?.type === "streaming" && responseBody.value.type === "sse") {
            return "sse";
        }
        if (responseBody?.type === "streamParameter" && responseBody.streamResponse.type === "sse") {
            return "sse";
        }
        return "streaming";
    }

    /**
     * Checks whether the endpoint is a resumable SSE stream.
     *
     * This reads the raw IR endpoint response body, which may be either
     * `streaming` or `streamParameter`. Both cases are handled here because
     * `invokeFetcher` uses this to decide whether to emit `const _reconnect`.
     *
     * In `GeneratedThrowingEndpointResponse`, the `streamParameter` variant
     * is normalized to `HttpResponseBody.streaming(streamResponse)` before
     * construction (see GeneratedSdkClientClassImpl.ts), so the reconnect
     * options are wired through the `this.response?.type === "streaming"`
     * branch for both cases.
     */
    private isResumableSse(): boolean {
        const responseBody = this.endpoint.response?.body;
        if (responseBody?.type === "streaming" && responseBody.value.type === "sse") {
            return responseBody.value.resumable === true;
        }
        if (responseBody?.type === "streamParameter" && responseBody.streamResponse.type === "sse") {
            return responseBody.streamResponse.resumable === true;
        }
        return false;
    }

    public invokeFetcher(context: FileContext): ts.Statement[] {
        const fetcherArgs: Fetcher.Args = {
            ...this.request.getFetcherRequestArgs(context),
            url: this.getReferenceToBaseUrl(context),
            method: ts.factory.createStringLiteral(this.endpoint.method),
            timeoutInSeconds: getTimeoutExpression({
                defaultTimeout: this.defaultTimeout,
                timeoutInSecondsReference: this.generatedSdkClientClass.getReferenceToTimeoutInSeconds.bind(
                    this.generatedSdkClientClass
                ),
                referenceToOptions: this.generatedSdkClientClass.getReferenceToOptions()
            }),
            maxRetries: getMaxRetriesExpression({
                endpoint: this.endpoint,
                maxRetriesReference: this.generatedSdkClientClass.getReferenceToMaxRetries.bind(
                    this.generatedSdkClientClass
                ),
                referenceToOptions: this.generatedSdkClientClass.getReferenceToOptions()
            }),
            abortSignal: getAbortSignalExpression({
                abortSignalReference: this.generatedSdkClientClass.getReferenceToAbortSignal.bind(
                    this.generatedSdkClientClass
                )
            }),
            fetchFn: this.generatedSdkClientClass.getReferenceToFetch(),
            logging: this.generatedSdkClientClass.getReferenceToLogger(context),
            responseType: this.getResponseTypeForStreaming(),
            withCredentials: this.includeCredentialsOnCrossOriginRequests,
            endpointMetadata: this.generateEndpointMetadata
                ? this.generatedSdkClientClass.getReferenceToMetadataForEndpointSupplier()
                : undefined
        };

        const statements: ts.Statement[] = [
            ts.factory.createVariableStatement(
                undefined,
                ts.factory.createVariableDeclarationList(
                    [
                        ts.factory.createVariableDeclaration(
                            this.response.getResponseVariableName(),
                            undefined,
                            undefined,
                            context.coreUtilities.fetcher.fetcher._invoke(fetcherArgs, {
                                referenceToFetcher: this.generatedSdkClientClass.getReferenceToFetcher(context),
                                cast: getReadableTypeNode({
                                    typeArgument: undefined,
                                    context,
                                    streamType: this.streamType
                                })
                            })
                        )
                    ],
                    ts.NodeFlags.Const
                )
            )
        ];

        if (this.isResumableSse()) {
            statements.push(this.generateReconnectFunction(context, fetcherArgs));
        }

        return statements;
    }

    /**
     * Generates the `_reconnect` arrow function that re-issues the original
     * request with a `Last-Event-ID` header.
     *
     * TODO: Headers are resolved once at the original call site and reused
     * verbatim on reconnect. For auth suppliers that return refreshing tokens,
     * a long-lived stream that drops after the token expires will reconnect
     * with a stale credential (resulting in a 401 treated as a failed reconnect
     * attempt). A future enhancement should re-resolve headers on each
     * reconnection to support token refresh.
     */
    private generateReconnectFunction(context: FileContext, originalFetcherArgs: Fetcher.Args): ts.Statement {
        const lastEventIdParam = ts.factory.createParameterDeclaration(
            undefined,
            undefined,
            "lastEventId",
            undefined,
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
        );

        const headerElements: ts.ObjectLiteralElementLike[] = [];
        if (originalFetcherArgs.headers != null) {
            headerElements.push(ts.factory.createSpreadAssignment(originalFetcherArgs.headers));
        }
        headerElements.push(
            ts.factory.createPropertyAssignment(
                ts.factory.createStringLiteral("Last-Event-ID"),
                ts.factory.createIdentifier("lastEventId")
            )
        );

        const reconnectFetcherArgs: Fetcher.Args = {
            ...originalFetcherArgs,
            headers: ts.factory.createObjectLiteralExpression(headerElements, false)
        };

        const reconnectResponseVar = "_reconnectResponse";
        const fetcherInvocation = context.coreUtilities.fetcher.fetcher._invoke(reconnectFetcherArgs, {
            referenceToFetcher: this.generatedSdkClientClass.getReferenceToFetcher(context),
            cast: getReadableTypeNode({
                typeArgument: undefined,
                context,
                streamType: this.streamType
            })
        });

        const body = ts.factory.createBlock(
            [
                ts.factory.createVariableStatement(
                    undefined,
                    ts.factory.createVariableDeclarationList(
                        [
                            ts.factory.createVariableDeclaration(
                                reconnectResponseVar,
                                undefined,
                                undefined,
                                fetcherInvocation
                            )
                        ],
                        ts.NodeFlags.Const
                    )
                ),
                ts.factory.createIfStatement(
                    ts.factory.createPrefixUnaryExpression(
                        ts.SyntaxKind.ExclamationToken,
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier(reconnectResponseVar),
                            ts.factory.createIdentifier("ok")
                        )
                    ),
                    ts.factory.createBlock(
                        [
                            ts.factory.createThrowStatement(
                                ts.factory.createNewExpression(ts.factory.createIdentifier("Error"), undefined, [
                                    ts.factory.createStringLiteral("SSE stream reconnection failed")
                                ])
                            )
                        ],
                        true
                    )
                ),
                ts.factory.createIfStatement(
                    ts.factory.createBinaryExpression(
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier(reconnectResponseVar),
                            ts.factory.createIdentifier("body")
                        ),
                        ts.factory.createToken(ts.SyntaxKind.EqualsEqualsToken),
                        ts.factory.createNull()
                    ),
                    ts.factory.createBlock(
                        [
                            ts.factory.createThrowStatement(
                                ts.factory.createNewExpression(ts.factory.createIdentifier("Error"), undefined, [
                                    ts.factory.createStringLiteral(
                                        "SSE stream reconnection failed: empty response body"
                                    )
                                ])
                            )
                        ],
                        true
                    )
                ),
                ts.factory.createReturnStatement(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier(reconnectResponseVar),
                        ts.factory.createIdentifier("body")
                    )
                )
            ],
            true
        );

        const reconnectArrowFn = ts.factory.createArrowFunction(
            [ts.factory.createToken(ts.SyntaxKind.AsyncKeyword)],
            undefined,
            [lastEventIdParam],
            undefined,
            ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
            body
        );

        return ts.factory.createVariableStatement(
            undefined,
            ts.factory.createVariableDeclarationList(
                [
                    ts.factory.createVariableDeclaration(
                        RECONNECT_FUNCTION_VARIABLE_NAME,
                        undefined,
                        undefined,
                        reconnectArrowFn
                    )
                ],
                ts.NodeFlags.Const
            )
        );
    }

    public getReferenceToRequestBody(context: FileContext): ts.Expression | undefined {
        return this.request.getReferenceToRequestBody(context);
    }

    public getReferenceToPathParameter(pathParameterKey: string, context: FileContext): ts.Expression {
        return this.request.getReferenceToPathParameter(pathParameterKey, context);
    }

    public getReferenceToQueryParameter(queryParameterKey: string, context: FileContext): ts.Expression {
        return this.request.getReferenceToQueryParameter(queryParameterKey, context);
    }
}
