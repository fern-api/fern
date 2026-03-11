import { FernIr } from "@fern-fern/ir-sdk";
import { getTextOfTsNode, PackageId } from "@fern-typescript/commons";
import { createHttpEndpoint } from "@fern-typescript/test-utils";
import { ts } from "ts-morph";
import { assert, describe, expect, it } from "vitest";
import type { GeneratedEndpointRequest } from "../endpoint-request/GeneratedEndpointRequest.js";
import type { GeneratedEndpointResponse } from "../endpoints/default/endpoint-response/GeneratedEndpointResponse.js";
import { GeneratedStreamingEndpointImplementation } from "../endpoints/GeneratedStreamingEndpointImplementation.js";

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

function serializeStatements(statements: ts.Statement[]): string {
    return statements.map((s) => getTextOfTsNode(s)).join("\n");
}

function serializeNodes(nodes: ts.Node[]): string {
    return nodes.map((n) => getTextOfTsNode(n)).join("\n");
}

/**
 * Creates a mock GeneratedEndpointRequest for streaming endpoint tests.
 */
function createMockRequest(opts?: {
    endpointParameters?: { name: string; type: string; docs?: string }[];
    buildStatements?: ts.Statement[];
    fetcherArgs?: Record<string, ts.Expression>;
    exampleParameters?: ts.Expression[];
    exampleImports?: ts.Statement[];
}): GeneratedEndpointRequest {
    return {
        getEndpointParameters: () =>
            (opts?.endpointParameters ?? []).map((p) => ({
                name: p.name,
                type: p.type,
                hasQuestionToken: false,
                docs: p.docs
            })),
        getBuildRequestStatements: () => opts?.buildStatements ?? [],
        getFetcherRequestArgs: () => ({
            headers: opts?.fetcherArgs?.headers,
            queryParameters: opts?.fetcherArgs?.queryParameters,
            body: opts?.fetcherArgs?.body,
            contentType: undefined,
            requestType: undefined
        }),
        getRequestParameter: () => undefined,
        getReferenceToRequestBody: () => undefined,
        getReferenceToPathParameter: (key: string) => ts.factory.createIdentifier(key),
        getReferenceToQueryParameter: (key: string) => ts.factory.createIdentifier(key),
        getExampleEndpointParameters: () => opts?.exampleParameters ?? [ts.factory.createStringLiteral("example-arg")],
        getExampleEndpointImports: () => opts?.exampleImports ?? []
        // biome-ignore lint/suspicious/noExplicitAny: test mock for GeneratedEndpointRequest
    } as any;
}

/**
 * Creates a mock GeneratedEndpointResponse for streaming endpoint tests.
 */
function createMockResponse(opts?: {
    returnType?: ts.TypeNode;
    responseVariableName?: string;
    returnStatements?: ts.Statement[];
    thrownExceptions?: string[];
}): GeneratedEndpointResponse {
    return {
        getReturnType: () =>
            opts?.returnType ??
            ts.factory.createTypeReferenceNode("AsyncIterable", [ts.factory.createTypeReferenceNode("StreamEvent")]),
        getResponseVariableName: () => opts?.responseVariableName ?? "_response",
        getReturnResponseStatements: () =>
            opts?.returnStatements ?? [ts.factory.createReturnStatement(ts.factory.createIdentifier("_response"))],
        getNamesOfThrownExceptions: () => opts?.thrownExceptions ?? [],
        getPaginationInfo: () => undefined
    };
}

/**
 * Creates a mock GeneratedSdkClientClassImpl for streaming endpoint tests.
 */
// biome-ignore lint/suspicious/noExplicitAny: test mock needs to satisfy complex interface
function createMockClientClass(): any {
    return {
        getBaseUrl: () => ts.factory.createIdentifier("this._options.baseUrl"),
        getReferenceToOptions: () =>
            ts.factory.createPropertyAccessExpression(ts.factory.createThis(), ts.factory.createIdentifier("_options")),
        getReferenceToTimeoutInSeconds: () => ts.factory.createIdentifier("this._options.timeoutInSeconds"),
        getReferenceToMaxRetries: () => ts.factory.createIdentifier("this._options.maxRetries"),
        getReferenceToAbortSignal: () => ts.factory.createIdentifier("requestOptions?.abortSignal"),
        getReferenceToFetch: () => undefined,
        getReferenceToLogger: () => undefined,
        getReferenceToFetcher: () => ts.factory.createIdentifier("this._options.fetcher"),
        getReferenceToRequestOptions: () => ts.factory.createTypeReferenceNode("RequestOptions"),
        getReferenceToMetadataForEndpointSupplier: () => undefined,
        accessFromRootClient: ({ referenceToRootClient }: { referenceToRootClient: ts.Identifier }) =>
            ts.factory.createPropertyAccessExpression(referenceToRootClient, ts.factory.createIdentifier("service")),
        hasAuthProvider: () => false,
        getGenerateEndpointMetadata: () => false,
        getReferenceToAuthProviderOrThrow: () => ts.factory.createIdentifier("this._authProvider"),
        getEnvironment: () => undefined
    };
}

