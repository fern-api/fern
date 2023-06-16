import { AbstractErrorClassGenerator } from "@fern-typescript/abstract-error-class-generator";
import { GeneratedTimeoutSdkError, SdkContext } from "@fern-typescript/contexts";
import { OptionalKind, ParameterDeclarationStructure, PropertyDeclarationStructure, ts } from "ts-morph";

export class GeneratedTimeoutSdkErrorImpl
    extends AbstractErrorClassGenerator<SdkContext>
    implements GeneratedTimeoutSdkError
{
    public writeToFile(context: SdkContext): void {
        super.writeToSourceFile(context);
    }

    public build(context: SdkContext): ts.NewExpression {
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

    protected getSuperArguments(): ts.Expression[] {
        return [ts.factory.createStringLiteral("Timeout")];
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
