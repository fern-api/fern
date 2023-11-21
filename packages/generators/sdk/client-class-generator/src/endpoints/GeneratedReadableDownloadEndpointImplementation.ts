import { HttpEndpoint } from "@fern-fern/ir-sdk/api";
import { Fetcher } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";
import { GeneratedEndpointRequest } from "../endpoint-request/GeneratedEndpointRequest";
import { GeneratedSdkClientClassImpl } from "../GeneratedSdkClientClassImpl";
import { EndpointSignature, GeneratedEndpointImplementation } from "./GeneratedEndpointImplementation";
import { buildUrl } from "./utils/buildUrl";
import {
    getMaxRetriesExpression,
    getRequestOptionsParameter,
    getTimeoutExpression,
} from "./utils/requestOptionsParameter";

export declare namespace GeneratedReadableDownloadEndpointImplementation {
    export interface Init {
        endpoint: HttpEndpoint;
        generatedSdkClientClass: GeneratedSdkClientClassImpl;
        includeCredentialsOnCrossOriginRequests: boolean;
        defaultTimeoutInSeconds: number | "infinity" | undefined;
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
    private defaultTimeoutInSeconds: number | "infinity" | undefined;
    private request: GeneratedEndpointRequest;
    private includeContentHeadersOnResponse: boolean;
    private includeSerdeLayer: boolean;

    constructor({
        endpoint,
        generatedSdkClientClass,
        includeCredentialsOnCrossOriginRequests,
        defaultTimeoutInSeconds,
        request,
        includeContentHeadersOnResponse,
        includeSerdeLayer,
    }: GeneratedReadableDownloadEndpointImplementation.Init) {
        this.endpoint = endpoint;
        this.generatedSdkClientClass = generatedSdkClientClass;
        this.includeCredentialsOnCrossOriginRequests = includeCredentialsOnCrossOriginRequests;
        this.defaultTimeoutInSeconds = defaultTimeoutInSeconds;
        this.request = request;
        this.includeContentHeadersOnResponse = includeContentHeadersOnResponse;
        this.includeSerdeLayer = includeSerdeLayer;
    }

    public getOverloads(): EndpointSignature[] {
        return [];
    }

    public getSignature(context: SdkContext): EndpointSignature {
        return {
            parameters: [
                ...this.request.getEndpointParameters(context),
                getRequestOptionsParameter({
                    requestOptionsReference: this.generatedSdkClientClass.getReferenceToRequestOptions(this.endpoint),
                }),
            ],
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
        const fetcherArgs: Fetcher.Args = {
            ...this.request.getFetcherRequestArgs(context),
            url: this.getReferenceToEnvironment(context),
            method: ts.factory.createStringLiteral(this.endpoint.method),
            timeoutInSeconds: getTimeoutExpression({
                defaultTimeoutInSeconds: this.defaultTimeoutInSeconds,
                timeoutInSecondsReference: this.generatedSdkClientClass.getReferenceToTimeoutInSeconds.bind(
                    this.generatedSdkClientClass
                ),
            }),
            maxRetries: getMaxRetriesExpression({
                maxRetriesReference: this.generatedSdkClientClass.getReferenceToMaxRetries.bind(
                    this.generatedSdkClientClass
                ),
            }),
            withCredentials: this.includeCredentialsOnCrossOriginRequests,
        };

        const fetcherCall = context.coreUtilities.streamingFetcher.streamingFetcher._invoke(
            {
                ...fetcherArgs,
                abortController: undefined,
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
