import { FernIr } from "@fern-fern/ir-sdk";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { caseConverter, createHttpEndpoint, serializeStatements } from "@fern-typescript/test-utils";
import { ts } from "ts-morph";
import { assert, describe, expect, it } from "vitest";
import type { GeneratedEndpointRequest } from "../endpoint-request/GeneratedEndpointRequest.js";
import type { GeneratedEndpointResponse } from "../endpoints/default/endpoint-response/GeneratedEndpointResponse.js";
import { GeneratedFileDownloadEndpointImplementation } from "../endpoints/GeneratedFileDownloadEndpointImplementation.js";

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Creates a mock GeneratedEndpointRequest for file download endpoint tests.
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
 * Creates a mock GeneratedEndpointResponse for file download endpoint tests.
 */
function createMockResponse(opts?: {
    returnType?: ts.TypeNode;
    responseVariableName?: string;
    returnStatements?: ts.Statement[];
    thrownExceptions?: string[];
}): GeneratedEndpointResponse {
    return {
        getReturnType: () => opts?.returnType ?? ts.factory.createTypeReferenceNode("ReadableStream"),
        getResponseVariableName: () => opts?.responseVariableName ?? "_response",
        getReturnResponseStatements: () =>
            opts?.returnStatements ?? [ts.factory.createReturnStatement(ts.factory.createIdentifier("_response"))],
        getNamesOfThrownExceptions: () => opts?.thrownExceptions ?? [],
        getPaginationInfo: () => undefined
    };
}

/**
 * Creates a mock GeneratedSdkClientClassImpl for file download endpoint tests.
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
 * Creates a mock FileContext for file download endpoint tests.
 */
// biome-ignore lint/suspicious/noExplicitAny: test mock needs to satisfy complex FileContext interface
function createMockFileContext(): any {
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
        },
        case: caseConverter
    };
}