/**
 * Creates a mock SdkContext for streaming endpoint tests.
 */
// biome-ignore lint/suspicious/noExplicitAny: test mock needs to satisfy complex SdkContext interface
function createMockSdkContext(): any {
    return {
        coreUtilities: {
            fetcher: {
                EndpointMetadata: {
                    _getReferenceToType: () => ts.factory.createTypeReferenceNode("core.EndpointMetadata")
                },
                fetcher: {
                    _invoke: (
                        // biome-ignore lint/suspicious/noExplicitAny: test mock
                        _args: any,
                        // biome-ignore lint/suspicious/noExplicitAny: test mock
                        invokeOpts: any
                    ) =>
                        ts.factory.createAwaitExpression(
                            ts.factory.createCallExpression(
                                ts.factory.createPropertyAccessExpression(
                                    invokeOpts.referenceToFetcher,
                                    ts.factory.createIdentifier("fetch")
                                ),
                                undefined,
                                [ts.factory.createObjectLiteralExpression([], true)]
                            )
                        )
                },
                BinaryResponse: {
                    _getReferenceToType: () => ts.factory.createTypeReferenceNode("core.BinaryResponse")
                }
            },
            urlUtils: {
                join: {
                    _invoke: (args: ts.Expression[]) =>
                        ts.factory.createCallExpression(ts.factory.createIdentifier("core.urlJoin"), undefined, args)
                }
            },
            streamUtils: {
                ReadableStream: {
                    _getReferenceToType: (typeArg?: ts.TypeNode) =>
                        typeArg
                            ? ts.factory.createTypeReferenceNode("ReadableStream", [typeArg])
                            : ts.factory.createTypeReferenceNode("ReadableStream")
                },
                Stream: {
                    _getReferenceToType: (typeArg?: ts.TypeNode) =>
                        typeArg
                            ? ts.factory.createTypeReferenceNode("core.Stream", [typeArg])
                            : ts.factory.createTypeReferenceNode("core.Stream")
                }
            }
        },
        externalDependencies: {
            stream: {
                Readable: {
                    _getReferenceToType: () => ts.factory.createTypeReferenceNode("Readable")
                }
            }
        }
    };
}

/**
 * Creates a GeneratedStreamingEndpointImplementation with configurable options.
 */
function createImpl(opts?: {
    endpoint?: FernIr.HttpEndpoint;
    request?: GeneratedEndpointRequest;
    response?: GeneratedEndpointResponse;
    includeCredentialsOnCrossOriginRequests?: boolean;
    defaultTimeoutInSeconds?: number | "infinity" | undefined;
    includeSerdeLayer?: boolean;
    retainOriginalCasing?: boolean;
    omitUndefined?: boolean;
    streamType?: "wrapper" | "web";
    generateEndpointMetadata?: boolean;
    parameterNaming?: "originalName" | "wireValue" | "camelCase" | "snakeCase" | "default";
    // biome-ignore lint/suspicious/noExplicitAny: test mock
    generatedSdkClientClass?: any;
}): GeneratedStreamingEndpointImplementation {
    return new GeneratedStreamingEndpointImplementation({
        packageId: { isRoot: true } as PackageId,
        endpoint: opts?.endpoint ?? createHttpEndpoint(),
        request: opts?.request ?? createMockRequest(),
        response: opts?.response ?? createMockResponse(),
        generatedSdkClientClass: opts?.generatedSdkClientClass ?? createMockClientClass(),
        includeCredentialsOnCrossOriginRequests: opts?.includeCredentialsOnCrossOriginRequests ?? false,
        defaultTimeoutInSeconds: opts?.defaultTimeoutInSeconds,
        includeSerdeLayer: opts?.includeSerdeLayer ?? true,
        retainOriginalCasing: opts?.retainOriginalCasing ?? false,
        omitUndefined: opts?.omitUndefined ?? false,
        streamType: opts?.streamType ?? "wrapper",
        generateEndpointMetadata: opts?.generateEndpointMetadata ?? false,
        parameterNaming: opts?.parameterNaming ?? "default"
    });
}

// ========================== Tests ==========================

