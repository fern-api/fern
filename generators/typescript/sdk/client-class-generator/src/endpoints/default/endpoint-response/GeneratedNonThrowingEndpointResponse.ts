import { getWireValue } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { PackageId } from "@fern-typescript/commons";
import { FileContext, GeneratedEndpointErrorUnion, GeneratedSdkEndpointTypeSchemas } from "@fern-typescript/contexts";
import { ErrorResolver } from "@fern-typescript/resolvers";
import { ts } from "ts-morph";

import { GeneratedEndpointResponse, PaginationResponseInfo } from "./GeneratedEndpointResponse.js";
import { getSuccessReturnType } from "./getSuccessReturnType.js";

export declare namespace GeneratedNonThrowingEndpointResponse {
    export interface Init {
        packageId: PackageId;
        endpoint: FernIr.HttpEndpoint;
        response:
            | FernIr.HttpResponseBody.Json
            | FernIr.HttpResponseBody.FileDownload
            | FernIr.HttpResponseBody.Streaming
            | FernIr.HttpResponseBody.Text
            | FernIr.HttpResponseBody.Bytes
            | undefined;
        errorDiscriminationStrategy: FernIr.ErrorDiscriminationStrategy;
        errorResolver: ErrorResolver;
        includeSerdeLayer: boolean;
        streamType: "wrapper" | "web";
        fileResponseType: "stream" | "binary-response";
    }
}

export class GeneratedNonThrowingEndpointResponse implements GeneratedEndpointResponse {
    private static RESPONSE_VARIABLE_NAME = "_response";

    private packageId: PackageId;
    private endpoint: FernIr.HttpEndpoint;
    private response:
        | FernIr.HttpResponseBody.Json
        | FernIr.HttpResponseBody.FileDownload
        | FernIr.HttpResponseBody.Streaming
        | FernIr.HttpResponseBody.Text
        | FernIr.HttpResponseBody.Bytes
        | undefined;
    private errorDiscriminationStrategy: FernIr.ErrorDiscriminationStrategy;
    private errorResolver: ErrorResolver;
    private includeSerdeLayer: boolean;
    private streamType: "wrapper" | "web";
    private readonly fileResponseType: "stream" | "binary-response";

