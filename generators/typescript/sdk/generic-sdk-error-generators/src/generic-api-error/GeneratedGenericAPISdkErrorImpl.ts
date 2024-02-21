import { AbstractErrorClassGenerator } from "@fern-typescript/abstract-error-class-generator";
import { getTextOfTsKeyword, getTextOfTsNode } from "@fern-typescript/commons";
import { GeneratedGenericAPISdkError, SdkContext } from "@fern-typescript/contexts";
import { OptionalKind, ParameterDeclarationStructure, PropertyDeclarationStructure, ts } from "ts-morph";

export class GeneratedGenericAPISdkErrorImpl
    extends AbstractErrorClassGenerator<SdkContext>
    implements GeneratedGenericAPISdkError
{
    private static STATUS_CODE_PROPERTY_NAME = "statusCode";
    private static RESPONSE_BODY_PROPERTY_NAME = "body";

    private static MESSAGE_CONSTRUCTOR_PARAMETER_NAME = "message";
    private static STATUS_CODE_CONSTRUCTOR_PARAMETER_NAME = GeneratedGenericAPISdkErrorImpl.STATUS_CODE_PROPERTY_NAME;
    private static RESPONSE_BODY_CONSTRUCTOR_PARAMETER_NAME =
        GeneratedGenericAPISdkErrorImpl.RESPONSE_BODY_PROPERTY_NAME;

    private static BUILD_MESSAGE_FUNCTION_NAME = "buildMessage";

    public writeToFile(context: SdkContext): void {
        super.writeToSourceFile(context);
        this.writeBuildMessageFunctionToFile(context);
    }

    public build(
        context: SdkContext,
        {
            message,
            statusCode,
            responseBody
        }: {
            message: ts.Expression | undefined;
            statusCode: ts.Expression | undefined;
            responseBody: ts.Expression | undefined;
        }
    ): ts.NewExpression {
        return ts.factory.createNewExpression(
            context.genericAPISdkError.getReferenceToGenericAPISdkError().getExpression(),
            undefined,
            this.buildConstructorArguments({ message, statusCode, responseBody })
        );
    }

    public buildConstructorArguments({
        message,
        statusCode,
        responseBody
    }: {
        message: ts.Expression | undefined;
        statusCode: ts.Expression | undefined;
        responseBody: ts.Expression | undefined;
    }): ts.Expression[] {
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

        return [ts.factory.createObjectLiteralExpression(properties, true)];
    }

    protected getClassProperties(): OptionalKind<PropertyDeclarationStructure>[] {
        return [
            {
                name: GeneratedGenericAPISdkErrorImpl.STATUS_CODE_PROPERTY_NAME,
                isReadonly: true,
                hasQuestionToken: true,
                type: getTextOfTsKeyword(ts.SyntaxKind.NumberKeyword)
            },
            {
                name: GeneratedGenericAPISdkErrorImpl.RESPONSE_BODY_PROPERTY_NAME,
                isReadonly: true,
                hasQuestionToken: true,
                type: getTextOfTsKeyword(ts.SyntaxKind.UnknownKeyword)
            }
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
                        )
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
                            ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
                        )
                    ])
                )
            }
        ];
    }

    protected getSuperArguments(): ts.Expression[] {
        return [
            ts.factory.createCallExpression(
                ts.factory.createIdentifier(GeneratedGenericAPISdkErrorImpl.BUILD_MESSAGE_FUNCTION_NAME),
                undefined,
                [
                    ts.factory.createObjectLiteralExpression(
                        [
                            ts.factory.createShorthandPropertyAssignment(
                                GeneratedGenericAPISdkErrorImpl.MESSAGE_CONSTRUCTOR_PARAMETER_NAME,
                                undefined
                            ),
                            ts.factory.createShorthandPropertyAssignment(
                                GeneratedGenericAPISdkErrorImpl.STATUS_CODE_CONSTRUCTOR_PARAMETER_NAME,
                                undefined
                            ),
                            ts.factory.createShorthandPropertyAssignment(
                                GeneratedGenericAPISdkErrorImpl.RESPONSE_BODY_CONSTRUCTOR_PARAMETER_NAME,
                                undefined
                            )
                        ],
                        false
                    )
                ]
            )
        ];
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
                        )
                    ],
                    true
                )
            ),
            ts.factory.createIfStatement(
                ts.factory.createBinaryExpression(
                    ts.factory.createIdentifier(
                        GeneratedGenericAPISdkErrorImpl.RESPONSE_BODY_CONSTRUCTOR_PARAMETER_NAME
                    ),
                    ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken),
                    ts.factory.createIdentifier("undefined")
                ),
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
                        )
                    ],
                    true
                )
            )
        ];
    }

    protected addToClass(): void {
        // no-op
    }

    protected isAbstract(): boolean {
        return false;
    }

    private writeBuildMessageFunctionToFile(context: SdkContext): void {
        const LINES_VARIABLE_NAME = "lines";

        context.sourceFile.addFunction({
            name: GeneratedGenericAPISdkErrorImpl.BUILD_MESSAGE_FUNCTION_NAME,
            parameters: [
                {
                    name: getTextOfTsNode(
                        ts.factory.createObjectBindingPattern([
                            ts.factory.createBindingElement(
                                undefined,
                                undefined,
                                GeneratedGenericAPISdkErrorImpl.MESSAGE_CONSTRUCTOR_PARAMETER_NAME,
                                undefined
                            ),
                            ts.factory.createBindingElement(
                                undefined,
                                undefined,
                                GeneratedGenericAPISdkErrorImpl.STATUS_CODE_CONSTRUCTOR_PARAMETER_NAME,
                                undefined
                            ),
                            ts.factory.createBindingElement(
                                undefined,
                                undefined,
                                GeneratedGenericAPISdkErrorImpl.RESPONSE_BODY_CONSTRUCTOR_PARAMETER_NAME,
                                undefined
                            )
                        ])
                    ),
                    type: getTextOfTsNode(
                        ts.factory.createTypeLiteralNode([
                            ts.factory.createPropertySignature(
                                undefined,
                                GeneratedGenericAPISdkErrorImpl.MESSAGE_CONSTRUCTOR_PARAMETER_NAME,
                                undefined,
                                ts.factory.createUnionTypeNode([
                                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
                                ])
                            ),
                            ts.factory.createPropertySignature(
                                undefined,
                                GeneratedGenericAPISdkErrorImpl.STATUS_CODE_CONSTRUCTOR_PARAMETER_NAME,
                                undefined,
                                ts.factory.createUnionTypeNode([
                                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
                                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
                                ])
                            ),
                            ts.factory.createPropertySignature(
                                undefined,
                                GeneratedGenericAPISdkErrorImpl.RESPONSE_BODY_CONSTRUCTOR_PARAMETER_NAME,
                                undefined,
                                ts.factory.createUnionTypeNode([
                                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
                                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
                                ])
                            )
                        ])
                    )
                }
            ],
            returnType: "string",
            statements: [
                ts.factory.createVariableStatement(
                    undefined,
                    ts.factory.createVariableDeclarationList(
                        [
                            ts.factory.createVariableDeclaration(
                                LINES_VARIABLE_NAME,
                                undefined,
                                ts.factory.createArrayTypeNode(
                                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
                                ),
                                ts.factory.createArrayLiteralExpression([], false)
                            )
                        ],
                        ts.NodeFlags.Let
                    )
                ),
                ts.factory.createIfStatement(
                    ts.factory.createBinaryExpression(
                        ts.factory.createIdentifier(GeneratedGenericAPISdkErrorImpl.MESSAGE_CONSTRUCTOR_PARAMETER_NAME),
                        ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
                        ts.factory.createNull()
                    ),
                    ts.factory.createBlock(
                        [
                            ts.factory.createExpressionStatement(
                                ts.factory.createCallExpression(
                                    ts.factory.createPropertyAccessExpression(
                                        ts.factory.createIdentifier(LINES_VARIABLE_NAME),
                                        ts.factory.createIdentifier("push")
                                    ),
                                    undefined,
                                    [
                                        ts.factory.createIdentifier(
                                            GeneratedGenericAPISdkErrorImpl.MESSAGE_CONSTRUCTOR_PARAMETER_NAME
                                        )
                                    ]
                                )
                            )
                        ],
                        true
                    ),
                    undefined
                ),
                ts.factory.createIfStatement(
                    ts.factory.createBinaryExpression(
                        ts.factory.createIdentifier(GeneratedGenericAPISdkErrorImpl.STATUS_CODE_PROPERTY_NAME),
                        ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
                        ts.factory.createNull()
                    ),
                    ts.factory.createBlock(
                        [
                            ts.factory.createExpressionStatement(
                                ts.factory.createCallExpression(
                                    ts.factory.createPropertyAccessExpression(
                                        ts.factory.createIdentifier(LINES_VARIABLE_NAME),
                                        ts.factory.createIdentifier("push")
                                    ),
                                    undefined,
                                    [
                                        ts.factory.createTemplateExpression(
                                            ts.factory.createTemplateHead("Status code: "),
                                            [
                                                ts.factory.createTemplateSpan(
                                                    ts.factory.createCallExpression(
                                                        ts.factory.createPropertyAccessExpression(
                                                            ts.factory.createIdentifier(
                                                                GeneratedGenericAPISdkErrorImpl.STATUS_CODE_PROPERTY_NAME
                                                            ),
                                                            ts.factory.createIdentifier("toString")
                                                        ),
                                                        undefined,
                                                        []
                                                    ),
                                                    ts.factory.createTemplateTail("")
                                                )
                                            ]
                                        )
                                    ]
                                )
                            )
                        ],
                        true
                    ),
                    undefined
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
                            ts.factory.createExpressionStatement(
                                ts.factory.createCallExpression(
                                    ts.factory.createPropertyAccessExpression(
                                        ts.factory.createIdentifier(LINES_VARIABLE_NAME),
                                        ts.factory.createIdentifier("push")
                                    ),
                                    undefined,
                                    [
                                        ts.factory.createTemplateExpression(ts.factory.createTemplateHead("Body: "), [
                                            ts.factory.createTemplateSpan(
                                                ts.factory.createCallExpression(
                                                    ts.factory.createPropertyAccessExpression(
                                                        ts.factory.createIdentifier("JSON"),
                                                        ts.factory.createIdentifier("stringify")
                                                    ),
                                                    undefined,
                                                    [
                                                        ts.factory.createIdentifier(
                                                            GeneratedGenericAPISdkErrorImpl.RESPONSE_BODY_CONSTRUCTOR_PARAMETER_NAME
                                                        ),
                                                        ts.factory.createIdentifier("undefined"),
                                                        ts.factory.createNumericLiteral("2")
                                                    ]
                                                ),
                                                ts.factory.createTemplateTail("")
                                            )
                                        ])
                                    ]
                                )
                            )
                        ],
                        true
                    ),
                    undefined
                ),
                ts.factory.createReturnStatement(
                    ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier(LINES_VARIABLE_NAME),
                            ts.factory.createIdentifier("join")
                        ),
                        undefined,
                        [ts.factory.createStringLiteral("\n")]
                    )
                )
            ].map(getTextOfTsNode)
        });
    }
}
