import { ExampleEndpointCall, HttpEndpoint } from "@fern-fern/ir-sdk/api";
import { Fetcher, GetReferenceOpts, getExampleEndpointCalls } from "@fern-typescript/commons";
import { EndpointSampleCode, GeneratedEndpointImplementation, SdkContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";
import { GeneratedEndpointRequest } from "../../endpoint-request/GeneratedEndpointRequest";
import { GeneratedSdkClientClassImpl } from "../../GeneratedSdkClientClassImpl";
import { buildUrl } from "../utils/buildUrl";
import { generateEndpointMetadata } from "../utils/generateEndpointMetadata";
import {
    getAbortSignalExpression,
    getMaxRetriesExpression,
    getRequestOptionsParameter,
    getTimeoutExpression,
    REQUEST_OPTIONS_PARAMETER_NAME
} from "../utils/requestOptionsParameter";
import { GeneratedEndpointResponse } from "./endpoint-response/GeneratedEndpointResponse";

export declare namespace GeneratedDefaultEndpointImplementation {
    export interface Init {
        endpoint: HttpEndpoint;
        generatedSdkClientClass: GeneratedSdkClientClassImpl;
        includeCredentialsOnCrossOriginRequests: boolean;
        defaultTimeoutInSeconds: number | "infinity" | undefined;
        request: GeneratedEndpointRequest;
        response: GeneratedEndpointResponse;
        includeSerdeLayer: boolean;
        retainOriginalCasing: boolean;
        omitUndefined: boolean;
        generateEndpointMetadata: boolean;
    }
}

const EXAMPLE_PREFIX = "    ";

export class GeneratedDefaultEndpointImplementation implements GeneratedEndpointImplementation {
    public readonly endpoint: HttpEndpoint;
    public readonly response: GeneratedEndpointResponse;
    private readonly generatedSdkClientClass: GeneratedSdkClientClassImpl;
    private readonly includeCredentialsOnCrossOriginRequests: boolean;
    private readonly defaultTimeoutInSeconds: number | "infinity" | undefined;
    private readonly request: GeneratedEndpointRequest;
    private readonly includeSerdeLayer: boolean;
    private readonly retainOriginalCasing: boolean;
    private readonly omitUndefined: boolean;
    private readonly generateEndpointMetadata: boolean;

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
        generateEndpointMetadata
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
    }

    public isPaginated(context: SdkContext): boolean {
        return this.response.getPaginationInfo(context) != null;
    }

    public getOverloads(): GeneratedEndpointImplementation.EndpointSignature[] {
        return [];
    }

    public getSignature(context: SdkContext): GeneratedEndpointImplementation.EndpointSignature {
        const paginationInfo = this.response.getPaginationInfo(context);
        const mainReturnType =
            paginationInfo != null
                ? context.coreUtilities.pagination.Page._getReferenceToType(
                      paginationInfo.itemType,
                      paginationInfo.responseType
                  )
                : this.response.getReturnType(context);
        return {
            parameters: [
                ...this.request.getEndpointParameters(context),
                getRequestOptionsParameter({
                    requestOptionsReference: this.generatedSdkClientClass.getReferenceToRequestOptions(this.endpoint)
                })
            ],
            returnTypeWithoutPromise: mainReturnType
        };
    }

    public getDocs(context: SdkContext): string | undefined {
        const groups: string[] = [];
        if (this.endpoint.docs != null) {
            groups.push(this.endpoint.docs);
        }

        const params: string[] = [];
        for (const parameter of this.request.getEndpointParameters(context)) {
            if (parameter.docs == null) {
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

        const examples: string[] = [];
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
            // Only add if it doesn't already exist
            if (!examples.includes(exampleStr)) {
                examples.push(exampleStr);
            }
        }
        if (examples.length > 0) {
            // Each example is its own group.
            groups.push(...examples);
        }

        return groups.join("\n\n");
    }

    public getExample(args: {
        context: SdkContext;
        example: ExampleEndpointCall;
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
        const paginationInfo = this.response.getPaginationInfo(context);
        const responseReturnType = this.response.getReturnType(context);
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
                    context.coreUtilities.pagination.Pageable._construct({
                        responseType: paginationInfo.responseType,
                        itemType: paginationInfo.itemType,
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

    public invokeFetcherAndReturnResponse(context: SdkContext): ts.Statement[] {
        return [...this.invokeFetcher(context), ...this.response.getReturnResponseStatements(context)];
    }

    private getReferenceToBaseUrl(context: SdkContext): ts.Expression {
        const baseUrl = this.generatedSdkClientClass.getBaseUrl(this.endpoint, context);
        const url = buildUrl({
            endpoint: this.endpoint,
            generatedClientClass: this.generatedSdkClientClass,
            context,
            includeSerdeLayer: this.includeSerdeLayer,
            retainOriginalCasing: this.retainOriginalCasing,
            omitUndefined: this.omitUndefined,
            getReferenceToPathParameterVariableFromRequest: (pathParameter) => {
                return this.request.getReferenceToPathParameter(pathParameter.name.originalName, context);
            }
        });
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
