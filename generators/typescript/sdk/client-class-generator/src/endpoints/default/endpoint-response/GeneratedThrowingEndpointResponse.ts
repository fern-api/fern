import {
    ErrorDiscriminationByPropertyStrategy,
    ErrorDiscriminationStrategy,
    HttpEndpoint,
    HttpResponse,
    ResponseError
} from "@fern-fern/ir-sdk/api";
import { getTextOfTsNode, PackageId } from "@fern-typescript/commons";
import { GeneratedSdkEndpointTypeSchemas, SdkContext } from "@fern-typescript/contexts";
import { ErrorResolver } from "@fern-typescript/resolvers";
import { ts } from "ts-morph";
import { GeneratedStreamingEndpointImplementation } from "../../GeneratedStreamingEndpointImplementation";
import { GeneratedEndpointResponse } from "./GeneratedEndpointResponse";
import {
    CONTENT_LENGTH_RESPONSE_KEY,
    CONTENT_LENGTH_VARIABLE_NAME,
    CONTENT_TYPE_RESPONSE_KEY,
    getSuccessReturnType,
    READABLE_RESPONSE_KEY
} from "./getSuccessReturnType";

export declare namespace GeneratedThrowingEndpointResponse {
    export interface Init {
        packageId: PackageId;
        endpoint: HttpEndpoint;
        response: HttpResponse.Json | HttpResponse.FileDownload | HttpResponse.Streaming | undefined;
        errorDiscriminationStrategy: ErrorDiscriminationStrategy;
        errorResolver: ErrorResolver;
        includeContentHeadersOnResponse: boolean;
    }
}

export class GeneratedThrowingEndpointResponse implements GeneratedEndpointResponse {
    private static RESPONSE_VARIABLE_NAME = "_response";

    private packageId: PackageId;
    private endpoint: HttpEndpoint;
    private response: HttpResponse.Json | HttpResponse.FileDownload | HttpResponse.Streaming | undefined;
    private errorDiscriminationStrategy: ErrorDiscriminationStrategy;
    private errorResolver: ErrorResolver;
    private includeContentHeadersOnResponse: boolean;

    constructor({
        packageId,
        endpoint,
        response,
        errorDiscriminationStrategy,
        errorResolver,
        includeContentHeadersOnResponse
    }: GeneratedThrowingEndpointResponse.Init) {
        this.packageId = packageId;
        this.endpoint = endpoint;
        this.response = response;
        this.errorDiscriminationStrategy = errorDiscriminationStrategy;
        this.errorResolver = errorResolver;
        this.includeContentHeadersOnResponse = includeContentHeadersOnResponse;
    }

    public getResponseVariableName(): string {
        return GeneratedThrowingEndpointResponse.RESPONSE_VARIABLE_NAME;
    }

    public getNamesOfThrownExceptions(context: SdkContext): string[] {
        return this.endpoint.errors.map((error) =>
            getTextOfTsNode(context.sdkError.getReferenceToError(error.error).getExpression())
        );
    }

    public getReturnType(context: SdkContext): ts.TypeNode {
        return getSuccessReturnType(this.response, context, {
            includeContentHeadersOnResponse: this.includeContentHeadersOnResponse
        });
    }

    public getReturnResponseStatements(context: SdkContext): ts.Statement[] {
        return [this.getReturnResponseIfOk(context), ...this.getReturnFailedResponse(context)];
    }

