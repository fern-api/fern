import { HttpEndpoint } from "@fern-fern/ir-model/http";
import { Fetcher } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";
import { GeneratedEndpointRequest } from "../endpoint-request/GeneratedEndpointRequest";
import { GeneratedSdkClientClassImpl } from "../GeneratedSdkClientClassImpl";
import { EndpointSignature, GeneratedEndpointImplementation } from "./GeneratedEndpointImplementation";
import { buildUrl } from "./utils/buildUrl";

export declare namespace GeneratedReadableDownloadEndpointImplementation {
    export interface Init {
        endpoint: HttpEndpoint;
        generatedSdkClientClass: GeneratedSdkClientClassImpl;
        includeCredentialsOnCrossOriginRequests: boolean;
        timeoutInSeconds: number | "infinity" | undefined;
        request: GeneratedEndpointRequest;
        includeContentHeadersOnResponse: boolean;
        includeSerdeLayer: boolean;
    }
}

export class GeneratedReadableDownloadEndpointImplementation implements GeneratedEndpointImplementation {
    private static RESPONSE_VARIABLE_NAME = "_response";
    private static READABLE_RESPONSE_KEY = "data";
    private static CONTENT_TYPE_RESPONSE_KEY = "contentType";
    private static CONTENT_LENGTH_RESPONSE_KEY = "contentLengthInBytes";
    private static CONTENT_LENGTH_VARIABLE_NAME = "_contentLength";

    public readonly endpoint: HttpEndpoint;
    private generatedSdkClientClass: GeneratedSdkClientClassImpl;
    private includeCredentialsOnCrossOriginRequests: boolean;
    private timeoutInSeconds: number | "infinity" | undefined;
    private request: GeneratedEndpointRequest;
    private includeContentHeadersOnResponse: boolean;
    private includeSerdeLayer: boolean;

    constructor({
        endpoint,
        generatedSdkClientClass,
        includeCredentialsOnCrossOriginRequests,
        timeoutInSeconds,
        request,
        includeContentHeadersOnResponse,
        includeSerdeLayer,
    }: GeneratedReadableDownloadEndpointImplementation.Init) {
        this.endpoint = endpoint;
        this.generatedSdkClientClass = generatedSdkClientClass;
        this.includeCredentialsOnCrossOriginRequests = includeCredentialsOnCrossOriginRequests;
        this.timeoutInSeconds = timeoutInSeconds;
        this.request = request;
        this.includeContentHeadersOnResponse = includeContentHeadersOnResponse;
        this.includeSerdeLayer = includeSerdeLayer;
    }

    public getOverloads(): EndpointSignature[] {
        return [];
    }

