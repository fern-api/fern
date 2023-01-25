import { AbstractErrorClassGenerator } from "@fern-typescript/abstract-error-class-generator";
import { GeneratedTimeoutSdkError, TimeoutSdkErrorContext } from "@fern-typescript/contexts";
import { OptionalKind, ParameterDeclarationStructure, PropertyDeclarationStructure, ts } from "ts-morph";

export class GeneratedTimeoutSdkErrorImpl
    extends AbstractErrorClassGenerator<TimeoutSdkErrorContext>
    implements GeneratedTimeoutSdkError
{
    public writeToFile(context: TimeoutSdkErrorContext): void {
        super.writeToSourceFile(context);
    }

    public build(context: TimeoutSdkErrorContext): ts.NewExpression {
        return ts.factory.createNewExpression(
            context.timeoutSdkError.getReferenceToTimeoutSdkError().getExpression(),
            undefined,
            undefined
        );
    }

    protected getClassProperties(): OptionalKind<PropertyDeclarationStructure>[] {
        return [];
    }

    protected getConstructorParameters(): OptionalKind<ParameterDeclarationStructure>[] {
        return [];
    }

    protected getReferenceToErrorMesssageInsideConstructor(): ts.Expression {
        return ts.factory.createStringLiteral("Timeout");
    }

    protected getConstructorStatements(): ts.Statement[] {
        return [];
    }
}
