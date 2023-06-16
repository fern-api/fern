import { HttpEndpoint, StreamingResponse } from "@fern-fern/ir-model/http";
import { Fetcher, getTextOfTsNode, PackageId, StreamingFetcher } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { OptionalKind, ParameterDeclarationStructure, ts } from "ts-morph";
import { GeneratedEndpointRequest } from "../endpoint-request/GeneratedEndpointRequest";
import { GeneratedSdkClientClassImpl } from "../GeneratedSdkClientClassImpl";
import { EndpointSignature, GeneratedEndpointImplementation } from "./GeneratedEndpointImplementation";
import { buildUrl } from "./utils/buildUrl";

export declare namespace GeneratedStreamingEndpointImplementation {
    export interface Init {
        packageId: PackageId;
        endpoint: HttpEndpoint;
        response: StreamingResponse;
        generatedSdkClientClass: GeneratedSdkClientClassImpl;
        includeCredentialsOnCrossOriginRequests: boolean;
        timeoutInSeconds: number | "infinity" | undefined;
        request: GeneratedEndpointRequest;
    }
}

export class GeneratedStreamingEndpointImplementation implements GeneratedEndpointImplementation {
    private static CB_CALLBACK_NAME = "cb";
    private static DATA_PARAMETER_NAME = "data";
    private static OPTS_PARAMETER_NAME = "opts";
    private static CALLBACK_QUEUE_VARIABLE_NAME = "_queue";
    private static RESPONSE_VARIABLE_NAME = "_response";

    public readonly endpoint: HttpEndpoint;
    private packageId: PackageId;
    private response: StreamingResponse;
    private generatedSdkClientClass: GeneratedSdkClientClassImpl;
    private includeCredentialsOnCrossOriginRequests: boolean;
    private timeoutInSeconds: number | "infinity" | undefined;
    private request: GeneratedEndpointRequest;

    constructor({
        packageId,
        endpoint,
        generatedSdkClientClass,
        includeCredentialsOnCrossOriginRequests,
        response,
        timeoutInSeconds,
        request,
    }: GeneratedStreamingEndpointImplementation.Init) {
        this.packageId = packageId;
        this.endpoint = endpoint;
        this.generatedSdkClientClass = generatedSdkClientClass;
        this.includeCredentialsOnCrossOriginRequests = includeCredentialsOnCrossOriginRequests;
        this.response = response;
        this.timeoutInSeconds = timeoutInSeconds;
        this.request = request;
    }

    public getOverloads(): EndpointSignature[] {
        return [];
    }

    public getSignature(
        context: SdkContext,
        {
            requestParameterIntersection,
            excludeInitializers = false,
        }: { requestParameterIntersection?: ts.TypeNode; excludeInitializers?: boolean } = {}
    ): EndpointSignature {
        return {
            parameters: this.getEndpointParameters(context, {
                requestParameterIntersection,
                excludeInitializers,
            }),
            returnTypeWithoutPromise: context.externalDependencies.stream.Readable._getReferenceToType(),
        };
    }

