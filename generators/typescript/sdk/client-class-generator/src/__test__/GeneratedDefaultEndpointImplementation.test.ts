import { FernIr } from "@fern-fern/ir-sdk";
import { getTextOfTsNode } from "@fern-typescript/commons";
import {
    caseConverter,
    createHttpEndpoint,
    createNameAndWireValue,
    serializeStatements
} from "@fern-typescript/test-utils";
import { ts } from "ts-morph";
import { assert, describe, expect, it } from "vitest";
import type { GeneratedEndpointRequest } from "../endpoint-request/GeneratedEndpointRequest.js";
import type { GeneratedEndpointResponse } from "../endpoints/default/endpoint-response/GeneratedEndpointResponse.js";
import { GeneratedDefaultEndpointImplementation } from "../endpoints/default/GeneratedDefaultEndpointImplementation.js";

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Creates a mock GeneratedEndpointRequest with configurable return values.
 */
function createMockRequest(opts?: {
    endpointParameters?: { name: string; type: string; docs?: string }[];
    buildStatements?: ts.Statement[];
    fetcherArgs?: Record<string, ts.Expression>;
    requestParameter?: ts.TypeNode;
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
        getRequestParameter: () => opts?.requestParameter,
        getReferenceToRequestBody: () => undefined,
        getReferenceToPathParameter: (key: string) => ts.factory.createIdentifier(key),
        getReferenceToQueryParameter: (key: string) => ts.factory.createIdentifier(key),
        getExampleEndpointParameters: () => opts?.exampleParameters ?? [ts.factory.createStringLiteral("example-arg")],
        getExampleEndpointImports: () => opts?.exampleImports ?? []
        // biome-ignore lint/suspicious/noExplicitAny: test mock for GeneratedEndpointRequest
    } as any;
}

/**
 * Creates a mock GeneratedEndpointResponse with configurable return values.
 */
function createMockResponse(opts?: {
    returnType?: ts.TypeNode;
    responseVariableName?: string;
    returnStatements?: ts.Statement[];
    thrownExceptions?: string[];
    paginationInfo?: GeneratedEndpointResponse["getPaginationInfo"] extends (ctx: infer _C) => infer R ? R : never;
}): GeneratedEndpointResponse {
    return {
        getReturnType: () => opts?.returnType ?? ts.factory.createTypeReferenceNode("void"),
        getResponseVariableName: () => opts?.responseVariableName ?? "_response",
        getReturnResponseStatements: () =>
            opts?.returnStatements ?? [
                ts.factory.createReturnStatement(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier("_response"),
                        ts.factory.createIdentifier("body")
                    )
                )
            ],
        getNamesOfThrownExceptions: () => opts?.thrownExceptions ?? [],
        getPaginationInfo: () => opts?.paginationInfo ?? undefined
    };
}

/**
 * Creates a mock GeneratedSdkClientClassImpl that satisfies what endpoint implementations access.
 */
// biome-ignore lint/suspicious/noExplicitAny: test mock needs to satisfy complex interface
function createMockClientClass(opts?: { hasRequestOptions?: boolean }): any {
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
        getRequestOptionsType: (idempotent: boolean) => (idempotent ? "IdempotentRequestOptions" : "RequestOptions"),
        accessFromRootClient: ({ referenceToRootClient }: { referenceToRootClient: ts.Identifier }) =>
            ts.factory.createPropertyAccessExpression(referenceToRootClient, ts.factory.createIdentifier("service")),
        hasAuthProvider: () => false,
        getGenerateEndpointMetadata: () => false,
        getReferenceToAuthProviderOrThrow: () => ts.factory.createIdentifier("this._authProvider"),
        getEnvironment: () => undefined
    };
}

/**
 * Creates a mock FileContext for endpoint implementation tests.
 */