describe("GeneratedStreamingEndpointImplementation", () => {
    describe("isPaginated", () => {
        it("always returns false", () => {
            const impl = createImpl();
            const context = createMockSdkContext();
            expect(impl.isPaginated(context)).toBe(false);
        });
    });

    describe("getOverloads", () => {
        it("always returns empty array", () => {
            const impl = createImpl();
            expect(impl.getOverloads()).toEqual([]);
        });
    });

    describe("getSignature", () => {
        it("returns parameters and streaming return type", () => {
            const impl = createImpl({
                request: createMockRequest({
                    endpointParameters: [{ name: "body", type: "StreamRequest" }]
                }),
                response: createMockResponse({
                    returnType: ts.factory.createTypeReferenceNode("AsyncIterable", [
                        ts.factory.createTypeReferenceNode("ChatEvent")
                    ])
                })
            });
            const context = createMockSdkContext();
            const sig = impl.getSignature(context);
            // endpoint param + requestOptions
            expect(sig.parameters).toHaveLength(2);
            expect(sig.parameters[0]?.name).toBe("body");
            expect(getTextOfTsNode(sig.returnTypeWithoutPromise)).toMatchSnapshot();
        });
    });

    describe("getDocs", () => {
        it("returns undefined when no docs or availability", () => {
            const impl = createImpl();
            const docs = impl.getDocs();
            expect(docs).toBeUndefined();
        });

        it("returns endpoint docs when present", () => {
            const endpoint = createHttpEndpoint({ docs: "Stream chat events in real time." });
            const impl = createImpl({ endpoint });
            const docs = impl.getDocs();
            expect(docs).toBe("Stream chat events in real time.");
        });

        it("includes availability docs when endpoint is deprecated", () => {
            const endpoint = createHttpEndpoint();
            endpoint.availability = {
                status: "DEPRECATED",
                message: "Use streamV2 instead"
            };
            const impl = createImpl({ endpoint });
            const docs = impl.getDocs();
            expect(docs).toContain("@deprecated");
        });

        it("combines availability and endpoint docs", () => {
            const endpoint = createHttpEndpoint({ docs: "Stream events." });
            endpoint.availability = {
                status: "DEPRECATED",
                message: undefined
            };
            const impl = createImpl({ endpoint });
            const docs = impl.getDocs();
            expect(docs).toMatchSnapshot();
        });
    });

    describe("getStatements", () => {
        it("generates streaming endpoint body", () => {
            const impl = createImpl();
            const context = createMockSdkContext();
            const stmts = impl.getStatements(context);
            const output = serializeStatements(stmts);
            expect(output).toMatchSnapshot();
        });

        it("generates streaming endpoint body with endpoint metadata", () => {
            const impl = createImpl({ generateEndpointMetadata: true });
            const context = createMockSdkContext();
            const stmts = impl.getStatements(context);
            const output = serializeStatements(stmts);
            expect(output).toMatchSnapshot();
        });

        it("includes request build statements", () => {
            const buildStmt = ts.factory.createVariableStatement(
                undefined,
                ts.factory.createVariableDeclarationList(
                    [
                        ts.factory.createVariableDeclaration(
                            "_body",
                            undefined,
                            undefined,
                            ts.factory.createObjectLiteralExpression([])
                        )
                    ],
                    ts.NodeFlags.Const
                )
            );
            const impl = createImpl({
                request: createMockRequest({ buildStatements: [buildStmt] })
            });
            const context = createMockSdkContext();
            const stmts = impl.getStatements(context);
            const output = serializeStatements(stmts);
            expect(output).toContain("_body");
        });
    });

    describe("getExample", () => {
        it("returns endpoint invocation example", () => {
            const impl = createImpl();
            const context = createMockSdkContext();
            const example = impl.getExample({
                context,
                example: createMinimalExampleEndpointCall(),
                opts: { isForComment: true },
                clientReference: ts.factory.createIdentifier("client")
            });
            expect(example).toBeDefined();
            assert(example?.endpointInvocation != null, "Expected endpointInvocation to be defined");
            expect(getTextOfTsNode(example.endpointInvocation)).toMatchSnapshot();
        });

        it("returns undefined when example parameters are null", () => {
            const request = createMockRequest();
            // biome-ignore lint/suspicious/noExplicitAny: test mock override
            (request as any).getExampleEndpointParameters = () => undefined;
            const impl = createImpl({ request });
            const context = createMockSdkContext();
            const example = impl.getExample({
                context,
                example: createMinimalExampleEndpointCall(),
                opts: {},
                clientReference: ts.factory.createIdentifier("client")
            });
            expect(example).toBeUndefined();
        });
    });

    describe("maybeLeverageInvocation", () => {
        it("returns for-await-of pattern for streaming", () => {
            const impl = createImpl();
            const context = createMockSdkContext();
            const result = impl.maybeLeverageInvocation({
                invocation: ts.factory.createIdentifier("result"),
                context
            });
            expect(result).toBeDefined();
            const output = serializeNodes(result);
            expect(output).toMatchSnapshot();
        });
    });

    describe("invokeFetcher", () => {
        it("generates fetcher invocation with streaming response type", () => {
            const impl = createImpl();
            const context = createMockSdkContext();
            const stmts = impl.invokeFetcher(context);
            const output = serializeStatements(stmts);
            expect(output).toMatchSnapshot();
        });

        it("includes withCredentials when enabled", () => {
            const impl = createImpl({ includeCredentialsOnCrossOriginRequests: true });
            const context = createMockSdkContext();
            const stmts = impl.invokeFetcher(context);
            const output = serializeStatements(stmts);
            expect(output).toMatchSnapshot();
        });

        it("uses web stream type when streamType is web", () => {
            const impl = createImpl({ streamType: "web" });
            const context = createMockSdkContext();
            const stmts = impl.invokeFetcher(context);
            const output = serializeStatements(stmts);
            expect(output).toMatchSnapshot();
        });
    });

    describe("SSE response type", () => {
        it("uses sse response type for SSE streaming endpoints", () => {
            const endpoint = createHttpEndpoint();
            endpoint.response = {
                body: FernIr.HttpResponseBody.streaming(
                    FernIr.StreamingResponse.sse({
                        payload: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                        terminator: undefined,
                        docs: undefined,
                        v2Examples: undefined
                    })
                ),
                statusCode: undefined,
                isWildcardStatusCode: undefined,
                docs: undefined
            };
            const impl = createImpl({ endpoint });
            const context = createMockSdkContext();
            const stmts = impl.invokeFetcher(context);
            const output = serializeStatements(stmts);
            expect(output).toMatchSnapshot();
        });

        it("uses sse response type for streamParameter SSE endpoints", () => {
            const endpoint = createHttpEndpoint();
            endpoint.response = {
                body: FernIr.HttpResponseBody.streamParameter({
                    streamResponse: FernIr.StreamingResponse.sse({
                        payload: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                        terminator: undefined,
                        docs: undefined,
                        v2Examples: undefined
                    }),
                    nonStreamResponse: FernIr.NonStreamHttpResponseBody.json(
                        FernIr.JsonResponse.response({
                            responseBodyType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                            docs: undefined,
                            v2Examples: undefined
                        })
                    )
                }),
                statusCode: undefined,
                isWildcardStatusCode: undefined,
                docs: undefined
            };
            const impl = createImpl({ endpoint });
            const context = createMockSdkContext();
            const stmts = impl.invokeFetcher(context);
            const output = serializeStatements(stmts);
            expect(output).toMatchSnapshot();
        });
    });

    describe("endpoint and response properties", () => {
        it("exposes endpoint from constructor", () => {
            const endpoint = createHttpEndpoint({ docs: "stream endpoint" });
            const impl = createImpl({ endpoint });
            expect(impl.endpoint).toBe(endpoint);
        });

        it("exposes response from constructor", () => {
            const response = createMockResponse();
            const impl = createImpl({ response });
            expect(impl.response).toBe(response);
        });
    });

    describe("delegation methods", () => {
        it("getReferenceToRequestBody delegates to request", () => {
            const impl = createImpl();
            const context = createMockSdkContext();
            expect(impl.getReferenceToRequestBody(context)).toBeUndefined();
        });

        it("getReferenceToPathParameter delegates to request", () => {
            const impl = createImpl();
            const context = createMockSdkContext();
            const ref = impl.getReferenceToPathParameter("userId", context);
            expect(getTextOfTsNode(ref)).toBe("userId");
        });

        it("getReferenceToQueryParameter delegates to request", () => {
            const impl = createImpl();
            const context = createMockSdkContext();
            const ref = impl.getReferenceToQueryParameter("limit", context);
            expect(getTextOfTsNode(ref)).toBe("limit");
        });
    });
});

// ──────────────────────────────────────────────────────────────────────────────
// IR factory helpers
// ──────────────────────────────────────────────────────────────────────────────

function createMinimalExampleEndpointCall(): FernIr.ExampleEndpointCall {
    return {
        id: undefined,
        name: undefined,
        url: "/test",
        rootPathParameters: [],
        endpointPathParameters: [],
        servicePathParameters: [],
        endpointHeaders: [],
        serviceHeaders: [],
        queryParameters: [],
        request: undefined,
        response: FernIr.ExampleResponse.ok(FernIr.ExampleEndpointSuccessResponse.body(undefined)),
        docs: undefined
    };
}