    public getSignature(context: SdkContext): EndpointSignature {
        return {
            parameters: this.request.getEndpointParameters(context),
            returnTypeWithoutPromise: this.includeContentHeadersOnResponse
                ? ts.factory.createTypeLiteralNode([
                      ts.factory.createPropertySignature(
                          undefined,
                          GeneratedReadableDownloadEndpointImplementation.READABLE_RESPONSE_KEY,
                          undefined,
                          context.externalDependencies.stream.Readable._getReferenceToType()
                      ),
                      ts.factory.createPropertySignature(
                          undefined,
                          GeneratedReadableDownloadEndpointImplementation.CONTENT_LENGTH_RESPONSE_KEY,
                          ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                          ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword)
                      ),
                      ts.factory.createPropertySignature(
                          undefined,
                          GeneratedReadableDownloadEndpointImplementation.CONTENT_TYPE_RESPONSE_KEY,
                          ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                          ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
                      ),
                  ])
                : context.externalDependencies.stream.Readable._getReferenceToType(),
        };
    }

    public getDocs(): string | undefined {
        return this.endpoint.docs ?? undefined;
    }

    public getStatements(context: SdkContext): ts.Statement[] {
        return [...this.getRequestBuilderStatements(context), ...this.invokeFetcher(context)];
    }

    public getRequestBuilderStatements(context: SdkContext): ts.Statement[] {
        return this.request.getBuildRequestStatements(context);
    }

    private getReferenceToEnvironment(context: SdkContext): ts.Expression {
        const referenceToEnvironment = this.generatedSdkClientClass.getEnvironment(this.endpoint, context);
        const url = buildUrl({
            endpoint: this.endpoint,
            generatedClientClass: this.generatedSdkClientClass,
            context,
            includeSerdeLayer: this.includeSerdeLayer,
        });
        if (url != null) {
            return context.externalDependencies.urlJoin.invoke([referenceToEnvironment, url]);
        } else {
            return referenceToEnvironment;
        }
    }

    public invokeFetcher(context: SdkContext): ts.Statement[] {
        const ERROR_CALLBACK_PARAMETER_NAME = "error";

        const fetcherArgs: Fetcher.Args = {
            ...this.request.getFetcherRequestArgs(context),
            url: this.getReferenceToEnvironment(context),
            method: ts.factory.createStringLiteral(this.endpoint.method),
            timeoutInSeconds: this.timeoutInSeconds,
            withCredentials: this.includeCredentialsOnCrossOriginRequests,
        };

        const fetcherCall = context.coreUtilities.streamingFetcher.streamingFetcher._invoke(
            {
                ...fetcherArgs,
                onData: undefined,
                onError: ts.factory.createArrowFunction(
                    undefined,
                    undefined,
                    [
                        ts.factory.createParameterDeclaration(
                            undefined,
                            undefined,
                            undefined,
                            ERROR_CALLBACK_PARAMETER_NAME
                        ),
                    ],
                    undefined,
                    undefined,
                    ts.factory.createBlock(
                        [
                            ts.factory.createThrowStatement(
                                context.genericAPISdkError.getGeneratedGenericAPISdkError().build(context, {
                                    message: ts.factory.createPropertyAccessChain(
                                        ts.factory.createAsExpression(
                                            ts.factory.createIdentifier(ERROR_CALLBACK_PARAMETER_NAME),
                                            ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
                                        ),
                                        ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                                        "message"
                                    ),
                                    statusCode: undefined,
                                    responseBody: undefined,
                                })
                            ),
                        ],
                        true
                    )
                ),
                onFinish: undefined,
                abortController: undefined,
                terminator: undefined,
            },
            {
                referenceToFetcher: this.generatedSdkClientClass.getReferenceToStreamingFetcher(context),
            }
        );

        const statements: ts.Statement[] = [
            ts.factory.createVariableStatement(
                undefined,
                ts.factory.createVariableDeclarationList(
                    [
                        ts.factory.createVariableDeclaration(
                            GeneratedReadableDownloadEndpointImplementation.RESPONSE_VARIABLE_NAME,
                            undefined,
                            undefined,
                            fetcherCall
                        ),
                    ],
                    ts.NodeFlags.Const
                )
            ),
        ];

        if (this.includeContentHeadersOnResponse) {
            statements.push(
                ts.factory.createVariableStatement(
                    undefined,
                    ts.factory.createVariableDeclarationList(
                        [
                            ts.factory.createVariableDeclaration(
                                ts.factory.createIdentifier(
                                    GeneratedReadableDownloadEndpointImplementation.CONTENT_LENGTH_VARIABLE_NAME
                                ),
                                undefined,
                                undefined,
                                context.coreUtilities.streamingFetcher.getHeader._invoke({
                                    referenceToRequest: ts.factory.createIdentifier(
                                        GeneratedReadableDownloadEndpointImplementation.RESPONSE_VARIABLE_NAME
                                    ),
                                    header: "Content-Length",
                                })
                            ),
                        ],
                        ts.NodeFlags.Const
                    )
                ),
                ts.factory.createReturnStatement(
                    ts.factory.createObjectLiteralExpression(
                        [
                            ts.factory.createPropertyAssignment(
                                ts.factory.createIdentifier(
                                    GeneratedReadableDownloadEndpointImplementation.READABLE_RESPONSE_KEY
                                ),
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createIdentifier(
                                        GeneratedReadableDownloadEndpointImplementation.RESPONSE_VARIABLE_NAME
                                    ),
                                    context.coreUtilities.streamingFetcher.StreamingFetcher.Response.properties.data
                                )
                            ),
                            ts.factory.createPropertyAssignment(
                                ts.factory.createIdentifier(
                                    GeneratedReadableDownloadEndpointImplementation.CONTENT_LENGTH_RESPONSE_KEY
                                ),
                                ts.factory.createConditionalExpression(
                                    ts.factory.createBinaryExpression(
                                        ts.factory.createIdentifier(
                                            GeneratedReadableDownloadEndpointImplementation.CONTENT_LENGTH_VARIABLE_NAME
                                        ),
                                        ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
                                        ts.factory.createNull()
                                    ),
                                    ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                                    ts.factory.createCallExpression(ts.factory.createIdentifier("Number"), undefined, [
                                        ts.factory.createIdentifier(
                                            GeneratedReadableDownloadEndpointImplementation.CONTENT_LENGTH_VARIABLE_NAME
                                        ),
                                    ]),
                                    ts.factory.createToken(ts.SyntaxKind.ColonToken),
                                    ts.factory.createIdentifier("undefined")
                                )
                            ),
                            ts.factory.createPropertyAssignment(
                                ts.factory.createIdentifier(
                                    GeneratedReadableDownloadEndpointImplementation.CONTENT_TYPE_RESPONSE_KEY
                                ),
                                context.coreUtilities.streamingFetcher.getHeader._invoke({
                                    referenceToRequest: ts.factory.createIdentifier(
                                        GeneratedReadableDownloadEndpointImplementation.RESPONSE_VARIABLE_NAME
                                    ),
                                    header: "Content-Type",
                                })
                            ),
                        ],
                        true
                    )
                )
            );
        } else {
            statements.push(
                ts.factory.createReturnStatement(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier(
                            GeneratedReadableDownloadEndpointImplementation.RESPONSE_VARIABLE_NAME
                        ),
                        context.coreUtilities.streamingFetcher.StreamingFetcher.Response.properties.data
                    )
                )
            );
        }

        return statements;
    }
}