    private getEndpointParameters(
        context: SdkContext,
        {
            requestParameterIntersection,
            excludeInitializers,
        }: { requestParameterIntersection: ts.TypeNode | undefined; excludeInitializers: boolean }
    ): OptionalKind<ParameterDeclarationStructure>[] {
        return [
            ...this.request.getEndpointParameters(context, {
                requestParameterIntersection,
                excludeInitializers,
            }),
            {
                name: GeneratedStreamingEndpointImplementation.CB_CALLBACK_NAME,
                type: getTextOfTsNode(
                    ts.factory.createFunctionTypeNode(
                        undefined,
                        [
                            ts.factory.createParameterDeclaration(
                                undefined,
                                undefined,
                                undefined,
                                GeneratedStreamingEndpointImplementation.DATA_PARAMETER_NAME,
                                undefined,
                                context.type.getReferenceToType(this.response.dataEventType).typeNode
                            ),
                        ],
                        ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword)
                    )
                ),
            },
            {
                name: GeneratedStreamingEndpointImplementation.OPTS_PARAMETER_NAME,
                hasQuestionToken: true,
                type: getTextOfTsNode(
                    ts.factory.createExpressionWithTypeArguments(ts.factory.createIdentifier("Pick"), [
                        context.coreUtilities.streamingFetcher.StreamingFetcher.Args._getReferenceToType(),
                        ts.factory.createUnionTypeNode([
                            ts.factory.createLiteralTypeNode(
                                ts.factory.createStringLiteral(
                                    context.coreUtilities.streamingFetcher.StreamingFetcher.Args.properties.onError
                                )
                            ),
                            ts.factory.createLiteralTypeNode(
                                ts.factory.createStringLiteral(
                                    context.coreUtilities.streamingFetcher.StreamingFetcher.Args.properties.onFinish
                                )
                            ),
                            ts.factory.createLiteralTypeNode(
                                ts.factory.createStringLiteral(
                                    context.coreUtilities.streamingFetcher.StreamingFetcher.Args.properties
                                        .abortController
                                )
                            ),
                            ts.factory.createLiteralTypeNode(
                                ts.factory.createStringLiteral(
                                    context.coreUtilities.streamingFetcher.StreamingFetcher.Args.properties.timeoutMs
                                )
                            ),
                        ]),
                    ])
                ),
            },
        ];
    }

    public getDocs(): string | undefined {
        return this.endpoint.docs ?? undefined;
    }

    public getStatements(context: SdkContext): ts.Statement[] {
        return [
            ...this.getRequestBuilderStatements(context),
            ...this.invokeFetcher(context, { isCallbackOptional: false }),
        ];
    }

    public getRequestBuilderStatements(context: SdkContext): ts.Statement[] {
        return this.request.getBuildRequestStatements(context);
    }

    private getReferenceToEnvironment(context: SdkContext): ts.Expression {
        const referenceToEnvironment = this.generatedSdkClientClass.getEnvironment(this.endpoint, context);
        const url = buildUrl({ endpoint: this.endpoint, generatedClientClass: this.generatedSdkClientClass, context });
        if (url != null) {
            return context.externalDependencies.urlJoin.invoke([referenceToEnvironment, url]);
        } else {
            return referenceToEnvironment;
        }
    }

    public invokeFetcher(context: SdkContext, { isCallbackOptional }: { isCallbackOptional: boolean }): ts.Statement[] {
        const PARSED_DATA_VARIABLE_NAME = "parsed";

        const fetcherArgs: Fetcher.Args = {
            ...this.request.getFetcherRequestArgs(context),
            url: this.getReferenceToEnvironment(context),
            method: ts.factory.createStringLiteral(this.endpoint.method),
            timeoutInSeconds: this.timeoutInSeconds,
            withCredentials: this.includeCredentialsOnCrossOriginRequests,
        };

        return [
            ts.factory.createVariableStatement(
                undefined,
                ts.factory.createVariableDeclarationList(
                    [
                        ts.factory.createVariableDeclaration(
                            GeneratedStreamingEndpointImplementation.CALLBACK_QUEUE_VARIABLE_NAME,
                            undefined,
                            undefined,
                            context.coreUtilities.callbackQueue._instantiate()
                        ),
                    ],
                    ts.NodeFlags.Const
                )
            ),
            ts.factory.createVariableStatement(
                undefined,
                ts.factory.createVariableDeclarationList(
                    [
                        ts.factory.createVariableDeclaration(
                            GeneratedStreamingEndpointImplementation.RESPONSE_VARIABLE_NAME,
                            undefined,
                            undefined,
                            context.coreUtilities.streamingFetcher.streamingFetcher._invoke(
                                {
                                    ...fetcherArgs,
                                    onData: context.coreUtilities.callbackQueue.wrap({
                                        referenceToCallbackQueue: ts.factory.createIdentifier(
                                            GeneratedStreamingEndpointImplementation.CALLBACK_QUEUE_VARIABLE_NAME
                                        ),
                                        functionToWrap: ts.factory.createArrowFunction(
                                            [ts.factory.createToken(ts.SyntaxKind.AsyncKeyword)],
                                            undefined,
                                            [
                                                ts.factory.createParameterDeclaration(
                                                    undefined,
                                                    undefined,
                                                    undefined,
                                                    GeneratedStreamingEndpointImplementation.DATA_PARAMETER_NAME
                                                ),
                                            ],
                                            undefined,
                                            ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                                            ts.factory.createBlock(
                                                context.sdkEndpointTypeSchemas
                                                    .getGeneratedEndpointTypeSchemas(this.packageId, this.endpoint.name)
                                                    .deserializeStreamDataAndVisitMaybeValid({
                                                        context,
                                                        referenceToRawStreamData: ts.factory.createIdentifier(
                                                            GeneratedStreamingEndpointImplementation.DATA_PARAMETER_NAME
                                                        ),
                                                        parsedDataVariableName: PARSED_DATA_VARIABLE_NAME,
                                                        visitValid: (validData) => [
                                                            ts.factory.createExpressionStatement(
                                                                isCallbackOptional
                                                                    ? ts.factory.createCallChain(
                                                                          ts.factory.createIdentifier(
                                                                              GeneratedStreamingEndpointImplementation.CB_CALLBACK_NAME
                                                                          ),
                                                                          ts.factory.createToken(
                                                                              ts.SyntaxKind.QuestionDotToken
                                                                          ),
                                                                          undefined,
                                                                          [validData]
                                                                      )
                                                                    : ts.factory.createCallExpression(
                                                                          ts.factory.createIdentifier(
                                                                              GeneratedStreamingEndpointImplementation.CB_CALLBACK_NAME
                                                                          ),
                                                                          undefined,
                                                                          [validData]
                                                                      )
                                                            ),
                                                        ],
                                                        visitInvalid: (errors) => [
                                                            ts.factory.createExpressionStatement(
                                                                ts.factory.createCallChain(
                                                                    this.getReferenceToOpt("onError"),
                                                                    ts.factory.createToken(
                                                                        ts.SyntaxKind.QuestionDotToken
                                                                    ),
                                                                    undefined,
                                                                    [errors]
                                                                )
                                                            ),
                                                        ],
                                                    }),
                                                true
                                            )
                                        ),
                                    }),
                                    onError: ts.factory.createConditionalExpression(
                                        ts.factory.createBinaryExpression(
                                            this.getReferenceToOpt("onError"),
                                            ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
                                            ts.factory.createNull()
                                        ),
                                        ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                                        context.coreUtilities.callbackQueue.wrap({
                                            referenceToCallbackQueue: ts.factory.createIdentifier(
                                                GeneratedStreamingEndpointImplementation.CALLBACK_QUEUE_VARIABLE_NAME
                                            ),
                                            functionToWrap: this.getReferenceToOpt("onError", { isNotNull: true }),
                                        }),
                                        ts.factory.createToken(ts.SyntaxKind.ColonToken),
                                        ts.factory.createIdentifier("undefined")
                                    ),
                                    onFinish: ts.factory.createConditionalExpression(
                                        ts.factory.createBinaryExpression(
                                            this.getReferenceToOpt("onFinish"),
                                            ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
                                            ts.factory.createNull()
                                        ),
                                        ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                                        context.coreUtilities.callbackQueue.wrap({
                                            referenceToCallbackQueue: ts.factory.createIdentifier(
                                                GeneratedStreamingEndpointImplementation.CALLBACK_QUEUE_VARIABLE_NAME
                                            ),
                                            functionToWrap: this.getReferenceToOpt("onFinish", { isNotNull: true }),
                                        }),
                                        ts.factory.createToken(ts.SyntaxKind.ColonToken),
                                        ts.factory.createIdentifier("undefined")
                                    ),
                                    abortController: this.getReferenceToOpt("abortController"),
                                    terminator:
                                        this.response.terminator != null
                                            ? ts.factory.createStringLiteral(this.response.terminator)
                                            : undefined,
                                },
                                {
                                    referenceToFetcher:
                                        this.generatedSdkClientClass.getReferenceToStreamingFetcher(context),
                                }
                            )
                        ),
                    ],
                    ts.NodeFlags.Const
                )
            ),
            ts.factory.createReturnStatement(
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier(GeneratedStreamingEndpointImplementation.RESPONSE_VARIABLE_NAME),
                    context.coreUtilities.streamingFetcher.StreamingFetcher.Response.properties.data
                )
            ),
        ];
    }

    private getReferenceToOpt(
        key: keyof StreamingFetcher.Args,
        { isNotNull }: { isNotNull?: boolean } = {}
    ): ts.Expression {
        return ts.factory.createPropertyAccessChain(
            ts.factory.createIdentifier(GeneratedStreamingEndpointImplementation.OPTS_PARAMETER_NAME),
            isNotNull ? undefined : ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
            ts.factory.createIdentifier(key)
        );
    }

    public getReferenceToRequestBody(context: SdkContext): ts.Expression | undefined {
        return this.request.getReferenceToRequestBody(context);
    }

    public getReferenceToQueryParameter(queryParameterKey: string, context: SdkContext): ts.Expression {
        return this.request.getReferenceToQueryParameter(queryParameterKey, context);
    }
}
