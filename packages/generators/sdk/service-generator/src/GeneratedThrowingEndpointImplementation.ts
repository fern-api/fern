import { ResponseError } from "@fern-fern/ir-model/http";
import { ErrorDiscriminationByPropertyStrategy, ErrorDiscriminationStrategy } from "@fern-fern/ir-model/ir";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { ServiceContext } from "@fern-typescript/contexts";
import { ErrorResolver } from "@fern-typescript/resolvers";
import { ts } from "ts-morph";
import { AbstractGeneratedEndpointImplementation } from "./AbstractGeneratedEndpointImplementation";

export declare namespace GeneratedThrowingEndpointImplementation {
    export interface Init extends AbstractGeneratedEndpointImplementation.Init {
        errorResolver: ErrorResolver;
        errorDiscriminationStrategy: ErrorDiscriminationStrategy;
    }
}

export class GeneratedThrowingEndpointImplementation extends AbstractGeneratedEndpointImplementation {
    private errorResolver: ErrorResolver;
    private errorDiscriminationStrategy: ErrorDiscriminationStrategy;

    constructor({
        errorResolver,
        errorDiscriminationStrategy,
        ...superInit
    }: GeneratedThrowingEndpointImplementation.Init) {
        super(superInit);
        this.errorResolver = errorResolver;
        this.errorDiscriminationStrategy = errorDiscriminationStrategy;
    }

    protected getAdditionalDocLines(context: ServiceContext): string[] {
        return this.endpoint.errors.map((error) => {
            const referenceToError = context.error
                .getReferenceToError(error.error)
                .getExpression({ isForComment: true });
            return `@throws {${getTextOfTsNode(referenceToError)}}`;
        });
    }

