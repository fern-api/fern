import { HttpEndpoint } from "@fern-fern/ir-model/http";
import { ErrorDiscriminationByPropertyStrategy, ErrorDiscriminationStrategy } from "@fern-fern/ir-model/ir";
import { PackageId } from "@fern-typescript/commons";
import {
    GeneratedEndpointErrorUnion,
    GeneratedSdkEndpointTypeSchemas,
    SdkClientClassContext,
} from "@fern-typescript/contexts";
import { ErrorResolver } from "@fern-typescript/resolvers";
import { ts } from "ts-morph";
import { GeneratedEndpointResponse } from "./GeneratedEndpointResponse";

export declare namespace GeneratedNonThrowingEndpointResponse {
    export interface Init {
        packageId: PackageId;
        endpoint: HttpEndpoint;
        errorDiscriminationStrategy: ErrorDiscriminationStrategy;
        errorResolver: ErrorResolver;
    }
}

export class GeneratedNonThrowingEndpointResponse implements GeneratedEndpointResponse {
    private static RESPONSE_VARIABLE_NAME = "_response";

    private packageId: PackageId;
    private endpoint: HttpEndpoint;
    private errorDiscriminationStrategy: ErrorDiscriminationStrategy;
    private errorResolver: ErrorResolver;

    constructor({
        packageId,
        endpoint,
        errorDiscriminationStrategy,
        errorResolver,
    }: GeneratedNonThrowingEndpointResponse.Init) {
        this.packageId = packageId;
        this.endpoint = endpoint;
        this.errorDiscriminationStrategy = errorDiscriminationStrategy;
        this.errorResolver = errorResolver;
    }

    public getResponseVariableName(): string {
        return GeneratedNonThrowingEndpointResponse.RESPONSE_VARIABLE_NAME;
    }

    public getNamesOfThrownExceptions(): string[] {
        return [];
    }

