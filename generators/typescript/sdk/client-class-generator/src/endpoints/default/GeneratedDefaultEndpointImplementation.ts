import { Fetcher, GetReferenceOpts, getExampleEndpointCalls, getTextOfTsNode } from "@fern-typescript/commons";
import { GeneratedEndpointImplementation, SdkContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

import { ExampleEndpointCall, HttpEndpoint } from "@fern-fern/ir-sdk/api";

import { GeneratedSdkClientClassImpl } from "../../GeneratedSdkClientClassImpl";
import { GeneratedEndpointRequest } from "../../endpoint-request/GeneratedEndpointRequest";
import { buildUrl } from "../utils/buildUrl";
import {
    REQUEST_OPTIONS_PARAMETER_NAME,
    getAbortSignalExpression,
    getMaxRetriesExpression,
    getRequestOptionsParameter,
    getTimeoutExpression
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
    }
}

const EXAMPLE_PREFIX = "    ";

export class GeneratedDefaultEndpointImplementation implements GeneratedEndpointImplementation {
    public readonly endpoint: HttpEndpoint;
    public readonly response: GeneratedEndpointResponse;
    private generatedSdkClientClass: GeneratedSdkClientClassImpl;
    private includeCredentialsOnCrossOriginRequests: boolean;
    private defaultTimeoutInSeconds: number | "infinity" | undefined;
    private request: GeneratedEndpointRequest;
    private includeSerdeLayer: boolean;
    private retainOriginalCasing: boolean;
    private omitUndefined: boolean;

    constructor({
        endpoint,
        response,
        generatedSdkClientClass,
        includeCredentialsOnCrossOriginRequests,
        defaultTimeoutInSeconds,
        request,
        includeSerdeLayer,
        retainOriginalCasing,
        omitUndefined
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
    }

    public isPaginated(context: SdkContext): boolean {
        return this.response.getPaginationInfo(context) != null;
    }

    public getOverloads(): GeneratedEndpointImplementation.EndpointSignatures[] {
        return [];
    }

    public getSignature(context: SdkContext): GeneratedEndpointImplementation.EndpointSignatures {
        const paginationInfo = this.response.getPaginationInfo(context);
        const mainReturnType =
            paginationInfo != null
                ? context.coreUtilities.pagination.Page._getReferenceToType(paginationInfo.itemType)
                : this.response.getReturnType(context).mainMethod;
        const withRawResponseReturnType =
            paginationInfo != null
                ? context.coreUtilities.pagination.Page._getReferenceToType(paginationInfo.itemType)
                : this.response.getReturnType(context).withRawResponseMethod;
        const mainMethod = {
            parameters: [
                ...this.request.getEndpointParameters(context),
                getRequestOptionsParameter({
                    requestOptionsReference: this.generatedSdkClientClass.getReferenceToRequestOptions(this.endpoint)
                })
            ],
            returnTypeWithoutPromise: mainReturnType
        };
        return {
            mainMethod,
            withRawResponseMethod: {
                ...mainMethod,
                returnTypeWithoutPromise: withRawResponseReturnType
            }
        };
    }

    public getDocs(context: SdkContext): GeneratedEndpointImplementation.Docs {
        const docs: GeneratedEndpointImplementation.Docs = {
            getter: "",
            mainMethod: "",
            withRawResponseMethod: ""
        };
        if (this.endpoint.docs != null) {
            docs.getter += `${this.endpoint.docs}\n\n`;
            docs.mainMethod += `${this.endpoint.docs}\n\n`;
            docs.withRawResponseMethod += `${this.endpoint.docs}\n\n`;
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

        if (params.length > 0) {
            const paramsJoined = params.join("\n");
            docs.mainMethod += `${paramsJoined}\n\n`;
            docs.withRawResponseMethod += `${paramsJoined}\n\n`;
        }

        const exceptions: string[] = [];
        for (const errorName of this.response.getNamesOfThrownExceptions(context)) {
            exceptions.push(`@throws {@link ${errorName}}`);
        }
        if (exceptions.length > 0) {
            const exceptionsJoined = exceptions.join("\n");
            docs.mainMethod += `${exceptionsJoined}\n\n`;
            docs.withRawResponseMethod += `${exceptionsJoined}\n\n`;
        }

        const mainExamples: string[] = [];
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
            let exampleStr = "@example\n" + getTextOfTsNode(generatedExample);
            exampleStr = exampleStr.replaceAll("\n", `\n${EXAMPLE_PREFIX}`);
            // Only add if it doesn't already exist
            if (!mainExamples.includes(exampleStr)) {
                mainExamples.push(exampleStr);
                docs.getter += `${exampleStr}}\n\n`;
                docs.mainMethod += `${exampleStr}}\n\n`;
            }
        }

        const withRawResponseExamples: string[] = [];
        for (const example of getExampleEndpointCalls(this.endpoint)) {
            const generatedExample = this.getWithRawResponseExample({
                context,
                example,
                opts: { isForComment: true },
                clientReference: context.sdkInstanceReferenceForSnippet
            });
            if (generatedExample == null) {
                continue;
            }
            let exampleStr = "@example\n" + getTextOfTsNode(generatedExample);
            exampleStr = exampleStr.replaceAll("\n", `\n${EXAMPLE_PREFIX}`);
            // Only add if it doesn't already exist
            if (!withRawResponseExamples.includes(exampleStr)) {
                withRawResponseExamples.push(exampleStr);
                docs.getter += `${exampleStr}\n\n`;
                docs.withRawResponseMethod += `${exampleStr}\n\n`;
            }
        }

        docs.getter = docs.getter?.trim();
        docs.mainMethod = docs.mainMethod?.trim();
        docs.withRawResponseMethod = docs.withRawResponseMethod?.trim();

        return docs;
    }

    public getExample(args: {
        context: SdkContext;
        example: ExampleEndpointCall;
        opts: GetReferenceOpts;
        clientReference: ts.Identifier;
    }): ts.Expression | undefined {
        const exampleParameters = this.request.getExampleEndpointParameters({
            context: args.context,
            example: args.example,
            opts: args.opts
        });
        if (exampleParameters == null) {
            return undefined;
        }
        return ts.factory.createAwaitExpression(
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
        );
    }

    private getWithRawResponseExample(args: {
        context: SdkContext;
        example: ExampleEndpointCall;
        opts: GetReferenceOpts;
        clientReference: ts.Identifier;
    }): ts.Expression | undefined {
        const exampleParameters = this.request.getExampleEndpointParameters({
            context: args.context,
            example: args.example,
            opts: args.opts
        });
        if (exampleParameters == null) {
            return undefined;
        }
        return ts.factory.createAwaitExpression(
            ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createPropertyAccessExpression(
                        this.generatedSdkClientClass.accessFromRootClient({
                            referenceToRootClient: args.clientReference
                        }),
                        ts.factory.createIdentifier(this.endpoint.name.camelCase.unsafeName)
                    ),
                    ts.factory.createIdentifier("withRawResponse")
                ),
                undefined,
                exampleParameters
            )
        );
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

