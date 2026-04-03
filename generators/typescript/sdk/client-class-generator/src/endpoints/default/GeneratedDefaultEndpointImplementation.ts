import { getOriginalName } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { deduplicateExamples, Fetcher, GetReferenceOpts, getExampleEndpointCalls } from "@fern-typescript/commons";
import { EndpointSampleCode, FileContext, GeneratedEndpointImplementation } from "@fern-typescript/contexts";
import { ts } from "ts-morph";
import { GeneratedEndpointRequest } from "../../endpoint-request/GeneratedEndpointRequest.js";
import { GeneratedSdkClientClassImpl } from "../../GeneratedSdkClientClassImpl.js";
import { buildUrl } from "../utils/buildUrl.js";
import { generateEndpointMetadata } from "../utils/generateEndpointMetadata.js";
import { getAvailabilityDocs } from "../utils/getAvailabilityDocs.js";
import {
    getAbortSignalExpression,
    getMaxRetriesExpression,
    getRequestOptionsParameter,
    getTimeoutExpression,
    REQUEST_OPTIONS_PARAMETER_NAME
} from "../utils/requestOptionsParameter.js";
import { GeneratedEndpointResponse } from "./endpoint-response/GeneratedEndpointResponse.js";

export declare namespace GeneratedDefaultEndpointImplementation {
    export interface Init {
        endpoint: FernIr.HttpEndpoint;
        generatedSdkClientClass: GeneratedSdkClientClassImpl;
        includeCredentialsOnCrossOriginRequests: boolean;
        defaultTimeoutInSeconds: number | "infinity" | undefined;
        request: GeneratedEndpointRequest;
        response: GeneratedEndpointResponse;
        includeSerdeLayer: boolean;
        retainOriginalCasing: boolean;
        omitUndefined: boolean;
        generateEndpointMetadata: boolean;
        parameterNaming: "originalName" | "wireValue" | "camelCase" | "snakeCase" | "default";
    }
}

const EXAMPLE_PREFIX = "    ";

export class GeneratedDefaultEndpointImplementation implements GeneratedEndpointImplementation {
    public readonly endpoint: FernIr.HttpEndpoint;
    public readonly response: GeneratedEndpointResponse;
    private readonly generatedSdkClientClass: GeneratedSdkClientClassImpl;
    private readonly includeCredentialsOnCrossOriginRequests: boolean;
    private readonly defaultTimeoutInSeconds: number | "infinity" | undefined;
    private readonly request: GeneratedEndpointRequest;
    private readonly includeSerdeLayer: boolean;
    private readonly retainOriginalCasing: boolean;
    private readonly omitUndefined: boolean;
    private readonly generateEndpointMetadata: boolean;
    private readonly parameterNaming: "originalName" | "wireValue" | "camelCase" | "snakeCase" | "default";

    constructor({
        endpoint,
        response,
        generatedSdkClientClass,
        includeCredentialsOnCrossOriginRequests,
        defaultTimeoutInSeconds,
        request,
        includeSerdeLayer,
        retainOriginalCasing,
        omitUndefined,
        generateEndpointMetadata,
        parameterNaming
    }: GeneratedDefaultEndpointImplementation.Init) {
        this.endpoint = endpoint;
        this.generatedSdkClientClass = generatedSdkClientClass;
        this.includeCredentialsOnCrossOriginRequests = includeCredentialsOnCrossOriginRequests;
        this.defaultTimeoutInSeconds = defaultTimeoutInSeconds;
        this.request = request;
        this.response = response;
        this.includeSerdeLayer = includeSerdeLayer;
        this.retainOriginalCasing = retainOriginalCasing;
        this.omitUndefined = omitUndefined;
        this.generateEndpointMetadata = generateEndpointMetadata;
        this.parameterNaming = parameterNaming;
    }

    public isPaginated(context: FileContext): boolean {
        return this.response.getPaginationInfo(context) != null;
    }

    public getOverloads(): GeneratedEndpointImplementation.EndpointSignature[] {
        return [];
    }