    public getReturnType(context: SdkClientClassContext): ts.TypeNode {
        return context.base.coreUtilities.fetcher.APIResponse._getReferenceToType(
            this.endpoint.response != null
                ? context.type.getReferenceToType(this.endpoint.response.responseBodyType).typeNode
                : ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword),
            context.endpointErrorUnion
                .getGeneratedEndpointErrorUnion(this.packageId, this.endpoint.name)
                .getErrorUnion()
                .getReferenceTo(context)
        );
    }

    public getReturnResponseStatements(context: SdkClientClassContext): ts.Statement[] {
        return [this.getReturnResponseIfOk(context), ...this.getReturnFailedResponse(context)];
    }

    private getReturnResponseIfOk(context: SdkClientClassContext): ts.Statement {
        return ts.factory.createIfStatement(
            ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier(GeneratedNonThrowingEndpointResponse.RESPONSE_VARIABLE_NAME),
                ts.factory.createIdentifier("ok")
            ),
            ts.factory.createBlock([ts.factory.createReturnStatement(this.getReturnValueForOkResponse(context))], true)
        );
    }

    private getOkResponseBody(context: SdkClientClassContext): ts.Expression {
        const generatedEndpointTypeSchemas = this.getGeneratedEndpointTypeSchemas(context);
        return generatedEndpointTypeSchemas.deserializeResponse(
            ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier(GeneratedNonThrowingEndpointResponse.RESPONSE_VARIABLE_NAME),
                context.base.coreUtilities.fetcher.APIResponse.SuccessfulResponse.body
            ),
            context
        );
    }

    private getReferenceToError(context: SdkClientClassContext): ts.Expression {
        return ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier(GeneratedNonThrowingEndpointResponse.RESPONSE_VARIABLE_NAME),
            context.base.coreUtilities.fetcher.APIResponse.FailedResponse.error
        );
    }

    private getReferenceToErrorBody(context: SdkClientClassContext): ts.Expression {
        return ts.factory.createPropertyAccessExpression(
            this.getReferenceToError(context),
            context.base.coreUtilities.fetcher.Fetcher.FailedStatusCodeError.body
        );
    }

    private getReturnFailedResponse(context: SdkClientClassContext): ts.Statement[] {
        return [...this.getReturnResponseForKnownErrors(context), this.getReturnResponseForUnknownError(context)];
    }

    private getReturnValueForOkResponse(context: SdkClientClassContext): ts.Expression | undefined {
        return context.base.coreUtilities.fetcher.APIResponse.SuccessfulResponse._build(
            this.endpoint.response != null ? this.getOkResponseBody(context) : ts.factory.createIdentifier("undefined")
        );
    }

    private getReturnResponseForKnownErrors(context: SdkClientClassContext): ts.Statement[] {
        if (this.endpoint.errors.length === 0) {
            return [];
        }

        const referenceToError = this.getReferenceToError(context);

        return [
            ts.factory.createIfStatement(
                ts.factory.createBinaryExpression(
                    ts.factory.createPropertyAccessExpression(
                        referenceToError,
                        context.base.coreUtilities.fetcher.Fetcher.Error.reason
                    ),
                    ts.factory.createToken(ts.SyntaxKind.EqualsEqualsEqualsToken),
                    ts.factory.createStringLiteral(
                        context.base.coreUtilities.fetcher.Fetcher.FailedStatusCodeError._reasonLiteralValue
                    )
                ),
                ts.factory.createBlock([this.getSwitchStatementForErrors(context)], true)
            ),
        ];
    }

    private getSwitchStatementForErrors(context: SdkClientClassContext) {
        return ErrorDiscriminationStrategy._visit(this.errorDiscriminationStrategy, {
            property: (propertyErrorDiscriminationStrategy) =>
                this.getSwitchStatementForPropertyDiscriminatedErrors({
                    context,
                    propertyErrorDiscriminationStrategy,
                }),
            statusCode: () => this.getSwitchStatementForStatusCodeDiscriminatedErrors(context),
            _unknown: () => {
                throw new Error("Unknown ErrorDiscriminationStrategy: " + this.errorDiscriminationStrategy.type);
            },
        });
    }

    private getSwitchStatementForPropertyDiscriminatedErrors({
        context,
        propertyErrorDiscriminationStrategy,
    }: {
        context: SdkClientClassContext;
        propertyErrorDiscriminationStrategy: ErrorDiscriminationByPropertyStrategy;
    }) {
        if (this.endpoint.errors.length === 0) {
            throw new Error("Cannot generate switch because there are no errors defined");
        }

        const generatedEndpointTypeSchemas = this.getGeneratedEndpointTypeSchemas(context);
        const referenceToErrorBody = this.getReferenceToErrorBody(context);

        return ts.factory.createSwitchStatement(
            ts.factory.createPropertyAccessChain(
                ts.factory.createAsExpression(
                    referenceToErrorBody,
                    generatedEndpointTypeSchemas.getReferenceToRawError(context)
                ),
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
                                      context.base.coreUtilities.fetcher.APIResponse.FailedResponse._build(
                                          generatedEndpointTypeSchemas.deserializeError(
                                              ts.factory.createAsExpression(
                                                  referenceToErrorBody,
                                                  generatedEndpointTypeSchemas.getReferenceToRawError(context)
                                              ),
                                              context
                                          )
                                      )
                                  ),
                              ]
                    )
                ),
            ])
        );
    }

    private getGeneratedEndpointTypeSchemas(context: SdkClientClassContext): GeneratedSdkEndpointTypeSchemas {
        return context.sdkEndpointTypeSchemas.getGeneratedEndpointTypeSchemas(this.packageId, this.endpoint.name);
    }

    private getSwitchStatementForStatusCodeDiscriminatedErrors(context: SdkClientClassContext) {
        return ts.factory.createSwitchStatement(
            ts.factory.createPropertyAccessExpression(
                this.getReferenceToError(context),
                context.base.coreUtilities.fetcher.Fetcher.FailedStatusCodeError.statusCode
            ),
            ts.factory.createCaseBlock(
                this.endpoint.errors.map((error) => {
                    const errorDeclaration = this.errorResolver.getErrorDeclarationFromName(error.error);
                    const generatedSdkErrorSchema = context.sdkErrorSchema.getGeneratedSdkErrorSchema(error.error);
                    return ts.factory.createCaseClause(ts.factory.createNumericLiteral(errorDeclaration.statusCode), [
                        ts.factory.createReturnStatement(
                            context.base.coreUtilities.fetcher.APIResponse.FailedResponse._build(
                                context.endpointErrorUnion
                                    .getGeneratedEndpointErrorUnion(this.packageId, this.endpoint.name)
                                    .getErrorUnion()
                                    .buildWithBuilder({
                                        discriminantValueToBuild: errorDeclaration.statusCode,
                                        builderArgument:
                                            generatedSdkErrorSchema != null
                                                ? generatedSdkErrorSchema.deserializeBody(context, {
                                                      referenceToBody: this.getReferenceToErrorBody(context),
                                                  })
                                                : undefined,
                                        context,
                                    })
                            )
                        ),
                    ]);
                })
            )
        );
    }

    private getReturnResponseForUnknownError(context: SdkClientClassContext): ts.Statement {
        return ts.factory.createReturnStatement(
            context.base.coreUtilities.fetcher.APIResponse.FailedResponse._build(
                this.getGeneratedEndpointErrorUnion(context)
                    .getErrorUnion()
                    .buildUnknown({
                        existingValue: this.getReferenceToError(context),
                        context,
                    })
            )
        );
    }

    private getGeneratedEndpointErrorUnion(context: SdkClientClassContext): GeneratedEndpointErrorUnion {
        return context.endpointErrorUnion.getGeneratedEndpointErrorUnion(this.packageId, this.endpoint.name);
    }
}
