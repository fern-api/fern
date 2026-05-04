import { AbstractErrorClassGenerator } from "@fern-typescript/abstract-error-class-generator";
import { getTextOfTsKeyword } from "@fern-typescript/commons";
import { FileContext, GeneratedTimeoutSdkError } from "@fern-typescript/contexts";
import { OptionalKind, ParameterDeclarationStructure, PropertyDeclarationStructure, Scope, ts } from "ts-morph";

export class GeneratedTimeoutSdkErrorImpl
    extends AbstractErrorClassGenerator<FileContext>
    implements GeneratedTimeoutSdkError
{
    private static readonly MESSAGE_CONSTRUCTOR_PARAMETER_NAME = "message";
    private static readonly OPTIONS_CONSTRUCTOR_PARAMETER_NAME = "opts";
    private static readonly CAUSE_PROPERTY_NAME = "cause";

    public writeToFile(context: FileContext): void {
        super.writeToSourceFile(context);
    }

    public build(context: FileContext, message: string, cause?: ts.Expression): ts.NewExpression {
        const args: ts.Expression[] = [ts.factory.createStringLiteral(message)];
        if (cause != null) {
            args.push(
                ts.factory.createObjectLiteralExpression(
                    [ts.factory.createPropertyAssignment(GeneratedTimeoutSdkErrorImpl.CAUSE_PROPERTY_NAME, cause)],
                    true
                )
            );
        }
        return ts.factory.createNewExpression(
            context.timeoutSdkError.getReferenceToTimeoutSdkError().getExpression(),
            undefined,
            args
        );
    }

    public buildConstructorArguments(message: ts.Expression): ts.Expression[] {
        const properties: ts.ObjectLiteralElementLike[] = [];
        if (message != null) {
            properties.push(
                ts.factory.createPropertyAssignment(
                    GeneratedTimeoutSdkErrorImpl.MESSAGE_CONSTRUCTOR_PARAMETER_NAME,
                    message
                )
            );
        }

        return [ts.factory.createObjectLiteralExpression(properties, true)];
    }

    protected getClassProperties(): OptionalKind<PropertyDeclarationStructure>[] {
        return [
            {
                name: GeneratedTimeoutSdkErrorImpl.CAUSE_PROPERTY_NAME,
                isReadonly: true,
                hasQuestionToken: true,
                type: getTextOfTsKeyword(ts.SyntaxKind.UnknownKeyword),
                scope: Scope.Public
            }
        ];
    }

    protected getConstructorParameters(): OptionalKind<ParameterDeclarationStructure>[] {
        return [
            {
                name: GeneratedTimeoutSdkErrorImpl.MESSAGE_CONSTRUCTOR_PARAMETER_NAME,
                type: "string",
                hasQuestionToken: false
            },
            {
                name: GeneratedTimeoutSdkErrorImpl.OPTIONS_CONSTRUCTOR_PARAMETER_NAME,
                type: `{ ${GeneratedTimeoutSdkErrorImpl.CAUSE_PROPERTY_NAME}?: ${getTextOfTsKeyword(ts.SyntaxKind.UnknownKeyword)} }`,
                hasQuestionToken: true
            }
        ];
    }

    protected getSuperArguments(): ts.Expression[] {
        return [ts.factory.createIdentifier(GeneratedTimeoutSdkErrorImpl.MESSAGE_CONSTRUCTOR_PARAMETER_NAME)];
    }

    protected getConstructorStatements(): ts.Statement[] {
        return [
            ts.factory.createIfStatement(
                ts.factory.createBinaryExpression(
                    ts.factory.createPropertyAccessChain(
                        ts.factory.createIdentifier(GeneratedTimeoutSdkErrorImpl.OPTIONS_CONSTRUCTOR_PARAMETER_NAME),
                        ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                        ts.factory.createIdentifier(GeneratedTimeoutSdkErrorImpl.CAUSE_PROPERTY_NAME)
                    ),
                    ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
                    ts.factory.createNull()
                ),
                ts.factory.createBlock(
                    [
                        ts.factory.createExpressionStatement(
                            ts.factory.createBinaryExpression(
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createThis(),
                                    ts.factory.createIdentifier(GeneratedTimeoutSdkErrorImpl.CAUSE_PROPERTY_NAME)
                                ),
                                ts.factory.createToken(ts.SyntaxKind.EqualsToken),
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createIdentifier(
                                        GeneratedTimeoutSdkErrorImpl.OPTIONS_CONSTRUCTOR_PARAMETER_NAME
                                    ),
                                    ts.factory.createIdentifier(GeneratedTimeoutSdkErrorImpl.CAUSE_PROPERTY_NAME)
                                )
                            )
                        )
                    ],
                    true
                ),
                undefined
            )
        ];
    }

    protected addToClass(): void {
        // no-op
    }

    protected isAbstract(): boolean {
        return false;
    }
}
