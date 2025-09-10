import { AbstractErrorClassGenerator } from "@fern-typescript/abstract-error-class-generator";
import { GeneratedTimeoutSdkError, SdkContext } from "@fern-typescript/contexts";
import { OptionalKind, ParameterDeclarationStructure, PropertyDeclarationStructure, ts } from "ts-morph";

export class GeneratedTimeoutSdkErrorImpl
    extends AbstractErrorClassGenerator<SdkContext>
    implements GeneratedTimeoutSdkError
{
    private static readonly MESSAGE_CONSTRUCTOR_PARAMETER_NAME = "message";

    public writeToFile(context: SdkContext): void {
        super.writeToSourceFile(context);
    }

    public build(context: SdkContext, message: string): ts.NewExpression {
        return ts.factory.createNewExpression(
            context.timeoutSdkError.getReferenceToTimeoutSdkError().getExpression(),
            undefined,
            [ts.factory.createStringLiteral(message)]
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
        return [];
    }

    protected getConstructorParameters(): OptionalKind<ParameterDeclarationStructure>[] {
        return [
            {
                name: GeneratedTimeoutSdkErrorImpl.MESSAGE_CONSTRUCTOR_PARAMETER_NAME,
                type: "string",
                hasQuestionToken: false
            }
        ];
    }

    protected getSuperArguments(): ts.Expression[] {
        return [ts.factory.createIdentifier(GeneratedTimeoutSdkErrorImpl.MESSAGE_CONSTRUCTOR_PARAMETER_NAME)];
    }

    protected getConstructorStatements(): ts.Statement[] {
        return [];
    }

    protected addToClass(): void {
        // no-op
    }

    protected isAbstract(): boolean {
        return false;
    }
}
