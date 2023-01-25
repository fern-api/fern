import { ErrorDiscriminationByPropertyStrategy, ErrorDiscriminationStrategy } from "@fern-fern/ir-model/ir";
import { GeneratedEndpointTypes, SdkClientClassContext } from "@fern-typescript/contexts";
import { ErrorResolver } from "@fern-typescript/resolvers";
import { ts } from "ts-morph";
import { AbstractGeneratedEndpointImplementation } from "./AbstractGeneratedEndpointImplementation";

export declare namespace GeneratedNonThrowingEndpointImplementation {
    export interface Init extends AbstractGeneratedEndpointImplementation.Init {
        errorResolver: ErrorResolver;
        errorDiscriminationStrategy: ErrorDiscriminationStrategy;
    }
}

export class GeneratedNonThrowingEndpointImplementation extends AbstractGeneratedEndpointImplementation {
    private errorResolver: ErrorResolver;
    private errorDiscriminationStrategy: ErrorDiscriminationStrategy;

    constructor({
        errorResolver,
        errorDiscriminationStrategy,
        ...superInit
    }: GeneratedNonThrowingEndpointImplementation.Init) {
        super(superInit);
        this.errorResolver = errorResolver;
        this.errorDiscriminationStrategy = errorDiscriminationStrategy;
    }

    protected getAdditionalDocLines(): string[] {
        return [];
    }

    protected getReturnFailedResponse(context: SdkClientClassContext): ts.Statement[] {
        return [...this.getReturnResponseForKnownErrors(context), this.getReturnResponseForUnknownError(context)];
    }

    protected getReturnValueForOkResponse(context: SdkClientClassContext): ts.Expression | undefined {
        return context.base.coreUtilities.fetcher.APIResponse.SuccessfulResponse._build(
            this.endpoint.response.type != null
                ? this.getOkResponseBody(context)
                : ts.factory.createIdentifier("undefined")
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
        const allErrorsButLast = [...this.endpoint.errors];
        const lastError = allErrorsButLast.pop();

        if (lastError == null) {
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
                ...allErrorsButLast.map((error) =>
                    ts.factory.createCaseClause(
                        ts.factory.createStringLiteral(
                            context.error.getErrorDeclaration(error.error).discriminantValue.wireValue
                        ),
                        []
                    )
                ),
                ts.factory.createCaseClause(
                    ts.factory.createStringLiteral(
                        context.error.getErrorDeclaration(lastError.error).discriminantValue.wireValue
                    ),
                    [
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
                ),
            ])
        );
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
                    const GeneratedSdkErrorSchema = context.sdkErrorSchema.getGeneratedSdkErrorSchema(error.error);
                    return ts.factory.createCaseClause(ts.factory.createNumericLiteral(errorDeclaration.statusCode), [
                        ts.factory.createReturnStatement(
                            context.base.coreUtilities.fetcher.APIResponse.FailedResponse._build(
                                context.endpointTypes
                                    .getGeneratedEndpointTypes(this.service.name.fernFilepath, this.endpoint.name)
                                    .getErrorUnion()
                                    .build({
                                        discriminantValueToBuild: errorDeclaration.statusCode,
                                        builderArgument:
                                            GeneratedSdkErrorSchema != null
                                                ? context.base.coreUtilities.zurg.Schema._fromExpression(
                                                      context.sdkErrorSchema
                                                          .getReferenceToSdkErrorSchema(error.error)
                                                          .getExpression()
                                                  ).parse(
                                                      ts.factory.createAsExpression(
                                                          this.getReferenceToErrorBody(context),
                                                          GeneratedSdkErrorSchema.getReferenceToRawShape(context)
                                                      )
                                                  )
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
                this.getGeneratedEndpointTypes(context)
                    .getErrorUnion()
                    .buildUnknown({
                        existingValue: this.getReferenceToError(context),
                        context,
                    })
            )
        );
    }

    protected getResponseType(context: SdkClientClassContext): ts.TypeNode {
        return this.getGeneratedEndpointTypes(context).getReferenceToResponseType(context);
    }

    private getGeneratedEndpointTypes(context: SdkClientClassContext): GeneratedEndpointTypes {
        return context.endpointTypes.getGeneratedEndpointTypes(this.service.name.fernFilepath, this.endpoint.name);
    }
}