// biome-ignore lint/suspicious/noExplicitAny: test mock needs to satisfy complex FileContext interface
function createMockFileContext(): any {
    return {
        config: {
            generatePaginatedClients: false
        },
        sdkInstanceReferenceForSnippet: ts.factory.createIdentifier("client"),
        coreUtilities: {
            fetcher: {
                EndpointMetadata: {
                    _getReferenceToType: () => ts.factory.createTypeReferenceNode("core.EndpointMetadata")
                },
                fetcher: {
                    _invoke: (
                        // biome-ignore lint/suspicious/noExplicitAny: test mock
                        args: any,
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
                        ),
                    _getReferenceTo: () => ts.factory.createIdentifier("core.fetcher")
                },
                Fetcher: {
                    Args: {
                        _getReferenceToType: () => ts.factory.createTypeReferenceNode("core.Fetcher.Args")
                    }
                },
                HttpResponsePromise: {
                    interceptFunction: (fn: ts.Expression) =>
                        ts.factory.createCallExpression(
                            ts.factory.createIdentifier("core.HttpResponsePromise.interceptFunction"),
                            undefined,
                            [fn]
                        )
                },
                RawResponse: {
                    WithRawResponse: {
                        _getReferenceToType: (typeArg: ts.TypeNode) =>
                            ts.factory.createTypeReferenceNode("core.RawResponse.WithRawResponse", [typeArg])
                    }
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
            pagination: {
                Page: {
                    _getReferenceToType: (itemType: ts.TypeNode, responseType: ts.TypeNode) =>
                        ts.factory.createTypeReferenceNode("core.Page", [itemType, responseType]),
                    _construct: (args: Record<string, ts.Expression | ts.TypeNode>) =>
                        ts.factory.createNewExpression(ts.factory.createIdentifier("core.Page"), undefined, [
                            ts.factory.createObjectLiteralExpression([], true)
                        ])
                }
            },
            customPagination: {
                CustomPager: {
                    _getReferenceToType: (itemType: ts.TypeNode, responseType: ts.TypeNode) =>
                        ts.factory.createTypeReferenceNode("core.CustomPager", [itemType, responseType]),
                    _create: (args: Record<string, ts.Expression | ts.TypeNode>) =>
                        ts.factory.createCallExpression(
                            ts.factory.createIdentifier("core.CustomPager.create"),
                            undefined,
                            [ts.factory.createObjectLiteralExpression([], true)]
                        )
                }
            }
        },
        case: caseConverter
    };
}

/**
 * Creates a GeneratedDefaultEndpointImplementation with configurable options.
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
    generateEndpointMetadata?: boolean;
    parameterNaming?: "originalName" | "wireValue" | "camelCase" | "snakeCase" | "default";
    // biome-ignore lint/suspicious/noExplicitAny: test mock
    generatedSdkClientClass?: any;
}): GeneratedDefaultEndpointImplementation {
    return new GeneratedDefaultEndpointImplementation({
        endpoint: opts?.endpoint ?? createHttpEndpoint(),
        request: opts?.request ?? createMockRequest(),
        response: opts?.response ?? createMockResponse(),
        generatedSdkClientClass: opts?.generatedSdkClientClass ?? createMockClientClass(),
        includeCredentialsOnCrossOriginRequests: opts?.includeCredentialsOnCrossOriginRequests ?? false,
        defaultTimeoutInSeconds: opts?.defaultTimeoutInSeconds,
        includeSerdeLayer: opts?.includeSerdeLayer ?? true,
        retainOriginalCasing: opts?.retainOriginalCasing ?? false,
        omitUndefined: opts?.omitUndefined ?? false,
        generateEndpointMetadata: opts?.generateEndpointMetadata ?? false,
        parameterNaming: opts?.parameterNaming ?? "default"
    });
}

// ========================== Tests ==========================

describe("GeneratedDefaultEndpointImplementation", () => {
    describe("isPaginated", () => {
        it("returns false when no pagination info", () => {
            const impl = createImpl();
            const context = createMockFileContext();
            expect(impl.isPaginated(context)).toBe(false);
        });

        it("returns true when pagination info is present", () => {
            const impl = createImpl({
                response: createMockResponse({
                    paginationInfo: {
                        type: "cursor",
                        responseType: ts.factory.createTypeReferenceNode("ListResponse"),
                        itemType: ts.factory.createTypeReferenceNode("Item"),
                        getItems: ts.factory.createIdentifier("response.items"),
                        hasNextPage: ts.factory.createIdentifier("response.hasNext"),
                        loadPage: []
                    }
                })
            });
            const context = createMockFileContext();
            expect(impl.isPaginated(context)).toBe(true);
        });
    });

    describe("getOverloads", () => {
        it("always returns empty array", () => {
            const impl = createImpl();
            expect(impl.getOverloads()).toEqual([]);
        });
    });

    describe("getSignature", () => {
        it("returns parameters and return type for basic endpoint", () => {
            const impl = createImpl({
                request: createMockRequest({
                    endpointParameters: [{ name: "userId", type: "string" }]
                }),
                response: createMockResponse({
                    returnType: ts.factory.createTypeReferenceNode("User")
                })
            });
            const context = createMockFileContext();
            const sig = impl.getSignature(context);
            // endpoint param + requestOptions param
            expect(sig.parameters).toHaveLength(2);
            expect(sig.parameters[0]?.name).toBe("userId");
            expect(getTextOfTsNode(sig.returnTypeWithoutPromise)).toBe("User");
        });

        it("returns paginated return type when cursor pagination present", () => {
            const impl = createImpl({
                response: createMockResponse({
                    returnType: ts.factory.createTypeReferenceNode("ListResponse"),
                    paginationInfo: {
                        type: "cursor",
                        responseType: ts.factory.createTypeReferenceNode("ListResponse"),
                        itemType: ts.factory.createTypeReferenceNode("Item"),
                        getItems: ts.factory.createIdentifier("response.items"),
                        hasNextPage: ts.factory.createIdentifier("response.hasNext"),
                        loadPage: []
                    }
                })
            });
            const context = createMockFileContext();
            const sig = impl.getSignature(context);
            expect(getTextOfTsNode(sig.returnTypeWithoutPromise)).toMatchSnapshot();
        });

        it("returns custom pager return type when custom pagination present", () => {
            const impl = createImpl({
                response: createMockResponse({
                    returnType: ts.factory.createTypeReferenceNode("ListResponse"),
                    paginationInfo: {
                        type: "custom",
                        responseType: ts.factory.createTypeReferenceNode("ListResponse"),
                        itemType: ts.factory.createTypeReferenceNode("Item"),
                        getItems: ts.factory.createIdentifier("response.items"),
                        hasNextPage: ts.factory.createIdentifier("response.hasNext"),
                        loadPage: []
                    }
                })
            });
            const context = createMockFileContext();
            const sig = impl.getSignature(context);
            expect(getTextOfTsNode(sig.returnTypeWithoutPromise)).toMatchSnapshot();
        });
    });

    describe("getDocs", () => {
        it("generates docs with endpoint docs and parameter docs", () => {
            const endpoint = createHttpEndpoint({ docs: "Fetches a user by ID." });
            const impl = createImpl({
                endpoint,
                request: createMockRequest({
                    endpointParameters: [{ name: "userId", type: "string", docs: "The user's unique identifier." }]
                })
            });
            const context = createMockFileContext();
            const docs = impl.getDocs(context);
            expect(docs).toMatchSnapshot();
        });

        it("includes @throws annotations for thrown exceptions", () => {
            const impl = createImpl({
                response: createMockResponse({
                    thrownExceptions: ["NotFoundError", "UnauthorizedError"]
                })
            });
            const context = createMockFileContext();
            const docs = impl.getDocs(context);
            expect(docs).toContain("@throws {@link NotFoundError}");
            expect(docs).toContain("@throws {@link UnauthorizedError}");
        });

        it("generates docs with no endpoint docs (params only)", () => {
            const impl = createImpl({
                request: createMockRequest({
                    endpointParameters: [{ name: "id", type: "number" }]
                })
            });
            const context = createMockFileContext();
            const docs = impl.getDocs(context);
            expect(docs).toMatchSnapshot();
        });

        it("includes availability docs when endpoint has availability", () => {
            const endpoint = createHttpEndpoint();
            endpoint.availability = {
                status: "DEPRECATED",
                message: "Use v2 instead"
            };
            const impl = createImpl({ endpoint });
            const context = createMockFileContext();
            const docs = impl.getDocs(context);
            expect(docs).toContain("@deprecated");
        });

        it("includes requestOptions parameter doc for idempotent endpoint", () => {
            const endpoint = createHttpEndpoint();
            endpoint.idempotent = true;
            const impl = createImpl({ endpoint });
            const context = createMockFileContext();
            const docs = impl.getDocs(context);
            expect(docs).toContain("IdempotentRequestOptions");
        });

        it("generates multiline parameter docs with proper indentation", () => {
            const impl = createImpl({
                request: createMockRequest({
                    endpointParameters: [
                        {
                            name: "options",
                            type: "Options",
                            docs: "Configuration options.\nIncludes timeout and retry settings.\nSee docs for details."
                        }
                    ]
                })
            });
            const context = createMockFileContext();
            const docs = impl.getDocs(context);
            expect(docs).toMatchSnapshot();
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
            const impl = createImpl({
                request: createMockRequest({ exampleParameters: undefined })
            });
            // Override to return null
            // biome-ignore lint/suspicious/noExplicitAny: test mock override
            (impl as any).request.getExampleEndpointParameters = () => undefined;
            const context = createMockFileContext();
            const example = impl.getExample({
                context,
                example: createMinimalExampleEndpointCall(),
                opts: { isForComment: true },
                clientReference: ts.factory.createIdentifier("client")
            });
            expect(example).toBeUndefined();
        });
    });

    describe("getStatements", () => {
        it("generates basic endpoint body (no pagination)", () => {
            const impl = createImpl({
                request: createMockRequest({
                    buildStatements: [
                        ts.factory.createVariableStatement(
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
                        )
                    ]
                })
            });
            const context = createMockFileContext();
            const stmts = impl.getStatements(context);
            const output = serializeStatements(stmts);
            expect(output).toMatchSnapshot();
        });

        it("generates endpoint body with endpoint metadata", () => {
            const impl = createImpl({
                generateEndpointMetadata: true,
                request: createMockRequest()
            });
            const context = createMockFileContext();
            const stmts = impl.getStatements(context);
            const output = serializeStatements(stmts);
            expect(output).toMatchSnapshot();
        });

        it("generates cursor pagination body with requestParameter", () => {
            const impl = createImpl({
                request: createMockRequest({
                    requestParameter: ts.factory.createTypeReferenceNode("ListUsersRequest")
                }),
                response: createMockResponse({
                    paginationInfo: {
                        type: "cursor",
                        responseType: ts.factory.createTypeReferenceNode("ListResponse"),
                        itemType: ts.factory.createTypeReferenceNode("User"),
                        getItems: ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier("response"),
                            ts.factory.createIdentifier("items")
                        ),
                        hasNextPage: ts.factory.createBinaryExpression(
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createIdentifier("response"),
                                ts.factory.createIdentifier("nextCursor")
                            ),
                            ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken),
                            ts.factory.createNull()
                        ),
                        loadPage: [
                            ts.factory.createExpressionStatement(ts.factory.createIdentifier("// load next page"))
                        ]
                    }
                })
            });
            const context = createMockFileContext();
            const stmts = impl.getStatements(context);
            const output = serializeStatements(stmts);
            expect(output).toMatchSnapshot();
        });

        it("generates offset pagination body with initializeOffset", () => {
            const impl = createImpl({
                request: createMockRequest({
                    requestParameter: ts.factory.createTypeReferenceNode("ListUsersRequest")
                }),
                response: createMockResponse({
                    paginationInfo: {
                        type: "offset",
                        initializeOffset: ts.factory.createVariableStatement(
                            undefined,
                            ts.factory.createVariableDeclarationList(
                                [
                                    ts.factory.createVariableDeclaration(
                                        "_offset",
                                        undefined,
                                        undefined,
                                        ts.factory.createNumericLiteral(0)
                                    )
                                ],
                                ts.NodeFlags.Let
                            )
                        ),
                        responseType: ts.factory.createTypeReferenceNode("ListResponse"),
                        itemType: ts.factory.createTypeReferenceNode("User"),
                        getItems: ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier("response"),
                            ts.factory.createIdentifier("items")
                        ),
                        hasNextPage: ts.factory.createBinaryExpression(
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createIdentifier("response"),
                                ts.factory.createIdentifier("items")
                            ),
                            ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken),
                            ts.factory.createNull()
                        ),
                        loadPage: [
                            ts.factory.createExpressionStatement(ts.factory.createIdentifier("// load next page"))
                        ]
                    }
                })
            });
            const context = createMockFileContext();
            const stmts = impl.getStatements(context);
            const output = serializeStatements(stmts);
            expect(output).toMatchSnapshot();
        });

        it("generates custom pagination body with sendRequest and CustomPager", () => {
            const impl = createImpl({
                response: createMockResponse({
                    paginationInfo: {
                        type: "custom",
                        responseType: ts.factory.createTypeReferenceNode("ListResponse"),
                        itemType: ts.factory.createTypeReferenceNode("User"),
                        getItems: ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier("response"),
                            ts.factory.createIdentifier("items")
                        ),
                        hasNextPage: ts.factory.createIdentifier("false"),
                        loadPage: []
                    }
                })
            });
            const context = createMockFileContext();
            const stmts = impl.getStatements(context);
            const output = serializeStatements(stmts);
            expect(output).toMatchSnapshot();
        });

        it("generates offset-step pagination body", () => {
            const impl = createImpl({
                request: createMockRequest({
                    requestParameter: ts.factory.createTypeReferenceNode("ListUsersRequest")
                }),
                response: createMockResponse({
                    paginationInfo: {
                        type: "offset-step",
                        initializeOffset: ts.factory.createVariableStatement(
                            undefined,
                            ts.factory.createVariableDeclarationList(
                                [
                                    ts.factory.createVariableDeclaration(
                                        "_page",
                                        undefined,
                                        undefined,
                                        ts.factory.createNumericLiteral(1)
                                    )
                                ],
                                ts.NodeFlags.Let
                            )
                        ),
                        responseType: ts.factory.createTypeReferenceNode("ListResponse"),
                        itemType: ts.factory.createTypeReferenceNode("User"),
                        getItems: ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier("response"),
                            ts.factory.createIdentifier("items")
                        ),
                        hasNextPage: ts.factory.createIdentifier("true"),
                        loadPage: [
                            ts.factory.createExpressionStatement(ts.factory.createIdentifier("// load next page"))
                        ]
                    }
                })
            });
            const context = createMockFileContext();
            const stmts = impl.getStatements(context);
            const output = serializeStatements(stmts);
            expect(output).toMatchSnapshot();
        });
    });

    describe("invokeFetcherAndReturnResponse", () => {
        it("generates fetcher invocation and response handling", () => {
            const impl = createImpl();
            const context = createMockFileContext();
            const stmts = impl.invokeFetcherAndReturnResponse(context);
            const output = serializeStatements(stmts);
            expect(output).toMatchSnapshot();
        });
    });

    describe("maybeLeverageInvocation", () => {
        it("returns undefined when endpoint has no pagination", () => {
            const impl = createImpl();
            const context = createMockFileContext();
            const result = impl.maybeLeverageInvocation({
                invocation: ts.factory.createIdentifier("result"),
                context
            });
            expect(result).toBeUndefined();
        });

        it("returns undefined when generatePaginatedClients is false", () => {
            const endpoint = createHttpEndpoint();
            endpoint.pagination = createCursorPagination();
            const impl = createImpl({ endpoint });
            const context = createMockFileContext();
            // generatePaginatedClients is false by default
            const result = impl.maybeLeverageInvocation({
                invocation: ts.factory.createIdentifier("result"),
                context
            });
            expect(result).toBeUndefined();
        });

        it("returns pagination leverage code when pagination and generatePaginatedClients are both set", () => {
            const endpoint = createHttpEndpoint();
            endpoint.pagination = createCursorPagination();
            const impl = createImpl({ endpoint });
            const context = createMockFileContext();
            context.config.generatePaginatedClients = true;
            const result = impl.maybeLeverageInvocation({
                invocation: ts.factory.createIdentifier("result"),
                context
            });
            expect(result).toBeDefined();
            const output = (result as ts.Node[]).map((n) => getTextOfTsNode(n)).join("\n");
            expect(output).toMatchSnapshot();
        });
    });

    describe("endpoint property", () => {
        it("exposes the endpoint from constructor", () => {
            const endpoint = createHttpEndpoint({ docs: "test endpoint" });
            const impl = createImpl({ endpoint });
            expect(impl.endpoint).toBe(endpoint);
        });
    });

    describe("response property", () => {
        it("exposes the response from constructor", () => {
            const response = createMockResponse();
            const impl = createImpl({ response });
            expect(impl.response).toBe(response);
        });
    });

    describe("includeCredentialsOnCrossOriginRequests", () => {
        it("adds withCredentials to fetcher args when enabled", () => {
            const impl = createImpl({
                includeCredentialsOnCrossOriginRequests: true
            });
            const context = createMockFileContext();
            const stmts = impl.getStatements(context);
            const output = serializeStatements(stmts);
            expect(output).toMatchSnapshot();
        });
    });

    describe("text response type", () => {
        it("sets responseType to text for text response endpoints", () => {
            const endpoint = createHttpEndpoint();
            endpoint.response = {
                body: FernIr.HttpResponseBody.text({ docs: undefined, v2Examples: undefined }),
                statusCode: undefined,
                isWildcardStatusCode: undefined,
                docs: undefined
            };
            const impl = createImpl({ endpoint });
            const context = createMockFileContext();
            const stmts = impl.getStatements(context);
            const output = serializeStatements(stmts);
            expect(output).toMatchSnapshot();
        });
    });
});

// ──────────────────────────────────────────────────────────────────────────────
// IR factory helpers
// ──────────────────────────────────────────────────────────────────────────────

function createCursorPagination(): FernIr.Pagination {
    return FernIr.Pagination.cursor({
        page: {
            propertyPath: undefined,
            property: FernIr.RequestPropertyValue.body({
                name: createNameAndWireValue("cursor"),
                valueType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                docs: undefined,
                availability: undefined,
                propertyAccess: undefined,
                v2Examples: undefined
            })
        },
        next: {
            propertyPath: undefined,
            property: {
                name: createNameAndWireValue("nextCursor"),
                valueType: FernIr.TypeReference.container(
                    FernIr.ContainerType.optional(FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }))
                ),
                docs: undefined,
                availability: undefined,
                propertyAccess: undefined,
                v2Examples: undefined
            }
        },
        results: {
            propertyPath: undefined,
            property: {
                name: createNameAndWireValue("items"),
                valueType: FernIr.TypeReference.container(
                    FernIr.ContainerType.list(FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }))
                ),
                docs: undefined,
                availability: undefined,
                propertyAccess: undefined,
                v2Examples: undefined
            }
        }
    });
}

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
