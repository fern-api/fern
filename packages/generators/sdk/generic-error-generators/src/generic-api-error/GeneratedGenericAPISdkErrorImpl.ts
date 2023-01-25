import { AbstractErrorClassGenerator } from "@fern-typescript/abstract-error-class-generator";
import { getTextOfTsKeyword, getTextOfTsNode } from "@fern-typescript/commons";
import { GeneratedGenericAPISdkError, GenericAPISdkErrorContext } from "@fern-typescript/contexts";
import { OptionalKind, ParameterDeclarationStructure, PropertyDeclarationStructure, ts } from "ts-morph";

export class GeneratedGenericAPISdkErrorImpl
    extends AbstractErrorClassGenerator<GenericAPISdkErrorContext>
    implements GeneratedGenericAPISdkError
{
    private static STATUS_CODE_PROPERTY_NAME = "statusCode";
    private static RESPONSE_BODY_PROPERTY_NAME = "responseBody";

    private static MESSAGE_CONSTRUCTOR_PARAMETER_NAME = "message";
    private static STATUS_CODE_CONSTRUCTOR_PARAMETER_NAME = GeneratedGenericAPISdkErrorImpl.STATUS_CODE_PROPERTY_NAME;
    private static RESPONSE_BODY_CONSTRUCTOR_PARAMETER_NAME =
        GeneratedGenericAPISdkErrorImpl.RESPONSE_BODY_PROPERTY_NAME;

    public writeToFile(context: GenericAPISdkErrorContext): void {
        super.writeToSourceFile(context);
    }

    public build(
        context: GenericAPISdkErrorContext,
        {
            message,
            statusCode,
            responseBody,
        }: {
            message: ts.Expression | undefined;
            statusCode: ts.Expression | undefined;
            responseBody: ts.Expression | undefined;
        }
    ): ts.NewExpression {
        const properties: ts.ObjectLiteralElementLike[] = [];
        if (message != null) {
            properties.push(
                ts.factory.createPropertyAssignment(
                    GeneratedGenericAPISdkErrorImpl.MESSAGE_CONSTRUCTOR_PARAMETER_NAME,
                    message
                )
            );
        }
        if (statusCode != null) {
            properties.push(
                ts.factory.createPropertyAssignment(
                    GeneratedGenericAPISdkErrorImpl.STATUS_CODE_CONSTRUCTOR_PARAMETER_NAME,
                    statusCode
                )
            );
        }
        if (responseBody != null) {
            properties.push(
                ts.factory.createPropertyAssignment(
                    GeneratedGenericAPISdkErrorImpl.RESPONSE_BODY_CONSTRUCTOR_PARAMETER_NAME,
                    responseBody
                )
            );
        }

        return ts.factory.createNewExpression(
            context.genericAPISdkError.getReferenceToGenericAPISdkError().getExpression(),
            undefined,
            [ts.factory.createObjectLiteralExpression(properties, true)]
        );
    }

    protected getClassProperties(): OptionalKind<PropertyDeclarationStructure>[] {
        return [
            {
                name: GeneratedGenericAPISdkErrorImpl.STATUS_CODE_PROPERTY_NAME,
                isReadonly: true,
                hasQuestionToken: true,
                type: getTextOfTsKeyword(ts.SyntaxKind.NumberKeyword),
            },
            {
                name: GeneratedGenericAPISdkErrorImpl.RESPONSE_BODY_PROPERTY_NAME,
                isReadonly: true,
                hasQuestionToken: true,
                type: getTextOfTsKeyword(ts.SyntaxKind.UnknownKeyword),
            },
        ];
    }

    protected getConstructorParameters(): OptionalKind<ParameterDeclarationStructure>[] {
        return [
            {
                name: getTextOfTsNode(
                    ts.factory.createObjectBindingPattern([
                        ts.factory.createBindingElement(
                            undefined,
                            undefined,
                            ts.factory.createIdentifier(
                                GeneratedGenericAPISdkErrorImpl.MESSAGE_CONSTRUCTOR_PARAMETER_NAME
                            )
                        ),
                        ts.factory.createBindingElement(
                            undefined,
                            undefined,
                            ts.factory.createIdentifier(
                                GeneratedGenericAPISdkErrorImpl.STATUS_CODE_CONSTRUCTOR_PARAMETER_NAME
                            )
                        ),
                        ts.factory.createBindingElement(
                            undefined,
                            undefined,
                            ts.factory.createIdentifier(GeneratedGenericAPISdkErrorImpl.RESPONSE_BODY_PROPERTY_NAME)
                        ),
                    ])
                ),
                type: getTextOfTsNode(
                    ts.factory.createTypeLiteralNode([
                        ts.factory.createPropertySignature(
                            undefined,
                            ts.factory.createIdentifier(
                                GeneratedGenericAPISdkErrorImpl.MESSAGE_CONSTRUCTOR_PARAMETER_NAME
                            ),
                            ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                            ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
                        ),
                        ts.factory.createPropertySignature(
                            undefined,
                            ts.factory.createIdentifier(
                                GeneratedGenericAPISdkErrorImpl.STATUS_CODE_CONSTRUCTOR_PARAMETER_NAME
                            ),
                            ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                            ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword)
                        ),
                        ts.factory.createPropertySignature(
                            undefined,
                            ts.factory.createIdentifier(
                                GeneratedGenericAPISdkErrorImpl.RESPONSE_BODY_CONSTRUCTOR_PARAMETER_NAME
                            ),
                            ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                            ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
                        ),
                    ])
                ),
            },
        ];
    }

    protected getReferenceToErrorMesssageInsideConstructor(): ts.Expression {
        return ts.factory.createIdentifier(GeneratedGenericAPISdkErrorImpl.MESSAGE_CONSTRUCTOR_PARAMETER_NAME);
    }

    protected getConstructorStatements(): ts.Statement[] {
        return [
            ts.factory.createIfStatement(
                ts.factory.createBinaryExpression(
                    ts.factory.createIdentifier(GeneratedGenericAPISdkErrorImpl.STATUS_CODE_CONSTRUCTOR_PARAMETER_NAME),
                    ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
                    ts.factory.createNull()
                ),
                ts.factory.createBlock(
                    [
                        ts.factory.createExpressionStatement(
                            ts.factory.createBinaryExpression(
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createThis(),
                                    ts.factory.createIdentifier(
                                        GeneratedGenericAPISdkErrorImpl.STATUS_CODE_PROPERTY_NAME
                                    )
                                ),
                                ts.factory.createToken(ts.SyntaxKind.EqualsToken),
                                ts.factory.createIdentifier(
                                    GeneratedGenericAPISdkErrorImpl.STATUS_CODE_CONSTRUCTOR_PARAMETER_NAME
                                )
                            )
                        ),
                    ],
                    true
                )
            ),
            ts.factory.createIfStatement(
                ts.factory.createBinaryExpression(
                    ts.factory.createIdentifier(
                        GeneratedGenericAPISdkErrorImpl.RESPONSE_BODY_CONSTRUCTOR_PARAMETER_NAME
                    ),
                    ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
                    ts.factory.createNull()
                ),
                ts.factory.createBlock(
                    [
                        ts.factory.createTryStatement(
                            ts.factory.createBlock(
                                [
                                    ts.factory.createExpressionStatement(
                                        ts.factory.createBinaryExpression(
                                            ts.factory.createPropertyAccessExpression(
                                                ts.factory.createThis(),
                                                ts.factory.createIdentifier(
                                                    GeneratedGenericAPISdkErrorImpl.RESPONSE_BODY_PROPERTY_NAME
                                                )
                                            ),
                                            ts.factory.createToken(ts.SyntaxKind.EqualsToken),
                                            ts.factory.createCallExpression(
                                                ts.factory.createPropertyAccessExpression(
                                                    ts.factory.createIdentifier("JSON"),
                                                    ts.factory.createIdentifier("parse")
                                                ),
                                                undefined,
                                                [
                                                    ts.factory.createIdentifier(
                                                        GeneratedGenericAPISdkErrorImpl.RESPONSE_BODY_CONSTRUCTOR_PARAMETER_NAME
                                                    ),
                                                ]
                                            )
                                        )
                                    ),
                                ],
                                true
                            ),
                            ts.factory.createCatchClause(
                                undefined,
                                ts.factory.createBlock(
                                    [
                                        ts.factory.createExpressionStatement(
                                            ts.factory.createBinaryExpression(
                                                ts.factory.createPropertyAccessExpression(
                                                    ts.factory.createThis(),
                                                    ts.factory.createIdentifier(
                                                        GeneratedGenericAPISdkErrorImpl.RESPONSE_BODY_PROPERTY_NAME
                                                    )
                                                ),
                                                ts.factory.createToken(ts.SyntaxKind.EqualsToken),
                                                ts.factory.createIdentifier(
                                                    GeneratedGenericAPISdkErrorImpl.RESPONSE_BODY_CONSTRUCTOR_PARAMETER_NAME
                                                )
                                            )
                                        ),
                                    ],
                                    false
                                )
                            ),
                            undefined
                        ),
                    ],
                    true
                )
            ),
        ];
    }
}