    constructor({
        packageId,
        endpoint,
        response,
        errorDiscriminationStrategy,
        errorResolver,
        includeSerdeLayer,
        streamType,
        fileResponseType
    }: GeneratedNonThrowingEndpointResponse.Init) {
        this.packageId = packageId;
        this.endpoint = endpoint;
        this.response = response;
        this.errorDiscriminationStrategy = errorDiscriminationStrategy;
        this.errorResolver = errorResolver;
        this.includeSerdeLayer = includeSerdeLayer;
        this.streamType = streamType;
        this.fileResponseType = fileResponseType;
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

    public getReturnType(context: FileContext): ts.TypeNode {
        return context.coreUtilities.fetcher.APIResponse._getReferenceToType(
            getSuccessReturnType(this.endpoint, this.response, context, {
                includeContentHeadersOnResponse: false,
                streamType: this.streamType,
                fileResponseType: this.fileResponseType
            }),
            context.endpointErrorUnion
                .getGeneratedEndpointErrorUnion(this.packageId, this.endpoint.name)
                .getErrorUnion()
                .getReferenceTo(context)
        );
    }

    public getReturnResponseStatements(context: FileContext): ts.Statement[] {
        return [this.getReturnResponseIfOk(context), ...this.getReturnFailedResponse(context)];
    }

    private getReturnResponseIfOk(context: FileContext): ts.Statement {
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
                                ts.factory.createPropertyAssignment(
                                    ts.factory.createIdentifier("rawResponse"),
                                    ts.factory.createPropertyAccessExpression(
                                        ts.factory.createIdentifier(
                                            GeneratedNonThrowingEndpointResponse.RESPONSE_VARIABLE_NAME
                                        ),
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

    private getOkResponseBody(context: FileContext): ts.Expression {
        const generatedEndpointTypeSchemas = this.getGeneratedEndpointTypeSchemas(context);
        return generatedEndpointTypeSchemas.deserializeResponse(
            ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier(GeneratedNonThrowingEndpointResponse.RESPONSE_VARIABLE_NAME),
                context.coreUtilities.fetcher.APIResponse.SuccessfulResponse.body
            ),
            context
        );
    }

    private getReferenceToError(context: FileContext): ts.Expression {
        return ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier(GeneratedNonThrowingEndpointResponse.RESPONSE_VARIABLE_NAME),
            context.coreUtilities.fetcher.APIResponse.FailedResponse.error
        );
    }

    private getReferenceToErrorBody(context: FileContext): ts.Expression {
        return ts.factory.createPropertyAccessExpression(
            this.getReferenceToError(context),
            context.coreUtilities.fetcher.Fetcher.FailedStatusCodeError.body
        );
    }

    private getReturnFailedResponse(context: FileContext): ts.Statement[] {
        return [...this.getReturnResponseForKnownErrors(context), this.getReturnResponseForUnknownError(context)];
    }

    private getReturnValueForOkResponse(context: FileContext): ts.Expression | undefined {
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

    private getReturnResponseForKnownErrors(context: FileContext): ts.Statement[] {
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

    private getSwitchStatementForErrors(context: FileContext) {
        return FernIr.ErrorDiscriminationStrategy._visit(this.errorDiscriminationStrategy, {
            property: (propertyErrorDiscriminationStrategy) =>
                this.getSwitchStatementForPropertyDiscriminatedErrors({
                    context,
                    propertyErrorDiscriminationStrategy
                }),
            statusCode: () => this.getSwitchStatementForStatusCodeDiscriminatedErrors(context),
            _other: () => {
                throw new Error("Unknown FernIr.ErrorDiscriminationStrategy: " + this.errorDiscriminationStrategy.type);
            }
        });
    }

    private getSwitchStatementForPropertyDiscriminatedErrors({
        context,
        propertyErrorDiscriminationStrategy
    }: {
        context: FileContext;
        propertyErrorDiscriminationStrategy: FernIr.ErrorDiscriminationByPropertyStrategy;
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
        const rawResponseAccessor = ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier(GeneratedNonThrowingEndpointResponse.RESPONSE_VARIABLE_NAME),
            context.coreUtilities.fetcher.APIResponse.FailedResponse.rawResponse
        );

        return ts.factory.createSwitchStatement(
            ts.factory.createPropertyAccessChain(
                ts.factory.createAsExpression(referenceToErrorBody, errorBodyType),
                ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                getWireValue(propertyErrorDiscriminationStrategy.discriminant)
            ),
            ts.factory.createCaseBlock([
                ...this.endpoint.errors.map((error, index) =>
                    ts.factory.createCaseClause(
                        ts.factory.createStringLiteral(
                            getWireValue(context.sdkError.getErrorDeclaration(error.error).discriminantValue)
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
                                                      ),
                                                      rawResponseAccessor
                                                  )
                                              ),
                                              ts.factory.createPropertyAssignment(
                                                  ts.factory.createIdentifier("rawResponse"),
                                                  rawResponseAccessor
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

    private getGeneratedEndpointTypeSchemas(context: FileContext): GeneratedSdkEndpointTypeSchemas {
        return context.sdkEndpointTypeSchemas.getGeneratedEndpointTypeSchemas(this.packageId, this.endpoint.name);
    }

    private getSwitchStatementForStatusCodeDiscriminatedErrors(context: FileContext) {
        const rawResponseAccessor = ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier(GeneratedNonThrowingEndpointResponse.RESPONSE_VARIABLE_NAME),
            context.coreUtilities.fetcher.APIResponse.FailedResponse.rawResponse
        );
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
                                                }),
                                            rawResponseAccessor
                                        )
                                    ),
                                    ts.factory.createPropertyAssignment(
                                        ts.factory.createIdentifier("rawResponse"),
                                        rawResponseAccessor
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

    private getReturnResponseForUnknownError(context: FileContext): ts.Statement {
        const referenceToError = this.getReferenceToError(context);
        const rawResponseAccessor = ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier(GeneratedNonThrowingEndpointResponse.RESPONSE_VARIABLE_NAME),
            context.coreUtilities.fetcher.APIResponse.FailedResponse.rawResponse
        );
        return ts.factory.createReturnStatement(
            ts.factory.createObjectLiteralExpression(
                [
                    ts.factory.createPropertyAssignment(
                        ts.factory.createIdentifier("data"),
                        context.coreUtilities.fetcher.APIResponse.FailedResponse._build(
                            this.getGeneratedEndpointErrorUnion(context).getErrorUnion().buildUnknown({
                                existingValue: referenceToError,
                                context
                            }),
                            rawResponseAccessor
                        )
                    ),
                    ts.factory.createPropertyAssignment(ts.factory.createIdentifier("rawResponse"), rawResponseAccessor)
                ],
                false
            )
        );
    }

    private getGeneratedEndpointErrorUnion(context: FileContext): GeneratedEndpointErrorUnion {
        return context.endpointErrorUnion.getGeneratedEndpointErrorUnion(this.packageId, this.endpoint.name);
    }
}
