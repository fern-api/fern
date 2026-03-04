import { FernIr } from "@fern-fern/ir-sdk";
import { deduplicateExamples, Fetcher, GetReferenceOpts, getExampleEndpointCalls } from "@fern-typescript/commons";
import { EndpointSampleCode, GeneratedEndpointImplementation, SdkContext } from "@fern-typescript/contexts";
import { ErrorResolver } from "@fern-typescript/resolvers";
import { ts } from "ts-morph";
import { GeneratedEndpointRequest } from "../../endpoint-request/GeneratedEndpointRequest.js";
import { GeneratedSdkClientClassImpl } from "../../GeneratedSdkClientClassImpl.js";
import { buildFetchOptionsArg } from "../utils/buildFetchOptionsArg.js";
import { buildUrl } from "../utils/buildUrl.js";
import { generateEndpointMetadata } from "../utils/generateEndpointMetadata.js";
import { HEADERS_VAR_NAME } from "../utils/generateHeaders.js";
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
        errorDiscriminationStrategy: FernIr.ErrorDiscriminationStrategy;
        errorResolver: ErrorResolver;
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
    private readonly errorDiscriminationStrategy: FernIr.ErrorDiscriminationStrategy;
    private readonly errorResolver: ErrorResolver;

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
        parameterNaming,
        errorDiscriminationStrategy,
        errorResolver
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
        this.errorDiscriminationStrategy = errorDiscriminationStrategy;
        this.errorResolver = errorResolver;
    }

    public isPaginated(context: SdkContext): boolean {
        return this.response.getPaginationInfo(context) != null;
    }

    public getOverloads(): GeneratedEndpointImplementation.EndpointSignature[] {
        return [];
    }

    public getSignature(context: SdkContext): GeneratedEndpointImplementation.EndpointSignature {
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

    public getDocs(context: SdkContext): string | undefined {
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
        context: SdkContext;
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
                        ts.factory.createIdentifier(this.endpoint.name.camelCase.unsafeName)
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
        context: SdkContext;
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

    public getStatements(context: SdkContext): ts.Statement[] {
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
                                                this.generatedSdkClientClass.getReferenceToFetcher(),
                                                [responseReturnType], // Generic type argument
                                                [
                                                    ts.factory.createIdentifier("request"),
                                                    buildFetchOptionsArg({
                                                        requestOptionsParameterName: REQUEST_OPTIONS_PARAMETER_NAME,
                                                        generateEndpointMetadata: this.generateEndpointMetadata,
                                                        generatedSdkClientClass: this.generatedSdkClientClass
                                                    })
                                                ]
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

    private buildFetcherArgs(context: SdkContext): ts.Expression {
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

        const logging = this.generatedSdkClientClass.getReferenceToLogger();
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

    /**
     * Generates the body statements for a single (non-async) public method
     * that uses this._requestFn<T>({config}). Handles ALL endpoint variations:
     * errorHandler, custom timeouts, multi-URL baseUrl, HEAD responses, file upload,
     * bytes request, serde allowMultiple, and duplex.
     *
     * When async preprocessing is needed (file upload form data, multi-URL base URL
     * resolution, serde allowMultiple), wraps the config in an async builder function.
     */
    public getClientRequestStatements(context: SdkContext): ts.Statement[] {
        // Statements that go outside the async builder (always sync)
        const outerStatements: ts.Statement[] = [];

        // 1. Endpoint metadata (always sync, goes outside)
        if (this.generateEndpointMetadata) {
            outerStatements.push(
                ...generateEndpointMetadata({
                    httpEndpoint: this.endpoint,
                    context
                })
            );
        }

        // 2. Build request statements (destructuring, query params, endpoint-specific headers)
        // These may contain await (file upload, bytes upload, serde allowMultiple), so they may need to
        // go inside an async config builder.
        const buildStatements = this.request.getBuildRequestStatements(context);

        const needsAsync = this.endpoint.baseUrl != null || this.hasAwaitExpression(buildStatements);

        if (!needsAsync) {
            outerStatements.push(...buildStatements);
        }

        // 3. Get fetcher request args for config properties
        const requestArgs = this.request.getFetcherRequestArgs(context);

        // 4. Build the URL path expression
        const pathExpr = this.getPathExpression(context);

        // 5. Build the config object properties
        const configProperties: ts.ObjectLiteralElementLike[] = [];

        // method
        configProperties.push(
            ts.factory.createPropertyAssignment(
                ts.factory.createIdentifier("method"),
                ts.factory.createStringLiteral(this.endpoint.method)
            )
        );

        // path
        configProperties.push(ts.factory.createPropertyAssignment(ts.factory.createIdentifier("path"), pathExpr));

        // body (if present)
        if (requestArgs.body != null) {
            configProperties.push(
                ts.factory.createPropertyAssignment(ts.factory.createIdentifier("body"), requestArgs.body)
            );
        }

        // contentType (if not default)
        if (requestArgs.contentType != null) {
            const contentTypeExpr =
                typeof requestArgs.contentType === "string"
                    ? ts.factory.createStringLiteral(requestArgs.contentType)
                    : requestArgs.contentType;
            configProperties.push(
                ts.factory.createPropertyAssignment(ts.factory.createIdentifier("contentType"), contentTypeExpr)
            );
        }

        // requestType (if present)
        if (requestArgs.requestType != null) {
            configProperties.push(
                ts.factory.createPropertyAssignment(
                    ts.factory.createIdentifier("requestType"),
                    ts.factory.createStringLiteral(requestArgs.requestType)
                )
            );
        }

        // queryParameters (if present)
        if (requestArgs.queryParameters != null) {
            configProperties.push(
                ts.factory.createPropertyAssignment(
                    ts.factory.createIdentifier("queryParameters"),
                    requestArgs.queryParameters
                )
            );
        }

        // duplex (if present — file upload, bytes request)
        if (requestArgs.duplex != null) {
            configProperties.push(
                ts.factory.createPropertyAssignment(ts.factory.createIdentifier("duplex"), requestArgs.duplex)
            );
        }

        // headers (only if endpoint-specific headers were generated)
        const hasEndpointSpecificHeaders = buildStatements.some(
            (stmt) =>
                ts.isVariableStatement(stmt) &&
                stmt.declarationList.declarations.some(
                    (decl) => ts.isIdentifier(decl.name) && decl.name.text === HEADERS_VAR_NAME
                )
        );
        if (hasEndpointSpecificHeaders) {
            configProperties.push(
                ts.factory.createPropertyAssignment(
                    ts.factory.createIdentifier("headers"),
                    ts.factory.createIdentifier(HEADERS_VAR_NAME)
                )
            );
        }

        // responseType (for text responses)
        if (this.endpoint.response?.body?.type === "text") {
            configProperties.push(
                ts.factory.createPropertyAssignment(
                    ts.factory.createIdentifier("responseType"),
                    ts.factory.createStringLiteral("text")
                )
            );
        }

        // withCredentials
        if (this.includeCredentialsOnCrossOriginRequests) {
            configProperties.push(
                ts.factory.createPropertyAssignment(
                    ts.factory.createIdentifier("withCredentials"),
                    ts.factory.createTrue()
                )
            );
        }

        // endpointMetadata
        if (this.generateEndpointMetadata) {
            const metadata = this.generatedSdkClientClass.getReferenceToMetadataForEndpointSupplier();
            configProperties.push(
                ts.factory.createPropertyAssignment(ts.factory.createIdentifier("endpointMetadata"), metadata)
            );
        }

        // errorHandler (for endpoints with status-code-specific errors)
        if (this.endpoint.errors.length > 0) {
            configProperties.push(
                ts.factory.createPropertyAssignment(
                    ts.factory.createIdentifier("errorHandler"),
                    this.buildErrorHandler(context)
                )
            );
        }

        // defaultTimeoutInSeconds (for custom per-endpoint timeouts)
        if (this.defaultTimeoutInSeconds !== undefined) {
            const timeoutExpr =
                this.defaultTimeoutInSeconds === "infinity"
                    ? ts.factory.createStringLiteral("infinity")
                    : ts.factory.createNumericLiteral(this.defaultTimeoutInSeconds);
            configProperties.push(
                ts.factory.createPropertyAssignment(ts.factory.createIdentifier("defaultTimeoutInSeconds"), timeoutExpr)
            );
        }

        // baseUrl (for multi-URL environments)
        if (this.endpoint.baseUrl != null) {
            configProperties.push(
                ts.factory.createPropertyAssignment(
                    ts.factory.createIdentifier("baseUrl"),
                    this.generatedSdkClientClass.getBaseUrl(this.endpoint, context)
                )
            );
        }

        // transformResponse for HEAD method (returns rawResponse.headers as data)
        if (this.endpoint.method === "HEAD" && this.endpoint.response?.body == null) {
            const rawResponseParam = ts.factory.createIdentifier("rawResponse");
            configProperties.push(
                ts.factory.createPropertyAssignment(
                    ts.factory.createIdentifier("transformResponse"),
                    ts.factory.createArrowFunction(
                        undefined,
                        undefined,
                        [
                            ts.factory.createParameterDeclaration(
                                undefined,
                                undefined,
                                ts.factory.createIdentifier("_body")
                            ),
                            ts.factory.createParameterDeclaration(undefined, undefined, rawResponseParam)
                        ],
                        undefined,
                        ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                        ts.factory.createPropertyAccessExpression(rawResponseParam, "headers")
                    )
                )
            );
        }

        // transformResponse (for serde layer deserialization of JSON responses)
        if (this.endpoint.method !== "HEAD" && this.includeSerdeLayer && this.endpoint.response?.body != null) {
            const responseBody = this.endpoint.response.body;
            if (responseBody.type === "json") {
                const bodyParam = ts.factory.createIdentifier("body");
                const deserializeExpr = context.sdkEndpointTypeSchemas
                    .getGeneratedEndpointTypeSchemas(this.generatedSdkClientClass["packageId"], this.endpoint.name)
                    .deserializeResponse(bodyParam, context);

                configProperties.push(
                    ts.factory.createPropertyAssignment(
                        ts.factory.createIdentifier("transformResponse"),
                        ts.factory.createArrowFunction(
                            undefined,
                            undefined,
                            [ts.factory.createParameterDeclaration(undefined, undefined, bodyParam)],
                            undefined,
                            ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                            deserializeExpr
                        )
                    )
                );
            }
        }

        // requestOptions (shorthand property — always last)
        configProperties.push(
            ts.factory.createShorthandPropertyAssignment(ts.factory.createIdentifier(REQUEST_OPTIONS_PARAMETER_NAME))
        );

        // 6. Build the config object
        const configObject = ts.factory.createObjectLiteralExpression(configProperties, true);

        // 7. Build the request call
        const returnType = this.response.getReturnType(context);

        if (needsAsync) {
            // Async config builder: return this._requestFn<T>(async () => { ...stmts; return config })
            const asyncBodyStatements: ts.Statement[] = [
                ...buildStatements,
                ts.factory.createReturnStatement(configObject)
            ];

            const asyncBuilderFn = ts.factory.createArrowFunction(
                [ts.factory.createToken(ts.SyntaxKind.AsyncKeyword)],
                undefined,
                [],
                undefined,
                ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                ts.factory.createBlock(asyncBodyStatements, true)
            );

            const clientRequestCall = ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createThis(),
                    ts.factory.createIdentifier(GeneratedSdkClientClassImpl.REQUEST_FN_PRIVATE_MEMBER)
                ),
                [returnType],
                [asyncBuilderFn]
            );

            outerStatements.push(ts.factory.createReturnStatement(clientRequestCall));
        } else {
            // Sync: return this._requestFn<T>(config)
            const clientRequestCall = ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createThis(),
                    ts.factory.createIdentifier(GeneratedSdkClientClassImpl.REQUEST_FN_PRIVATE_MEMBER)
                ),
                [returnType],
                [configObject]
            );

            outerStatements.push(ts.factory.createReturnStatement(clientRequestCall));
        }

        return outerStatements;
    }

    /**
     * Determines whether the provided statements contain an await expression.
     * Used to decide if we must use the async config builder form of HttpClient.request().
     */
    private hasAwaitExpression(statements: ts.Statement[]): boolean {
        const containsAwait = (node: ts.Node): boolean => {
            if (ts.isAwaitExpression(node)) {
                return true;
            }
            let found = false;
            ts.forEachChild(node, (child) => {
                if (!found && containsAwait(child)) {
                    found = true;
                }
            });
            return found;
        };

        return statements.some((stmt) => containsAwait(stmt));
    }

    /**
     * Builds an errorHandler arrow function for the EndpointConfig.
     * Generates a switch statement matching status codes or discriminant properties
     * to typed error constructors. Returns undefined to fall through to the generic error.
     */
    private buildErrorHandler(context: SdkContext): ts.Expression {
        const statusCodeParam = ts.factory.createIdentifier("statusCode");
        const bodyParam = ts.factory.createIdentifier("body");
        const rawResponseParam = ts.factory.createIdentifier("rawResponse");

        // Generate case clauses based on error discrimination strategy
        const switchStatement = FernIr.ErrorDiscriminationStrategy._visit(this.errorDiscriminationStrategy, {
            statusCode: () => this.buildStatusCodeErrorHandler(context, statusCodeParam, bodyParam, rawResponseParam),
            property: (propertyStrategy) =>
                this.buildPropertyErrorHandler(context, propertyStrategy, bodyParam, rawResponseParam),
            _other: () => {
                throw new Error("Unknown ErrorDiscriminationStrategy: " + this.errorDiscriminationStrategy.type);
            }
        });

        // Return: (statusCode, body, rawResponse) => { switch(...) { ... } return undefined; }
        return ts.factory.createArrowFunction(
            undefined,
            undefined,
            [
                ts.factory.createParameterDeclaration(undefined, undefined, statusCodeParam),
                ts.factory.createParameterDeclaration(undefined, undefined, bodyParam),
                ts.factory.createParameterDeclaration(undefined, undefined, rawResponseParam)
            ],
            undefined,
            ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
            ts.factory.createBlock(
                [switchStatement, ts.factory.createReturnStatement(ts.factory.createIdentifier("undefined"))],
                true
            )
        );
    }

    /**
     * Builds a switch(statusCode) statement for status-code-discriminated errors.
     */
    private buildStatusCodeErrorHandler(
        context: SdkContext,
        statusCodeParam: ts.Identifier,
        bodyParam: ts.Identifier,
        rawResponseParam: ts.Identifier
    ): ts.Statement {
        // Deduplicate errors by status code (first wins, same as GeneratedThrowingEndpointResponse)
        const seenStatusCodes = new Set<number>();
        const deduplicatedErrors = this.endpoint.errors.filter((error) => {
            const errorDeclaration = this.errorResolver.getErrorDeclarationFromName(error.error);
            if (seenStatusCodes.has(errorDeclaration.statusCode)) {
                return false;
            }
            seenStatusCodes.add(errorDeclaration.statusCode);
            return true;
        });

        return ts.factory.createSwitchStatement(
            statusCodeParam,
            ts.factory.createCaseBlock(
                deduplicatedErrors.map((error) => {
                    const errorDeclaration = this.errorResolver.getErrorDeclarationFromName(error.error);
                    return ts.factory.createCaseClause(ts.factory.createNumericLiteral(errorDeclaration.statusCode), [
                        ts.factory.createReturnStatement(
                            this.buildErrorExpression(context, error, bodyParam, rawResponseParam)
                        )
                    ]);
                })
            )
        );
    }

    /**
     * Builds a switch((body as any)?.[discriminant]) statement for property-discriminated errors.
     */
    private buildPropertyErrorHandler(
        context: SdkContext,
        propertyStrategy: FernIr.ErrorDiscriminationByPropertyStrategy,
        bodyParam: ts.Identifier,
        rawResponseParam: ts.Identifier
    ): ts.Statement {
        return ts.factory.createSwitchStatement(
            ts.factory.createElementAccessChain(
                ts.factory.createAsExpression(bodyParam, ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)),
                ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                ts.factory.createStringLiteral(propertyStrategy.discriminant.wireValue)
            ),
            ts.factory.createCaseBlock(
                this.endpoint.errors.map((error) =>
                    ts.factory.createCaseClause(
                        ts.factory.createStringLiteral(
                            context.sdkError.getErrorDeclaration(error.error).discriminantValue.wireValue
                        ),
                        [
                            ts.factory.createReturnStatement(
                                this.buildErrorExpression(context, error, bodyParam, rawResponseParam)
                            )
                        ]
                    )
                )
            )
        );
    }

    /**
     * Builds a `new SomeError(deserializedBody, rawResponse)` expression for a single error.
     */
    private buildErrorExpression(
        context: SdkContext,
        error: FernIr.ResponseError,
        bodyParam: ts.Identifier,
        rawResponseParam: ts.Identifier
    ): ts.Expression {
        const generatedSdkError = context.sdkError.getGeneratedSdkError(error.error);
        if (generatedSdkError?.type !== "class") {
            throw new Error("Cannot build error because it's not a class");
        }
        const generatedSdkErrorSchema = context.sdkErrorSchema.getGeneratedSdkErrorSchema(error.error);
        return generatedSdkError.build(context, {
            referenceToBody:
                generatedSdkErrorSchema != null
                    ? generatedSdkErrorSchema.deserializeBody(context, {
                          referenceToBody: bodyParam
                      })
                    : undefined,
            referenceToRawResponse: rawResponseParam
        });
    }

    public invokeFetcherAndReturnResponse(context: SdkContext): ts.Statement[] {
        return [...this.invokeFetcher(context), ...this.response.getReturnResponseStatements(context)];
    }

    /**
     * Builds the URL path expression for this endpoint using buildUrl().
     * Shared by both getPathExpression() and getReferenceToBaseUrl().
     */
    private buildUrlPath(context: SdkContext): ts.Expression | undefined {
        return buildUrl({
            endpoint: this.endpoint,
            generatedClientClass: this.generatedSdkClientClass,
            context,
            includeSerdeLayer: this.includeSerdeLayer,
            retainOriginalCasing: this.retainOriginalCasing,
            omitUndefined: this.omitUndefined,
            getReferenceToPathParameterVariableFromRequest: (pathParameter) => {
                return this.request.getReferenceToPathParameter(pathParameter.name.originalName, context);
            },
            parameterNaming: this.parameterNaming
        });
    }

    /**
     * Gets just the URL path expression (without base URL resolution).
     * Used by getClientRequestStatements() since the HttpClient handles base URL internally.
     */
    private getPathExpression(context: SdkContext): ts.Expression {
        return this.buildUrlPath(context) ?? ts.factory.createStringLiteral("");
    }

    private getReferenceToBaseUrl(context: SdkContext): ts.Expression {
        const baseUrl = this.generatedSdkClientClass.getBaseUrl(this.endpoint, context);
        const url = this.buildUrlPath(context);
        if (url != null) {
            return context.coreUtilities.urlUtils.join._invoke([baseUrl, url]);
        } else {
            return baseUrl;
        }
    }

    private invokeFetcher(context: SdkContext): ts.Statement[] {
        const fetcherArgs: Fetcher.Args = {
            ...this.request.getFetcherRequestArgs(context),
            url: this.getReferenceToBaseUrl(context),
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
            logging: this.generatedSdkClientClass.getReferenceToLogger(),
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
                                referenceToFetcher: this.generatedSdkClientClass.getReferenceToFetcher(),
                                cast: undefined,
                                additionalArgs: [
                                    buildFetchOptionsArg({
                                        requestOptionsParameterName: REQUEST_OPTIONS_PARAMETER_NAME,
                                        generateEndpointMetadata: this.generateEndpointMetadata,
                                        generatedSdkClientClass: this.generatedSdkClientClass
                                    })
                                ]
                            })
                        )
                    ],
                    ts.NodeFlags.Const
                )
            )
        ];
    }
}