    protected getResponseType(context: ServiceContext): ts.TypeNode {
        return this.endpoint.response.type != null
            ? context.type.getReferenceToType(this.endpoint.response.type).typeNode
            : ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword);
    }

    protected getReturnFailedResponse(context: ServiceContext): ts.Statement[] {
        return [...this.getThrowsForStatusCodeErrors(context), ...this.getThrowsForNonStatusCodeErrors(context)];
    }

    private getThrowsForStatusCodeErrors(context: ServiceContext): ts.Statement[] {
        const referenceToError = this.getReferenceToError(context);
        const referenceToErrorBody = this.getReferenceToErrorBody(context);

        const defaultThrow = ts.factory.createThrowStatement(
            context.genericAPIError.getGeneratedGenericAPIError().build(context, {
                message: undefined,
                statusCode: ts.factory.createPropertyAccessExpression(
                    referenceToError,
                    context.base.coreUtilities.fetcher.Fetcher.FailedStatusCodeError.statusCode
                ),
                responseBody: ts.factory.createPropertyAccessExpression(
                    referenceToError,
                    context.base.coreUtilities.fetcher.Fetcher.FailedStatusCodeError.rawBody
                ),
            })
        );

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
                ts.factory.createBlock(
                    [
                        this.endpoint.errors.length > 0
                            ? this.getSwitchStatementForErrors({
                                  context,
                                  generateCaseBody: (error) => {
                                      const generatedError = context.error.getGeneratedError(error.error);
                                      if (generatedError?.type !== "class") {
                                          throw new Error("Cannot throw error because it's not a class");
                                      }
                                      const generatedErrorSchema = context.errorSchema.getGeneratedErrorSchema(
                                          error.error
                                      );
                                      return [
                                          ts.factory.createThrowStatement(
                                              generatedError.build(context, {
                                                  referenceToBody:
                                                      generatedErrorSchema != null
                                                          ? context.base.coreUtilities.zurg.Schema._fromExpression(
                                                                context.errorSchema
                                                                    .getReferenceToErrorSchema(error.error)
                                                                    .getExpression()
                                                            ).parse(
                                                                ts.factory.createAsExpression(
                                                                    referenceToErrorBody,
                                                                    generatedErrorSchema.getReferenceToRawShape(context)
                                                                )
                                                            )
                                                          : undefined,
                                              })
                                          ),
                                      ];
                                  },
                                  defaultBody: [defaultThrow],
                              })
                            : defaultThrow,
                    ],
                    true
                )
            ),
        ];
    }

    private getSwitchStatementForErrors({
        context,
        generateCaseBody,
        defaultBody,
    }: {
        context: ServiceContext;
        generateCaseBody: (responseError: ResponseError) => ts.Statement[];
        defaultBody: ts.Statement[];
    }) {
        return ErrorDiscriminationStrategy._visit(this.errorDiscriminationStrategy, {
            property: (propertyErrorDiscriminationStrategy) =>
                this.getSwitchStatementForPropertyDiscriminatedErrors({
                    context,
                    propertyErrorDiscriminationStrategy,
                    generateCaseBody,
                    defaultBody,
                }),
            statusCode: () =>
                this.getSwitchStatementForStatusCodeDiscriminatedErrors({
                    context,
                    generateCaseBody,
                    defaultBody,
                }),
            _unknown: () => {
                throw new Error("Unknown ErrorDiscriminationStrategy: " + this.errorDiscriminationStrategy.type);
            },
        });
    }

    private getSwitchStatementForPropertyDiscriminatedErrors({
        context,
        propertyErrorDiscriminationStrategy,
        generateCaseBody,
        defaultBody,
    }: {
        context: ServiceContext;
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
                            context.error.getErrorDeclaration(error.error).discriminantValue.wireValue
                        ),
                        generateCaseBody(error)
                    )
                ),
                ts.factory.createDefaultClause(defaultBody),
            ])
        );
    }

    private getSwitchStatementForStatusCodeDiscriminatedErrors({
        context,
        generateCaseBody,
        defaultBody,
    }: {
        context: ServiceContext;
        generateCaseBody: (responseError: ResponseError) => ts.Statement[];
        defaultBody: ts.Statement[];
    }) {
        return ts.factory.createSwitchStatement(
            ts.factory.createPropertyAccessExpression(
                this.getReferenceToError(context),
                context.base.coreUtilities.fetcher.Fetcher.FailedStatusCodeError.statusCode
            ),
            ts.factory.createCaseBlock([
                ...this.endpoint.errors.map((error) => {
                    const errorDeclaration = this.errorResolver.getErrorDeclarationFromName(error.error);
                    return ts.factory.createCaseClause(
                        ts.factory.createNumericLiteral(errorDeclaration.statusCode),
                        generateCaseBody(error)
                    );
                }),
                ts.factory.createDefaultClause(defaultBody),
            ])
        );
    }

    private getThrowsForNonStatusCodeErrors(context: ServiceContext): ts.Statement[] {
        const referenceToError = this.getReferenceToError(context);
        return [
            ts.factory.createSwitchStatement(
                ts.factory.createPropertyAccessExpression(
                    referenceToError,
                    context.base.coreUtilities.fetcher.Fetcher.Error.reason
                ),
                ts.factory.createCaseBlock([
                    ts.factory.createCaseClause(
                        ts.factory.createStringLiteral(
                            context.base.coreUtilities.fetcher.Fetcher.NonJsonError._reasonLiteralValue
                        ),
                        [
                            ts.factory.createThrowStatement(
                                context.genericAPIError.getGeneratedGenericAPIError().build(context, {
                                    message: undefined,
                                    statusCode: ts.factory.createPropertyAccessExpression(
                                        referenceToError,
                                        context.base.coreUtilities.fetcher.Fetcher.NonJsonError.statusCode
                                    ),
                                    responseBody: ts.factory.createPropertyAccessExpression(
                                        referenceToError,
                                        context.base.coreUtilities.fetcher.Fetcher.NonJsonError.rawBody
                                    ),
                                })
                            ),
                        ]
                    ),
                    ts.factory.createCaseClause(
                        ts.factory.createStringLiteral(
                            context.base.coreUtilities.fetcher.Fetcher.TimeoutError._reasonLiteralValue
                        ),
                        [
                            ts.factory.createThrowStatement(
                                context.timeoutError.getGeneratedTimeoutError().build(context)
                            ),
                        ]
                    ),
                    ts.factory.createCaseClause(
                        ts.factory.createStringLiteral(
                            context.base.coreUtilities.fetcher.Fetcher.UnknownError._reasonLiteralValue
                        ),
                        [
                            ts.factory.createThrowStatement(
                                context.genericAPIError.getGeneratedGenericAPIError().build(context, {
                                    message: ts.factory.createPropertyAccessExpression(
                                        referenceToError,
                                        context.base.coreUtilities.fetcher.Fetcher.UnknownError.message
                                    ),
                                    statusCode: undefined,
                                    responseBody: undefined,
                                })
                            ),
                        ]
                    ),
                ])
            ),
        ];
    }

    protected getReturnValueForOkResponse(context: ServiceContext): ts.Expression | undefined {
        return this.endpoint.response.type != null ? this.getOkResponseBody(context) : undefined;
    }
}