    private getReturnResponseIfOk(context: SdkContext): ts.Statement {
        return ts.factory.createIfStatement(
            ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier(GeneratedThrowingEndpointResponse.RESPONSE_VARIABLE_NAME),
                ts.factory.createIdentifier("ok")
            ),
            ts.factory.createBlock(this.getReturnStatementsForOkResponse(context), true)
        );
    }

    private getReturnStatementsForOkResponseBody(context: SdkContext): ts.Statement[] {
        const generatedEndpointTypeSchemas = this.getGeneratedEndpointTypeSchemas(context);
        if (this.includeContentHeadersOnResponse && this.response?.type === "fileDownload") {
            return [
                ts.factory.createVariableStatement(
                    undefined,
                    ts.factory.createVariableDeclarationList(
                        [
                            ts.factory.createVariableDeclaration(
                                ts.factory.createIdentifier(CONTENT_LENGTH_VARIABLE_NAME),
                                undefined,
                                undefined,
                                context.coreUtilities.fetcher.getHeader._invoke({
                                    referenceToResponseHeaders: this.getReferenceToResponseHeaders(context),
                                    header: "Content-Length"
                                })
                            )
                        ],
                        ts.NodeFlags.Const
                    )
                ),
                ts.factory.createReturnStatement(
                    ts.factory.createObjectLiteralExpression(
                        [
                            ts.factory.createPropertyAssignment(
                                ts.factory.createIdentifier(READABLE_RESPONSE_KEY),
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createIdentifier(
                                        GeneratedThrowingEndpointResponse.RESPONSE_VARIABLE_NAME
                                    ),
                                    context.coreUtilities.fetcher.APIResponse.SuccessfulResponse.body
                                )
                            ),
                            ts.factory.createPropertyAssignment(
                                ts.factory.createIdentifier(CONTENT_LENGTH_RESPONSE_KEY),
                                ts.factory.createConditionalExpression(
                                    ts.factory.createBinaryExpression(
                                        ts.factory.createIdentifier(CONTENT_LENGTH_VARIABLE_NAME),
                                        ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
                                        ts.factory.createNull()
                                    ),
                                    ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                                    ts.factory.createCallExpression(ts.factory.createIdentifier("Number"), undefined, [
                                        ts.factory.createIdentifier(CONTENT_LENGTH_VARIABLE_NAME)
                                    ]),
                                    ts.factory.createToken(ts.SyntaxKind.ColonToken),
                                    ts.factory.createIdentifier("undefined")
                                )
                            ),
                            ts.factory.createPropertyAssignment(
                                ts.factory.createIdentifier(CONTENT_TYPE_RESPONSE_KEY),
                                context.coreUtilities.fetcher.getHeader._invoke({
                                    referenceToResponseHeaders: this.getReferenceToResponseHeaders(context),
                                    header: "Content-Type"
                                })
                            )
                        ],
                        true
                    )
                )
            ];
        } else if (this.response?.type === "streaming") {
            return [
                ts.factory.createReturnStatement(
                    context.coreUtilities.streamUtils.Stream._construct({
                        stream: ts.factory.createPropertyAccessChain(
                            ts.factory.createIdentifier(GeneratedThrowingEndpointResponse.RESPONSE_VARIABLE_NAME),
                            undefined,
                            ts.factory.createIdentifier(
                                context.coreUtilities.fetcher.APIResponse.SuccessfulResponse.body
                            )
                        ),
                        terminator: this.response.terminator ?? "\n",
                        parse: ts.factory.createArrowFunction(
                            [ts.factory.createToken(ts.SyntaxKind.AsyncKeyword)],
                            undefined,
                            [
                                ts.factory.createParameterDeclaration(
                                    undefined,
                                    undefined,
                                    undefined,
                                    GeneratedStreamingEndpointImplementation.DATA_PARAMETER_NAME
                                )
                            ],
                            undefined,
                            ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                            ts.factory.createBlock(
                                [
                                    ts.factory.createReturnStatement(
                                        context.sdkEndpointTypeSchemas
                                            .getGeneratedEndpointTypeSchemas(this.packageId, this.endpoint.name)
                                            .deserializeStreamData({
                                                context,
                                                referenceToRawStreamData: ts.factory.createIdentifier(
                                                    GeneratedStreamingEndpointImplementation.DATA_PARAMETER_NAME
                                                )
                                            })
                                    )
                                ],
                                true
                            )
                        )
                    })
                )
            ];
        }
        return [
            ts.factory.createReturnStatement(
                generatedEndpointTypeSchemas.deserializeResponse(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier(GeneratedThrowingEndpointResponse.RESPONSE_VARIABLE_NAME),
                        context.coreUtilities.fetcher.APIResponse.SuccessfulResponse.body
                    ),
                    context
                )
            )
        ];
    }

    private getReferenceToResponseHeaders(context: SdkContext): ts.Expression {
        return ts.factory.createBinaryExpression(
            ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier(GeneratedThrowingEndpointResponse.RESPONSE_VARIABLE_NAME),
                ts.factory.createIdentifier(context.coreUtilities.fetcher.APIResponse.SuccessfulResponse.headers)
            ),
            ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
            ts.factory.createObjectLiteralExpression([], false)
        );
    }

    private getReturnFailedResponse(context: SdkContext): ts.Statement[] {
        return [...this.getThrowsForStatusCodeErrors(context), ...this.getThrowsForNonStatusCodeErrors(context)];
    }

    private getThrowsForStatusCodeErrors(context: SdkContext): ts.Statement[] {
        const referenceToError = this.getReferenceToError(context);
        const referenceToErrorBody = this.getReferenceToErrorBody(context);

        const defaultThrow = ts.factory.createThrowStatement(
            context.genericAPISdkError.getGeneratedGenericAPISdkError().build(context, {
                message: undefined,
                statusCode: ts.factory.createPropertyAccessExpression(
                    referenceToError,
                    context.coreUtilities.fetcher.Fetcher.FailedStatusCodeError.statusCode
                ),
                responseBody: ts.factory.createPropertyAccessExpression(
                    referenceToError,
                    context.coreUtilities.fetcher.Fetcher.FailedStatusCodeError.body
                )
            })
        );

        return [
            ts.factory.createIfStatement(
                ts.factory.createBinaryExpression(
                    ts.factory.createPropertyAccessExpression(
                        referenceToError,
                        context.coreUtilities.fetcher.Fetcher.Error.reason
                    ),
                    ts.factory.createToken(ts.SyntaxKind.EqualsEqualsEqualsToken),
                    ts.factory.createStringLiteral(
                        context.coreUtilities.fetcher.Fetcher.FailedStatusCodeError._reasonLiteralValue
                    )
                ),
                ts.factory.createBlock(
                    [
                        this.endpoint.errors.length > 0
                            ? this.getSwitchStatementForErrors({
                                  context,
                                  generateCaseBody: (error) => {
                                      const generatedSdkError = context.sdkError.getGeneratedSdkError(error.error);
                                      if (generatedSdkError?.type !== "class") {
                                          throw new Error("Cannot throw error because it's not a class");
                                      }
                                      const generatedSdkErrorSchema = context.sdkErrorSchema.getGeneratedSdkErrorSchema(
                                          error.error
                                      );
                                      return [
                                          ts.factory.createThrowStatement(
                                              generatedSdkError.build(context, {
                                                  referenceToBody:
                                                      generatedSdkErrorSchema != null
                                                          ? generatedSdkErrorSchema.deserializeBody(context, {
                                                                referenceToBody: referenceToErrorBody
                                                            })
                                                          : undefined
                                              })
                                          )
                                      ];
                                  },
                                  defaultBody: [defaultThrow]
                              })
                            : defaultThrow
                    ],
                    true
                )
            )
        ];
    }

    private getSwitchStatementForErrors({
        context,
        generateCaseBody,
        defaultBody
    }: {
        context: SdkContext;
        generateCaseBody: (responseError: ResponseError) => ts.Statement[];
        defaultBody: ts.Statement[];
    }) {
        return ErrorDiscriminationStrategy._visit(this.errorDiscriminationStrategy, {
            property: (propertyErrorDiscriminationStrategy) =>
                this.getSwitchStatementForPropertyDiscriminatedErrors({
                    context,
                    propertyErrorDiscriminationStrategy,
                    generateCaseBody,
                    defaultBody
                }),
            statusCode: () =>
                this.getSwitchStatementForStatusCodeDiscriminatedErrors({
                    context,
                    generateCaseBody,
                    defaultBody
                }),
            _other: () => {
                throw new Error("Unknown ErrorDiscriminationStrategy: " + this.errorDiscriminationStrategy.type);
            }
        });
    }

    private getSwitchStatementForPropertyDiscriminatedErrors({
        context,
        propertyErrorDiscriminationStrategy,
        generateCaseBody,
        defaultBody
    }: {
        context: SdkContext;
        propertyErrorDiscriminationStrategy: ErrorDiscriminationByPropertyStrategy;
        generateCaseBody: (responseError: ResponseError) => ts.Statement[];
        defaultBody: ts.Statement[];
    }) {
        return ts.factory.createSwitchStatement(
            ts.factory.createElementAccessChain(
                ts.factory.createAsExpression(
                    this.getReferenceToErrorBody(context),
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
                ),
                ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                ts.factory.createStringLiteral(propertyErrorDiscriminationStrategy.discriminant.wireValue)
            ),
            ts.factory.createCaseBlock([
                ...this.endpoint.errors.map((error) =>
                    ts.factory.createCaseClause(
                        ts.factory.createStringLiteral(
                            context.sdkError.getErrorDeclaration(error.error).discriminantValue.wireValue
                        ),
                        generateCaseBody(error)
                    )
                ),
                ts.factory.createDefaultClause(defaultBody)
            ])
        );
    }

    private getSwitchStatementForStatusCodeDiscriminatedErrors({
        context,
        generateCaseBody,
        defaultBody
    }: {
        context: SdkContext;
        generateCaseBody: (responseError: ResponseError) => ts.Statement[];
        defaultBody: ts.Statement[];
    }) {
        return ts.factory.createSwitchStatement(
            ts.factory.createPropertyAccessExpression(
                this.getReferenceToError(context),
                context.coreUtilities.fetcher.Fetcher.FailedStatusCodeError.statusCode
            ),
            ts.factory.createCaseBlock([
                ...this.endpoint.errors.map((error) => {
                    const errorDeclaration = this.errorResolver.getErrorDeclarationFromName(error.error);
                    return ts.factory.createCaseClause(
                        ts.factory.createNumericLiteral(errorDeclaration.statusCode),
                        generateCaseBody(error)
                    );
                }),
                ts.factory.createDefaultClause(defaultBody)
            ])
        );
    }

    private getThrowsForNonStatusCodeErrors(context: SdkContext): ts.Statement[] {
        const referenceToError = this.getReferenceToError(context);
        return [
            ts.factory.createSwitchStatement(
                ts.factory.createPropertyAccessExpression(
                    referenceToError,
                    context.coreUtilities.fetcher.Fetcher.Error.reason
                ),
                ts.factory.createCaseBlock([
                    ts.factory.createCaseClause(
                        ts.factory.createStringLiteral(
                            context.coreUtilities.fetcher.Fetcher.NonJsonError._reasonLiteralValue
                        ),
                        [
                            ts.factory.createThrowStatement(
                                context.genericAPISdkError.getGeneratedGenericAPISdkError().build(context, {
                                    message: undefined,
                                    statusCode: ts.factory.createPropertyAccessExpression(
                                        referenceToError,
                                        context.coreUtilities.fetcher.Fetcher.NonJsonError.statusCode
                                    ),
                                    responseBody: ts.factory.createPropertyAccessExpression(
                                        referenceToError,
                                        context.coreUtilities.fetcher.Fetcher.NonJsonError.rawBody
                                    )
                                })
                            )
                        ]
                    ),
                    ts.factory.createCaseClause(
                        ts.factory.createStringLiteral(
                            context.coreUtilities.fetcher.Fetcher.TimeoutSdkError._reasonLiteralValue
                        ),
                        [
                            ts.factory.createThrowStatement(
                                context.timeoutSdkError.getGeneratedTimeoutSdkError().build(context)
                            )
                        ]
                    ),
                    ts.factory.createCaseClause(
                        ts.factory.createStringLiteral(
                            context.coreUtilities.fetcher.Fetcher.UnknownError._reasonLiteralValue
                        ),
                        [
                            ts.factory.createThrowStatement(
                                context.genericAPISdkError.getGeneratedGenericAPISdkError().build(context, {
                                    message: ts.factory.createPropertyAccessExpression(
                                        referenceToError,
                                        context.coreUtilities.fetcher.Fetcher.UnknownError.message
                                    ),
                                    statusCode: undefined,
                                    responseBody: undefined
                                })
                            )
                        ]
                    )
                ])
            )
        ];
    }

    private getGeneratedEndpointTypeSchemas(context: SdkContext): GeneratedSdkEndpointTypeSchemas {
        return context.sdkEndpointTypeSchemas.getGeneratedEndpointTypeSchemas(this.packageId, this.endpoint.name);
    }

    private getReturnStatementsForOkResponse(context: SdkContext): ts.Statement[] {
        return this.endpoint.response != null
            ? this.getReturnStatementsForOkResponseBody(context)
            : [ts.factory.createReturnStatement(undefined)];
    }

    private getReferenceToError(context: SdkContext): ts.Expression {
        return ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier(GeneratedThrowingEndpointResponse.RESPONSE_VARIABLE_NAME),
            context.coreUtilities.fetcher.APIResponse.FailedResponse.error
        );
    }

    private getReferenceToErrorBody(context: SdkContext): ts.Expression {
        return ts.factory.createPropertyAccessExpression(
            this.getReferenceToError(context),
            context.coreUtilities.fetcher.Fetcher.FailedStatusCodeError.body
        );
    }
}