/**
 * Creates a GeneratedFileDownloadEndpointImplementation with configurable options.
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
    fileResponseType?: "stream" | "binary-response";
    generateEndpointMetadata?: boolean;
    parameterNaming?: "originalName" | "wireValue" | "camelCase" | "snakeCase" | "default";
    // biome-ignore lint/suspicious/noExplicitAny: test mock
    generatedSdkClientClass?: any;
}): GeneratedFileDownloadEndpointImplementation {
    return new GeneratedFileDownloadEndpointImplementation({
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
        fileResponseType: opts?.fileResponseType ?? "stream",
        generateEndpointMetadata: opts?.generateEndpointMetadata ?? false,
        parameterNaming: opts?.parameterNaming ?? "default"
    });
}

// ========================== Tests ==========================

describe("GeneratedFileDownloadEndpointImplementation", () => {
    describe("isPaginated", () => {
        it("always returns false", () => {
            const impl = createImpl();
            const context = createMockFileContext();
            expect(impl.isPaginated(context)).toBe(false);
        });
    });

    describe("getOverloads", () => {
        it("always returns empty array", () => {
            const impl = createImpl();
            expect(impl.getOverloads()).toEqual([]);
        });
    });

    describe("maybeLeverageInvocation", () => {
        it("always returns undefined", () => {
            const impl = createImpl();
            const context = createMockFileContext();
            const result = impl.maybeLeverageInvocation({
                invocation: ts.factory.createIdentifier("result"),
                context
            });
            expect(result).toBeUndefined();
        });
    });

    describe("getSignature", () => {
        it("returns parameters and return type for stream file download", () => {
            const impl = createImpl({
                request: createMockRequest({
                    endpointParameters: [{ name: "fileId", type: "string" }]
                }),
                response: createMockResponse({
                    returnType: ts.factory.createTypeReferenceNode("ReadableStream")
                })
            });
            const context = createMockFileContext();
            const sig = impl.getSignature(context);
            expect(sig.parameters).toHaveLength(2);
            expect(sig.parameters[0]?.name).toBe("fileId");
            expect(getTextOfTsNode(sig.returnTypeWithoutPromise)).toBe("ReadableStream");
        });

        it("returns binary-response return type", () => {
            const impl = createImpl({
                fileResponseType: "binary-response",
                response: createMockResponse({
                    returnType: ts.factory.createTypeReferenceNode("core.BinaryResponse")
                })
            });
            const context = createMockFileContext();
            const sig = impl.getSignature(context);
            expect(getTextOfTsNode(sig.returnTypeWithoutPromise)).toBe("core.BinaryResponse");
        });
    });

    describe("getDocs", () => {
        it("returns undefined when no docs, availability, or exceptions", () => {
            const impl = createImpl();
            const context = createMockFileContext();
            const docs = impl.getDocs(context);
            expect(docs).toBeUndefined();
        });

        it("returns endpoint docs when present", () => {
            const endpoint = createHttpEndpoint({ docs: "Download a file by its ID." });
            const impl = createImpl({ endpoint });
            const context = createMockFileContext();
            const docs = impl.getDocs(context);
            expect(docs).toBe("Download a file by its ID.");
        });

        it("includes @throws annotations for thrown exceptions", () => {
            const impl = createImpl({
                response: createMockResponse({
                    thrownExceptions: ["NotFoundError", "ForbiddenError"]
                })
            });
            const context = createMockFileContext();
            const docs = impl.getDocs(context);
            expect(docs).toContain("@throws {@link NotFoundError}");
            expect(docs).toContain("@throws {@link ForbiddenError}");
        });

        it("includes availability docs when deprecated", () => {
            const endpoint = createHttpEndpoint();
            endpoint.availability = {
                status: "DEPRECATED",
                message: "Use downloadV2"
            };
            const impl = createImpl({ endpoint });
            const context = createMockFileContext();
            const docs = impl.getDocs(context);
            expect(docs).toContain("@deprecated");
        });

        it("combines docs, availability, and exceptions", () => {
            const endpoint = createHttpEndpoint({ docs: "Download a file." });
            endpoint.availability = {
                status: "DEPRECATED",
                message: undefined
            };
            const impl = createImpl({
                endpoint,
                response: createMockResponse({ thrownExceptions: ["NotFoundError"] })
            });
            const context = createMockFileContext();
            const docs = impl.getDocs(context);
            expect(docs).toMatchSnapshot();
        });
    });

    describe("getStatements", () => {
        it("generates file download endpoint body with stream response type", () => {
            const impl = createImpl({ fileResponseType: "stream" });
            const context = createMockFileContext();
            const stmts = impl.getStatements(context);
            const output = serializeStatements(stmts);
            expect(output).toMatchSnapshot();
        });

        it("generates file download endpoint body with binary-response type", () => {
            const impl = createImpl({ fileResponseType: "binary-response" });
            const context = createMockFileContext();
            const stmts = impl.getStatements(context);
            const output = serializeStatements(stmts);
            expect(output).toMatchSnapshot();
        });

        it("generates endpoint body with endpoint metadata", () => {
            const impl = createImpl({ generateEndpointMetadata: true });
            const context = createMockFileContext();
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
                            "_headers",
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
            const context = createMockFileContext();
            const stmts = impl.getStatements(context);
            const output = serializeStatements(stmts);
            expect(output).toContain("_headers");
        });
    });

    describe("invokeFetcher", () => {
        it("generates fetcher invocation with streaming response type", () => {
            const impl = createImpl({ fileResponseType: "stream" });
            const context = createMockFileContext();
            const stmts = impl.invokeFetcher(context);
            const output = serializeStatements(stmts);
            expect(output).toMatchSnapshot();
        });

        it("generates fetcher invocation with binary-response type", () => {
            const impl = createImpl({ fileResponseType: "binary-response" });
            const context = createMockFileContext();
            const stmts = impl.invokeFetcher(context);
            const output = serializeStatements(stmts);
            expect(output).toMatchSnapshot();
        });

        it("includes withCredentials when enabled", () => {
            const impl = createImpl({ includeCredentialsOnCrossOriginRequests: true });
            const context = createMockFileContext();
            const stmts = impl.invokeFetcher(context);
            const output = serializeStatements(stmts);
            expect(output).toMatchSnapshot();
        });

        it("uses web stream type when streamType is web and fileResponseType is stream", () => {
            const impl = createImpl({ streamType: "web", fileResponseType: "stream" });
            const context = createMockFileContext();
            const stmts = impl.invokeFetcher(context);
            const output = serializeStatements(stmts);
            expect(output).toMatchSnapshot();
        });
    });

    describe("getExample", () => {
        it("returns endpoint invocation example", () => {
            const impl = createImpl();
            const context = createMockFileContext();
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
            const context = createMockFileContext();
            const example = impl.getExample({
                context,
                example: createMinimalExampleEndpointCall(),
                opts: {},
                clientReference: ts.factory.createIdentifier("client")
            });
            expect(example).toBeUndefined();
        });
    });

    describe("endpoint and response properties", () => {
        it("exposes endpoint from constructor", () => {
            const endpoint = createHttpEndpoint({ docs: "download endpoint" });
            const impl = createImpl({ endpoint });
            expect(impl.endpoint).toBe(endpoint);
        });

        it("exposes response from constructor", () => {
            const response = createMockResponse();
            const impl = createImpl({ response });
            expect(impl.response).toBe(response);
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
        url: "/download",
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
