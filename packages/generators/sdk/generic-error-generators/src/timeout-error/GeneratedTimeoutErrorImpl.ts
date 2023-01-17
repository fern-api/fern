import { AbstractErrorClassGenerator } from "@fern-typescript/abstract-error-class-generator";
import { GeneratedTimeoutError } from "@fern-typescript/contexts";
import { TimeoutErrorContext } from "@fern-typescript/contexts/src/contexts/TimeoutErrorContext";
import { OptionalKind, ParameterDeclarationStructure, PropertyDeclarationStructure, ts } from "ts-morph";

export class GeneratedTimeoutErrorImpl
    extends AbstractErrorClassGenerator<TimeoutErrorContext>
    implements GeneratedTimeoutError
{
    public writeToFile(context: TimeoutErrorContext): void {
        super.writeToSourceFile(context);
    }

    public build(context: TimeoutErrorContext): ts.NewExpression {
        return ts.factory.createNewExpression(
            context.timeoutError.getReferenceToTimeoutError().getExpression(),
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
