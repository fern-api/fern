import { PackageId } from "@fern-typescript/commons";
import { GeneratedEndpointErrorUnion, GeneratedSdkEndpointTypeSchemas, SdkContext } from "@fern-typescript/contexts";
import { ErrorResolver } from "@fern-typescript/resolvers";
import { ts } from "ts-morph";

import {
    ErrorDiscriminationByPropertyStrategy,
    ErrorDiscriminationStrategy,
    HttpEndpoint,
    HttpResponseBody
} from "@fern-fern/ir-sdk/api";

import { GeneratedEndpointResponse, PaginationResponseInfo } from "./GeneratedEndpointResponse";
import { getSuccessReturnType } from "./getSuccessReturnType";

export declare namespace GeneratedNonThrowingEndpointResponse {
    export interface Init {
        packageId: PackageId;
        endpoint: HttpEndpoint;
        response:
            | HttpResponseBody.Json
            | HttpResponseBody.FileDownload
            | HttpResponseBody.Streaming
            | HttpResponseBody.Text
            | undefined;
        errorDiscriminationStrategy: ErrorDiscriminationStrategy;
        errorResolver: ErrorResolver;
        includeSerdeLayer: boolean;
    }
}

export class GeneratedNonThrowingEndpointResponse implements GeneratedEndpointResponse {
    private static RESPONSE_VARIABLE_NAME = "_response";

    private packageId: PackageId;
    private endpoint: HttpEndpoint;
    private response:
        | HttpResponseBody.Json
        | HttpResponseBody.FileDownload
        | HttpResponseBody.Streaming
        | HttpResponseBody.Text
        | undefined;
    private errorDiscriminationStrategy: ErrorDiscriminationStrategy;
    private errorResolver: ErrorResolver;
    private includeSerdeLayer: boolean;

    constructor({
        packageId,
        endpoint,
        response,
        errorDiscriminationStrategy,
        errorResolver,
        includeSerdeLayer
    }: GeneratedNonThrowingEndpointResponse.Init) {
        this.packageId = packageId;
        this.endpoint = endpoint;
        this.response = response;
        this.errorDiscriminationStrategy = errorDiscriminationStrategy;
        this.errorResolver = errorResolver;
        this.includeSerdeLayer = includeSerdeLayer;
    }

    public getPaginationInfo(): PaginationResponseInfo | undefined {
        return undefined;
    }

    public getResponseVariableName(): string {
        return GeneratedNonThrowingEndpointResponse.RESPONSE_VARIABLE_NAME;
    }

    public getNamesOfThrownExceptions(): string[] {
        return [];
    }