    public getSignature(context: FileContext): GeneratedEndpointImplementation.EndpointSignature {
        const paginationInfo = this.response.getPaginationInfo(context);
        let mainReturnType: ts.TypeNode;
        const parameters = [...this.request.getEndpointParameters(context)];

        if (paginationInfo != null) {
            if (paginationInfo.type === "custom") {
                mainReturnType = context.coreUtilities.customPagination.CustomPager._getReferenceToType(
                    paginationInfo.itemType,
                    paginationInfo.responseType
                );
            } else {
                mainReturnType = context.coreUtilities.pagination.Page._getReferenceToType(
                    paginationInfo.itemType,
                    paginationInfo.responseType
                );
            }
        } else {
            mainReturnType = this.response.getReturnType(context);
        }

        parameters.push(
            getRequestOptionsParameter({
                requestOptionsReference: this.generatedSdkClientClass.getReferenceToRequestOptions(this.endpoint)
            })
        );

        return {
            parameters,
            returnTypeWithoutPromise: mainReturnType
        };
    }

    public getDocs(context: FileContext): string | undefined {
        const groups: string[] = [];
        const availabilityDoc = getAvailabilityDocs(this.endpoint);
        if (availabilityDoc != null) {
            groups.push(availabilityDoc);
        }
        if (this.endpoint.docs) {
            groups.push(this.endpoint.docs);
        }

        const params: string[] = [];
        for (const parameter of this.request.getEndpointParameters(context)) {
            if (!parameter.docs) {
                params.push(`@param {${parameter.type}} ${parameter.name}`);
                continue;
            }
            const docsStrPrefix = `@param {${parameter.type}} ${parameter.name} - `;
            const docsStrings = parameter.docs.split("\n").map((line: string, index: number) => {
                if (index === 0) {
                    return `${docsStrPrefix}${line}`;
                } else {
                    return `${" ".repeat(docsStrPrefix.length)}${line}`;
                }
            });
            params.push(...docsStrings);
        }

        // Every method supports request options, so we always include this parameter last.
        const requestOptionsType = this.generatedSdkClientClass.getRequestOptionsType(this.endpoint.idempotent);
        params.push(
            `@param {${requestOptionsType}} ${REQUEST_OPTIONS_PARAMETER_NAME} - Request-specific configuration.`
        );
        groups.push(params.join("\n"));

        const exceptions: string[] = [];
        for (const errorName of this.response.getNamesOfThrownExceptions(context)) {
            exceptions.push(`@throws {@link ${errorName}}`);
        }
        if (exceptions.length > 0) {
            groups.push(exceptions.join("\n"));
        }

        const allExamples: string[] = [];
        for (const example of getExampleEndpointCalls(this.endpoint)) {
            const generatedExample = this.getExample({
                context,
                example,
                opts: { isForComment: true },
                clientReference: context.sdkInstanceReferenceForSnippet
            });
            if (generatedExample == null) {
                continue;
            }
            let exampleStr = "@example\n" + EndpointSampleCode.convertToString(generatedExample);
            exampleStr = exampleStr.replaceAll("\n", `\n${EXAMPLE_PREFIX}`);
            allExamples.push(exampleStr);
        }
        const uniqueExamples = deduplicateExamples(allExamples);
        if (uniqueExamples.length > 0) {
            // Each example is its own group.
            groups.push(...uniqueExamples);
        }

        return groups.join("\n\n");
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
    }): ts.Node[] | undefined {
        if (this.endpoint.pagination == null || !context.config.generatePaginatedClients) {
            return undefined;
        }

        const pageableResponseVariableName = "pageableResponse";
        const pageVariableName = "page";
        const itemVariableName = "item";
        const responseVariableName = "response";
        return [
            ts.factory.createVariableStatement(
                undefined,
                ts.factory.createVariableDeclarationList(
                    [
                        ts.factory.createVariableDeclaration(
                            ts.factory.createIdentifier(pageableResponseVariableName),
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
                ts.factory.createIdentifier(pageableResponseVariableName),
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
            ),
            // Not ideal, but not seeing another way to write a comment.
            ts.factory.createIdentifier("// Or you can manually iterate page-by-page"),
            ts.factory.createVariableStatement(
                undefined,
                ts.factory.createVariableDeclarationList(
                    [
                        ts.factory.createVariableDeclaration(
                            ts.factory.createIdentifier(pageVariableName),
                            undefined,
                            undefined,
                            invocation
                        )
                    ],
                    ts.NodeFlags.Let
                )
            ),
            ts.factory.createWhileStatement(
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier(pageVariableName),
                        ts.factory.createIdentifier("hasNextPage")
                    ),
                    undefined,
                    []
                ),
                ts.factory.createBlock(
                    [
                        ts.factory.createExpressionStatement(
                            ts.factory.createBinaryExpression(
                                ts.factory.createIdentifier(pageVariableName),
                                ts.factory.createToken(ts.SyntaxKind.EqualsToken),
                                ts.factory.createCallExpression(
                                    ts.factory.createPropertyAccessExpression(
                                        ts.factory.createIdentifier(pageVariableName),
                                        ts.factory.createIdentifier("getNextPage")
                                    ),
                                    undefined,
                                    []
                                )
                            )
                        )
                    ],
                    true
                )
            ),
            ts.factory.createIdentifier("// You can also access the underlying response"),
            ts.factory.createVariableStatement(
                undefined,
                ts.factory.createVariableDeclarationList(
                    [
                        ts.factory.createVariableDeclaration(
                            ts.factory.createIdentifier(responseVariableName),
                            undefined,
                            undefined,
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createIdentifier(pageVariableName),
                                ts.factory.createIdentifier("response")
                            )
                        )
                    ],
                    ts.NodeFlags.Const
                )
            )
        ];
    }

    public getStatements(context: FileContext): ts.Statement[] {
        const paginationInfo = this.response.getPaginationInfo(context);
        const responseReturnType = this.response.getReturnType(context);

        if (paginationInfo != null && paginationInfo.type === "custom") {
            // For custom pagination, follow the C# pattern:
            // 1. Build Fetcher.Args (prepared HTTP request)
            // 2. Create sendRequest function that takes Fetcher.Args and sends it
            // 3. Call CustomPager.create with sendRequest, initialHttpRequest, and parser

            const statements: ts.Statement[] = [];

            // Add endpoint metadata if needed
            if (this.generateEndpointMetadata) {
                statements.push(
                    ...generateEndpointMetadata({
                        httpEndpoint: this.endpoint,
                        context
                    })
                );
            }

            // Add request building statements
            statements.push(...this.request.getBuildRequestStatements(context));

            // Build the Fetcher.Args object (the prepared HTTP request)
            const fetcherArgs = this.buildFetcherArgs(context);
            statements.push(
                ts.factory.createVariableStatement(
                    undefined,
                    ts.factory.createVariableDeclarationList(
                        [
                            ts.factory.createVariableDeclaration(
                                ts.factory.createIdentifier("_request"),
                                undefined,
                                undefined,
                                fetcherArgs
                            )
                        ],
                        ts.NodeFlags.Const
                    )
                )
            );

            // Create the sendRequest function that takes Fetcher.Args and returns APIResponse
            // This wraps the fetcher with error handling to throw errors on non-ok responses
            const sendRequestFn = ts.factory.createArrowFunction(
                [ts.factory.createToken(ts.SyntaxKind.AsyncKeyword)],
                undefined,
                [
                    ts.factory.createParameterDeclaration(
                        undefined,
                        undefined,
                        ts.factory.createIdentifier("request"),
                        undefined,
                        context.coreUtilities.fetcher.Fetcher.Args._getReferenceToType(),
                        undefined
                    )
                ],
                undefined,
                ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                ts.factory.createBlock(
                    [
                        // Call the fetcher with generic type argument
                        ts.factory.createVariableStatement(
                            undefined,
                            ts.factory.createVariableDeclarationList(
                                [
                                    ts.factory.createVariableDeclaration(
                                        this.response.getResponseVariableName(),
                                        undefined,
                                        undefined,
                                        ts.factory.createAwaitExpression(
                                            ts.factory.createCallExpression(
                                                context.coreUtilities.fetcher.fetcher._getReferenceTo(),
                                                [responseReturnType], // Generic type argument
                                                [ts.factory.createIdentifier("request")]
                                            )
                                        )
                                    )
                                ],
                                ts.NodeFlags.Const
                            )
                        ),
                        // If ok, return the APIResponse; otherwise throw errors
                        ts.factory.createIfStatement(
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createIdentifier(this.response.getResponseVariableName()),
                                ts.factory.createIdentifier("ok")
                            ),
                            ts.factory.createBlock(
                                [
                                    ts.factory.createReturnStatement(
                                        ts.factory.createIdentifier(this.response.getResponseVariableName())
                                    )
                                ],
                                true
                            )
                        ),
                        // Include error handling for non-ok responses
                        ...this.response.getReturnResponseStatements(context).slice(1) // Skip the first statement which is the "if (response.ok)" check
                    ],
                    true
                )
            );

            statements.push(
                ts.factory.createVariableStatement(
                    undefined,
                    ts.factory.createVariableDeclarationList(
                        [
                            ts.factory.createVariableDeclaration(
                                ts.factory.createIdentifier("_sendRequest"),
                                undefined,
                                undefined,
                                sendRequestFn
                            )
                        ],
                        ts.NodeFlags.Const
                    )
                )
            );

            // Create a default parser that extracts items but sets hasNextPage to false
            const getItemsLambda = this.createLambdaWithResponse({ body: paginationInfo.getItems });
            const itemsExpr = ts.factory.createCallExpression(getItemsLambda, undefined, [
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier("response"),
                    ts.factory.createIdentifier("data")
                )
            ]);

            statements.push(
                ts.factory.createReturnStatement(
                    context.coreUtilities.customPagination.CustomPager._create({
                        itemType: paginationInfo.itemType,
                        responseType: paginationInfo.responseType,
                        sendRequest: ts.factory.createIdentifier("_sendRequest"),
                        initialHttpRequest: ts.factory.createIdentifier("_request"),
                        clientOptions: this.generatedSdkClientClass.getReferenceToOptions(),
                        requestOptions: ts.factory.createIdentifier(REQUEST_OPTIONS_PARAMETER_NAME)
                    })
                )
            );

            return statements;
        }

        // URI/path pagination
        if (paginationInfo != null && (paginationInfo.type === "uri" || paginationInfo.type === "path")) {
            const urlParamIdentifier = ts.factory.createIdentifier("_requestUrl");
            // For URI/path pagination, subsequent page requests should only send headers
            // (auth, custom headers), not query params or body. The next URL already contains
            // all necessary parameters. This matches the Python and Java SDK behavior.
            const uriBody = [
                ...(this.generateEndpointMetadata
                    ? generateEndpointMetadata({
                          httpEndpoint: this.endpoint,
                          context
                      })
                    : []),
                ...this.request.getBuildHeaderStatements(context),
                ...this.invokeFetcherAndReturnResponse(context, urlParamIdentifier, {
                    headersOnly: true
                })
            ];

            const listFn = ts.factory.createVariableDeclarationList(
                [
                    ts.factory.createVariableDeclaration(
                        ts.factory.createIdentifier("list"),
                        undefined,
                        undefined,
                        context.coreUtilities.fetcher.HttpResponsePromise.interceptFunction(
                            ts.factory.createArrowFunction(
                                [ts.factory.createToken(ts.SyntaxKind.AsyncKeyword)],
                                undefined,
                                [
                                    ts.factory.createParameterDeclaration(
                                        undefined,
                                        undefined,
                                        urlParamIdentifier,
                                        undefined,
                                        ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                                        undefined
                                    )
                                ],
                                ts.factory.createTypeReferenceNode("Promise", [
                                    context.coreUtilities.fetcher.RawResponse.WithRawResponse._getReferenceToType(
                                        responseReturnType
                                    )
                                ]),
                                ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                                ts.factory.createBlock(uriBody, undefined)
                            )
                        )
                    )
                ],
                ts.NodeFlags.Const
            );

            const statements: ts.Statement[] = [ts.factory.createVariableStatement(undefined, listFn)];

            // For path pagination, store the base URL for combining with the path later
            if (paginationInfo.type === "path") {
                statements.push(
                    ts.factory.createVariableStatement(
                        undefined,
                        ts.factory.createVariableDeclarationList(
                            [
                                ts.factory.createVariableDeclaration(
                                    ts.factory.createIdentifier("_baseUrl"),
                                    undefined,
                                    undefined,
                                    this.generatedSdkClientClass.getBaseUrl(this.endpoint, context)
                                )
                            ],
                            ts.NodeFlags.Const
                        )
                    )
                );
            }

            // Initial call: list(endpointUrl)
            // For path pagination, reuse the already-emitted _baseUrl identifier instead of
            // re-evaluating getBaseUrl() (which would produce a duplicate Supplier.get call).
            const initialUrl =
                paginationInfo.type === "path"
                    ? (() => {
                          const endpointPath = buildUrl({
                              endpoint: this.endpoint,
                              generatedClientClass: this.generatedSdkClientClass,
                              context,
                              includeSerdeLayer: this.includeSerdeLayer,
                              retainOriginalCasing: this.retainOriginalCasing,
                              omitUndefined: this.omitUndefined,
                              getReferenceToPathParameterVariableFromRequest: (pathParameter) => {
                                  return this.request.getReferenceToPathParameter(
                                      getOriginalName(pathParameter.name),
                                      context
                                  );
                              },
                              parameterNaming: this.parameterNaming
                          });
                          const baseUrlIdentifier = ts.factory.createIdentifier("_baseUrl");
                          return endpointPath != null
                              ? context.coreUtilities.urlUtils.join._invoke([baseUrlIdentifier, endpointPath])
                              : baseUrlIdentifier;
                      })()
                    : this.getReferenceToBaseUrl(context);
            const initialResponseVar = ts.factory.createIdentifier("dataWithRawResponse");
            statements.push(
                ts.factory.createVariableStatement(
                    undefined,
                    ts.factory.createVariableDeclarationList(
                        [
                            ts.factory.createVariableDeclaration(
                                initialResponseVar,
                                undefined,
                                undefined,
                                ts.factory.createAwaitExpression(
                                    ts.factory.createCallExpression(
                                        ts.factory.createPropertyAccessExpression(
                                            ts.factory.createCallExpression(
                                                ts.factory.createIdentifier("list"),
                                                undefined,
                                                [initialUrl]
                                            ),
                                            ts.factory.createIdentifier("withRawResponse")
                                        ),
                                        undefined,
                                        []
                                    )
                                )
                            )
                        ],
                        ts.NodeFlags.Const
                    )
                )
            );

            statements.push(
                ts.factory.createReturnStatement(
                    context.coreUtilities.pagination.Page._construct({
                        itemType: paginationInfo.itemType,
                        responseType: paginationInfo.responseType,
                        response: ts.factory.createPropertyAccessExpression(initialResponseVar, "data"),
                        rawResponse: ts.factory.createPropertyAccessExpression(initialResponseVar, "rawResponse"),
                        hasNextPage: this.createLambdaWithResponse({ body: paginationInfo.hasNextPage }),
                        getItems: this.createLambdaWithResponse({ body: paginationInfo.getItems }),
                        loadPage: this.createLambdaWithResponse({
                            body: ts.factory.createBlock(paginationInfo.loadPage)
                        })
                    })
                )
            );
            return statements;
        }

        // Non-custom pagination or no pagination
        const listFnName = "list";
        const body = [
            ...(this.generateEndpointMetadata
                ? generateEndpointMetadata({
                      httpEndpoint: this.endpoint,
                      context
                  })
                : []),
            ...this.request.getBuildRequestStatements(context),
            ...this.invokeFetcherAndReturnResponse(context)
        ];

        const requestParameter = this.request.getRequestParameter(context);
        if (paginationInfo != null && requestParameter != null) {
            const listFn = ts.factory.createVariableDeclarationList(
                [
                    ts.factory.createVariableDeclaration(
                        ts.factory.createIdentifier(listFnName),
                        undefined,
                        undefined,
                        context.coreUtilities.fetcher.HttpResponsePromise.interceptFunction(
                            ts.factory.createArrowFunction(
                                [ts.factory.createToken(ts.SyntaxKind.AsyncKeyword)],
                                undefined,
                                [
                                    ts.factory.createParameterDeclaration(
                                        undefined,
                                        undefined,
                                        ts.factory.createIdentifier("request"),
                                        undefined,
                                        requestParameter,
                                        undefined
                                    )
                                ],
                                ts.factory.createTypeReferenceNode("Promise", [
                                    context.coreUtilities.fetcher.RawResponse.WithRawResponse._getReferenceToType(
                                        responseReturnType
                                    )
                                ]),
                                ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                                ts.factory.createBlock(body, undefined)
                            )
                        )
                    )
                ],
                ts.NodeFlags.Const
            );
            const statements: ts.Statement[] = [ts.factory.createVariableStatement(undefined, listFn)];
            if (paginationInfo.type === "offset" || paginationInfo.type === "offset-step") {
                statements.push(paginationInfo.initializeOffset);
            }
            const initialResponseVar = ts.factory.createIdentifier("dataWithRawResponse");
            statements.push(
                ts.factory.createVariableStatement(
                    undefined,
                    ts.factory.createVariableDeclarationList(
                        [
                            ts.factory.createVariableDeclaration(
                                initialResponseVar,
                                undefined,
                                undefined,
                                ts.factory.createAwaitExpression(
                                    ts.factory.createCallExpression(
                                        ts.factory.createPropertyAccessExpression(
                                            ts.factory.createCallExpression(
                                                ts.factory.createIdentifier(listFnName),
                                                undefined,
                                                [ts.factory.createIdentifier("request")]
                                            ),
                                            ts.factory.createIdentifier("withRawResponse")
                                        ),
                                        undefined,
                                        []
                                    )
                                )
                            )
                        ],
                        ts.NodeFlags.Const
                    )
                )
            );
            statements.push(
                ts.factory.createReturnStatement(
                    context.coreUtilities.pagination.Page._construct({
                        itemType: paginationInfo.itemType,
                        responseType: paginationInfo.responseType,
                        response: ts.factory.createPropertyAccessExpression(initialResponseVar, "data"),
                        rawResponse: ts.factory.createPropertyAccessExpression(initialResponseVar, "rawResponse"),
                        hasNextPage: this.createLambdaWithResponse({ body: paginationInfo.hasNextPage }),
                        getItems: this.createLambdaWithResponse({ body: paginationInfo.getItems }),
                        loadPage: this.createLambdaWithResponse({
                            body: ts.factory.createBlock(paginationInfo.loadPage),
                            ignoreResponse: paginationInfo.type === "offset"
                        })
                    })
                )
            );
            return statements;
        }
        return body;
    }

    private buildFetcherArgs(context: FileContext): ts.Expression {
        const requestArgs = this.request.getFetcherRequestArgs(context);
        const fetcherArgs: Record<string, ts.Expression> = {
            url: this.getReferenceToBaseUrl(context),
            method: ts.factory.createStringLiteral(this.endpoint.method)
        };

        // Add request args, filtering out undefined values
        if (requestArgs.headers != null) {
            fetcherArgs.headers = requestArgs.headers;
        }
        if (requestArgs.queryParameters != null) {
            fetcherArgs.queryParameters = requestArgs.queryParameters;
        }
        if (requestArgs.body != null) {
            fetcherArgs.body = requestArgs.body;
        }
        if (requestArgs.contentType != null) {
            fetcherArgs.contentType =
                typeof requestArgs.contentType === "string"
                    ? ts.factory.createStringLiteral(requestArgs.contentType)
                    : requestArgs.contentType;
        }
        if (requestArgs.requestType != null) {
            fetcherArgs.requestType = ts.factory.createStringLiteral(requestArgs.requestType);
        }

        const timeoutExpression = getTimeoutExpression({
            defaultTimeoutInSeconds: this.defaultTimeoutInSeconds,
            timeoutInSecondsReference: this.generatedSdkClientClass.getReferenceToTimeoutInSeconds.bind(
                this.generatedSdkClientClass
            ),
            referenceToOptions: this.generatedSdkClientClass.getReferenceToOptions()
        });
        if (timeoutExpression != null) {
            fetcherArgs.timeoutMs = timeoutExpression;
        }

        const maxRetriesExpression = getMaxRetriesExpression({
            maxRetriesReference: this.generatedSdkClientClass.getReferenceToMaxRetries.bind(
                this.generatedSdkClientClass
            ),
            referenceToOptions: this.generatedSdkClientClass.getReferenceToOptions()
        });
        if (maxRetriesExpression != null) {
            fetcherArgs.maxRetries = maxRetriesExpression;
        }

        const abortSignalExpression = getAbortSignalExpression({
            abortSignalReference: this.generatedSdkClientClass.getReferenceToAbortSignal.bind(
                this.generatedSdkClientClass
            )
        });
        if (abortSignalExpression != null) {
            fetcherArgs.abortSignal = abortSignalExpression;
        }

        const fetchFn = this.generatedSdkClientClass.getReferenceToFetch();
        if (fetchFn != null) {
            fetcherArgs.fetchFn = fetchFn;
        }

        const logging = this.generatedSdkClientClass.getReferenceToLogger(context);
        if (logging != null) {
            fetcherArgs.logging = logging;
        }

        if (this.includeCredentialsOnCrossOriginRequests) {
            fetcherArgs.withCredentials = ts.factory.createTrue();
        }

        if (this.generateEndpointMetadata) {
            const metadata = this.generatedSdkClientClass.getReferenceToMetadataForEndpointSupplier();
            if (metadata != null) {
                fetcherArgs.endpointMetadata = metadata;
            }
        }

        if (this.endpoint.response?.body?.type === "text") {
            fetcherArgs.responseType = ts.factory.createStringLiteral("text");
        }

        return ts.factory.createObjectLiteralExpression(
            Object.entries(fetcherArgs).map(([key, value]) =>
                ts.factory.createPropertyAssignment(ts.factory.createIdentifier(key), value)
            ),
            true
        );
    }

    private createLambdaWithResponse({
        body,
        ignoreResponse
    }: {
        body: ts.ConciseBody;
        ignoreResponse?: boolean;
    }): ts.Expression {
        const responseParameterName = ignoreResponse ? "_response" : "response";
        return ts.factory.createArrowFunction(
            undefined,
            undefined,
            [
                ts.factory.createParameterDeclaration(
                    undefined,
                    undefined,
                    ts.factory.createIdentifier(responseParameterName),
                    undefined,
                    undefined,
                    undefined
                )
            ],
            undefined,
            ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
            body
        );
    }

    public invokeFetcherAndReturnResponse(
        context: FileContext,
        urlOverride?: ts.Expression,
        options?: { headersOnly?: boolean }
    ): ts.Statement[] {
        return [
            ...this.invokeFetcher(context, urlOverride, options),
            ...this.response.getReturnResponseStatements(context)
        ];
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

    private invokeFetcher(
        context: FileContext,
        urlOverride?: ts.Expression,
        options?: { headersOnly?: boolean }
    ): ts.Statement[] {
        const requestArgs = this.request.getFetcherRequestArgs(context);
        const fetcherArgs: Fetcher.Args = {
            ...requestArgs,
            // When headersOnly is true (URI/path pagination), exclude query params and body
            // since the next URL already contains all necessary parameters.
            ...(options?.headersOnly
                ? { queryParameters: undefined, body: undefined, contentType: undefined, requestType: undefined }
                : {}),
            url: urlOverride ?? this.getReferenceToBaseUrl(context),
            method: ts.factory.createStringLiteral(this.endpoint.method),
            timeoutInSeconds: getTimeoutExpression({
                defaultTimeoutInSeconds: this.defaultTimeoutInSeconds,
                timeoutInSecondsReference: this.generatedSdkClientClass.getReferenceToTimeoutInSeconds.bind(
                    this.generatedSdkClientClass
                ),
                referenceToOptions: this.generatedSdkClientClass.getReferenceToOptions()
            }),
            maxRetries: getMaxRetriesExpression({
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
            withCredentials: this.includeCredentialsOnCrossOriginRequests,
            endpointMetadata: this.generateEndpointMetadata
                ? this.generatedSdkClientClass.getReferenceToMetadataForEndpointSupplier()
                : undefined
        };

        if (this.endpoint.response?.body?.type === "text") {
            fetcherArgs.responseType = "text";
        }

        return [
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
                                cast: undefined
                            })
                        )
                    ],
                    ts.NodeFlags.Const
                )
            )
        ];
    }
}