        const responseVariableName = "response";
        const pageVariableName = "page";
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
                    ts.NodeFlags.Const
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
            )
        ];
    }

    public getStatements(context: SdkContext): ts.Statement[] {
        const body = [
            ...this.request.getBuildRequestStatements(context),
            ...this.invokeFetcherAndReturnResponse(context)
        ];

        const requestParameter = this.request.getRequestParameter(context);
        const paginationInfo = this.response.getPaginationInfo(context);
        const responseReturnTypes = this.response.getReturnType(context);
        if (paginationInfo != null && requestParameter != null) {
            const listFn = ts.factory.createVariableDeclarationList(
                [
                    ts.factory.createVariableDeclaration(
                        ts.factory.createIdentifier("list"),
                        undefined,
                        undefined,
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
                            ts.factory.createTypeReferenceNode("Promise", [responseReturnTypes.mainMethod]),
                            ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                            ts.factory.createBlock(body, undefined)
                        )
                    )
                ],
                ts.NodeFlags.Const
            );
            const statements: ts.Statement[] = [ts.factory.createVariableStatement(undefined, listFn)];
            if (paginationInfo.type === "offset" || paginationInfo.type === "offset-step") {
                statements.push(paginationInfo.initializeOffset);
            }
            statements.push(
                ts.factory.createReturnStatement(
                    ts.factory.createObjectLiteralExpression(
                        [
                            ts.factory.createPropertyAssignment(
                                ts.factory.createIdentifier("data"),
                                context.coreUtilities.pagination.Pageable._construct({
                                    responseType: paginationInfo.responseType,
                                    itemType: paginationInfo.itemType,
                                    response: ts.factory.createAwaitExpression(
                                        ts.factory.createCallExpression(
                                            ts.factory.createIdentifier("list"),
                                            undefined,
                                            [ts.factory.createIdentifier("request")]
                                        )
                                    ),
                                    hasNextPage: this.createLambdaWithResponse({ body: paginationInfo.hasNextPage }),
                                    getItems: this.createLambdaWithResponse({ body: paginationInfo.getItems }),
                                    loadPage: this.createLambdaWithResponse({
                                        body: ts.factory.createBlock(paginationInfo.loadPage),
                                        ignoreResponse: paginationInfo.type === "offset"
                                    })
                                })
                            ),
                            ts.factory.createSpreadAssignment(
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createIdentifier("_response"),
                                    ts.factory.createIdentifier("rawResponse")
                                )
                            )
                        ],
                        false
                    )
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
            return context.externalDependencies.urlJoin.invoke([baseUrl, url]);
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
                )
            }),
            maxRetries: getMaxRetriesExpression({
                maxRetriesReference: this.generatedSdkClientClass.getReferenceToMaxRetries.bind(
                    this.generatedSdkClientClass
                )
            }),
            abortSignal: getAbortSignalExpression({
                abortSignalReference: this.generatedSdkClientClass.getReferenceToAbortSignal.bind(
                    this.generatedSdkClientClass
                )
            }),

            withCredentials: this.includeCredentialsOnCrossOriginRequests
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