    public getReturnType(context: SdkContext): GeneratedEndpointResponse.ReturnTypes {
        const mainMethod = context.coreUtilities.fetcher.APIResponse._getReferenceToType(
            getSuccessReturnType(this.response, context),
            context.endpointErrorUnion
                .getGeneratedEndpointErrorUnion(this.packageId, this.endpoint.name)
                .getErrorUnion()
                .getReferenceTo(context)
        );
        const withRawResponseMethod = ts.factory.createIntersectionTypeNode([
            ts.factory.createTypeLiteralNode([
                ts.factory.createPropertySignature(
                    undefined,
                    ts.factory.createIdentifier("data"),
                    undefined,
                    mainMethod
                )
            ]),
            ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Partial"), [
                context.coreUtilities.RawResponse.RawResponse._getReferenceToType()
            ])
        ]);
        return {
            mainMethod,
            withRawResponseMethod
        };
    }

    public getReturnResponseStatements(context: SdkContext): ts.Statement[] {
        return [this.getReturnResponseIfOk(context), ...this.getReturnFailedResponse(context)];
    }

    private getReturnResponseIfOk(context: SdkContext): ts.Statement {
        return ts.factory.createIfStatement(
            ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier(GeneratedNonThrowingEndpointResponse.RESPONSE_VARIABLE_NAME),
                ts.factory.createIdentifier("ok")
            ),
            ts.factory.createBlock(
                [
                    ts.factory.createReturnStatement(
                        ts.factory.createObjectLiteralExpression(
                            [
                                ts.factory.createPropertyAssignment(
                                    ts.factory.createIdentifier("data"),
                                    this.getReturnValueForOkResponse(context) ??
                                        ts.factory.createIdentifier("undefined")
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
                ],
                true
            )
        );
    }

    private getOkResponseBody(context: SdkContext): ts.Expression {
        const generatedEndpointTypeSchemas = this.getGeneratedEndpointTypeSchemas(context);
        return generatedEndpointTypeSchemas.deserializeResponse(
            ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier(GeneratedNonThrowingEndpointResponse.RESPONSE_VARIABLE_NAME),
                context.coreUtilities.fetcher.APIResponse.SuccessfulResponse.body
            ),
            context
        );
    }

    private getReferenceToError(context: SdkContext): ts.Expression {
        return ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier(GeneratedNonThrowingEndpointResponse.RESPONSE_VARIABLE_NAME),
            context.coreUtilities.fetcher.APIResponse.FailedResponse.error
        );
    }

    private getReferenceToErrorBody(context: SdkContext): ts.Expression {
        return ts.factory.createPropertyAccessExpression(
            this.getReferenceToError(context),
            context.coreUtilities.fetcher.Fetcher.FailedStatusCodeError.body
        );
    }

    private getReturnFailedResponse(context: SdkContext): ts.Statement[] {
        return [...this.getReturnResponseForKnownErrors(context), this.getReturnResponseForUnknownError(context)];
    }

    private getReturnValueForOkResponse(context: SdkContext): ts.Expression | undefined {
        return context.coreUtilities.fetcher.APIResponse.SuccessfulResponse._build(
            this.endpoint.response?.body != null
                ? this.getOkResponseBody(context)
                : ts.factory.createIdentifier("undefined"),
            ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier(GeneratedNonThrowingEndpointResponse.RESPONSE_VARIABLE_NAME),
                context.coreUtilities.fetcher.APIResponse.SuccessfulResponse.headers
            ),
            ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier(GeneratedNonThrowingEndpointResponse.RESPONSE_VARIABLE_NAME),
                context.coreUtilities.fetcher.APIResponse.SuccessfulResponse.rawResponse
            )
        );
    }

    private getReturnResponseForKnownErrors(context: SdkContext): ts.Statement[] {
        if (this.endpoint.errors.length === 0) {
            return [];
        }

        const referenceToError = this.getReferenceToError(context);

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
                ts.factory.createBlock([this.getSwitchStatementForErrors(context)], true)
            )
        ];
    }

    private getSwitchStatementForErrors(context: SdkContext) {
        return ErrorDiscriminationStrategy._visit(this.errorDiscriminationStrategy, {
            property: (propertyErrorDiscriminationStrategy) =>
                this.getSwitchStatementForPropertyDiscriminatedErrors({
                    context,
                    propertyErrorDiscriminationStrategy
                }),
            statusCode: () => this.getSwitchStatementForStatusCodeDiscriminatedErrors(context),
            _other: () => {
                throw new Error("Unknown ErrorDiscriminationStrategy: " + this.errorDiscriminationStrategy.type);
            }
        });
    }

    private getSwitchStatementForPropertyDiscriminatedErrors({
        context,
        propertyErrorDiscriminationStrategy
    }: {
        context: SdkContext;
        propertyErrorDiscriminationStrategy: ErrorDiscriminationByPropertyStrategy;
    }) {
        if (this.endpoint.errors.length === 0) {
            throw new Error("Cannot generate switch because there are no errors defined");
        }

        const generatedEndpointTypeSchemas = this.getGeneratedEndpointTypeSchemas(context);
        const referenceToErrorBody = this.getReferenceToErrorBody(context);
        const errorBodyType = this.includeSerdeLayer
            ? generatedEndpointTypeSchemas.getReferenceToRawError(context)
            : context.endpointErrorUnion
                  .getGeneratedEndpointErrorUnion(this.packageId, this.endpoint.name)
                  .getErrorUnion()
                  .getReferenceTo(context);

        return ts.factory.createSwitchStatement(
            ts.factory.createPropertyAccessChain(
                ts.factory.createAsExpression(referenceToErrorBody, errorBodyType),
                ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                propertyErrorDiscriminationStrategy.discriminant.wireValue
            ),
            ts.factory.createCaseBlock([
                ...this.endpoint.errors.map((error, index) =>
                    ts.factory.createCaseClause(
                        ts.factory.createStringLiteral(
                            context.sdkError.getErrorDeclaration(error.error).discriminantValue.wireValue
                        ),
                        index < this.endpoint.errors.length - 1
                            ? []
                            : [
                                  ts.factory.createReturnStatement(
                                      ts.factory.createObjectLiteralExpression(
                                          [
                                              ts.factory.createPropertyAssignment(
                                                  ts.factory.createIdentifier("data"),
                                                  context.coreUtilities.fetcher.APIResponse.FailedResponse._build(
                                                      generatedEndpointTypeSchemas.deserializeError(
                                                          ts.factory.createAsExpression(
                                                              referenceToErrorBody,
                                                              errorBodyType
                                                          ),
                                                          context
                                                      )
                                                  )
                                              ),
                                              ts.factory.createSpreadAssignment(
                                                  ts.factory.createParenthesizedExpression(
                                                      ts.factory.createConditionalExpression(
                                                          ts.factory.createBinaryExpression(
                                                              ts.factory.createStringLiteral("rawResponse"),
                                                              ts.factory.createToken(ts.SyntaxKind.InKeyword),
                                                              referenceToErrorBody
                                                          ),
                                                          ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                                                          ts.factory.createPropertyAccessExpression(
                                                              referenceToErrorBody,
                                                              ts.factory.createIdentifier("rawResponse")
                                                          ),
                                                          ts.factory.createToken(ts.SyntaxKind.ColonToken),
                                                          ts.factory.createIdentifier("undefined")
                                                      )
                                                  )
                                              )
                                          ],
                                          false
                                      )
                                  )
                              ]
                    )
                )
            ])
        );
    }

    private getGeneratedEndpointTypeSchemas(context: SdkContext): GeneratedSdkEndpointTypeSchemas {
        return context.sdkEndpointTypeSchemas.getGeneratedEndpointTypeSchemas(this.packageId, this.endpoint.name);
    }

    private getSwitchStatementForStatusCodeDiscriminatedErrors(context: SdkContext) {
        const referenceToError = this.getReferenceToError(context);
        return ts.factory.createSwitchStatement(
            ts.factory.createPropertyAccessExpression(
                this.getReferenceToError(context),
                context.coreUtilities.fetcher.Fetcher.FailedStatusCodeError.statusCode
            ),
            ts.factory.createCaseBlock(
                this.endpoint.errors.map((error) => {
                    const errorDeclaration = this.errorResolver.getErrorDeclarationFromName(error.error);
                    const generatedSdkErrorSchema = context.sdkErrorSchema.getGeneratedSdkErrorSchema(error.error);
                    return ts.factory.createCaseClause(ts.factory.createNumericLiteral(errorDeclaration.statusCode), [
                        ts.factory.createReturnStatement(
                            ts.factory.createObjectLiteralExpression(
                                [
                                    ts.factory.createPropertyAssignment(
                                        ts.factory.createIdentifier("data"),
                                        context.coreUtilities.fetcher.APIResponse.FailedResponse._build(
                                            context.endpointErrorUnion
                                                .getGeneratedEndpointErrorUnion(this.packageId, this.endpoint.name)
                                                .getErrorUnion()
                                                .buildWithBuilder({
                                                    discriminantValueToBuild: errorDeclaration.statusCode,
                                                    builderArgument:
                                                        generatedSdkErrorSchema != null
                                                            ? generatedSdkErrorSchema.deserializeBody(context, {
                                                                  referenceToBody: this.getReferenceToErrorBody(context)
                                                              })
                                                            : undefined,
                                                    context
                                                })
                                        )
                                    ),
                                    ts.factory.createSpreadAssignment(
                                        ts.factory.createParenthesizedExpression(
                                            ts.factory.createConditionalExpression(
                                                ts.factory.createBinaryExpression(
                                                    ts.factory.createStringLiteral("rawResponse"),
                                                    ts.factory.createToken(ts.SyntaxKind.InKeyword),
                                                    referenceToError
                                                ),
                                                ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                                                ts.factory.createPropertyAccessExpression(
                                                    referenceToError,
                                                    ts.factory.createIdentifier("rawResponse")
                                                ),
                                                ts.factory.createToken(ts.SyntaxKind.ColonToken),
                                                ts.factory.createIdentifier("undefined")
                                            )
                                        )
                                    )
                                ],
                                false
                            )
                        )
                    ]);
                })
            )
        );
    }

    private getReturnResponseForUnknownError(context: SdkContext): ts.Statement {
        const referenceToError = this.getReferenceToError(context);
        return ts.factory.createReturnStatement(
            ts.factory.createObjectLiteralExpression(
                [
                    ts.factory.createPropertyAssignment(
                        ts.factory.createIdentifier("data"),
                        context.coreUtilities.fetcher.APIResponse.FailedResponse._build(
                            this.getGeneratedEndpointErrorUnion(context)
                                .getErrorUnion()
                                .buildUnknown({
                                    existingValue: this.getReferenceToError(context),
                                    context
                                })
                        )
                    ),
                    ts.factory.createSpreadAssignment(
                        ts.factory.createParenthesizedExpression(
                            ts.factory.createConditionalExpression(
                                ts.factory.createBinaryExpression(
                                    ts.factory.createStringLiteral("rawResponse"),
                                    ts.factory.createToken(ts.SyntaxKind.InKeyword),
                                    referenceToError
                                ),
                                ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                                ts.factory.createPropertyAccessExpression(
                                    referenceToError,
                                    ts.factory.createIdentifier("rawResponse")
                                ),
                                ts.factory.createToken(ts.SyntaxKind.ColonToken),
                                ts.factory.createIdentifier("undefined")
                            )
                        )
                    )
                ],
                false
            )
        );
    }

    private getGeneratedEndpointErrorUnion(context: SdkContext): GeneratedEndpointErrorUnion {
        return context.endpointErrorUnion.getGeneratedEndpointErrorUnion(this.packageId, this.endpoint.name);
    }
}
