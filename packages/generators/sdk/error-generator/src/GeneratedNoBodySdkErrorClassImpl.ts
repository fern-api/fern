import { DeclaredErrorName, ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { AbstractErrorClassGenerator } from "@fern-typescript/abstract-error-class-generator";
import { GeneratedSdkErrorClass, GeneratedType, SdkErrorContext } from "@fern-typescript/contexts";
import { OptionalKind, ParameterDeclarationStructure, PropertyDeclarationStructure, ts } from "ts-morph";

export declare namespace GeneratedNoBodySdkErrorClassImpl {
    export interface Init extends AbstractErrorClassGenerator.Init {
        errorDeclaration: ErrorDeclaration;
    }
}
export class GeneratedNoBodySdkErrorClassImpl
    extends AbstractErrorClassGenerator<SdkErrorContext>
    implements GeneratedSdkErrorClass
{
    public readonly type = "class";

    private errorName: DeclaredErrorName;

    constructor({ errorDeclaration, ...superInit }: GeneratedNoBodySdkErrorClassImpl.Init) {
        super(superInit);
        this.errorName = errorDeclaration.name;
    }

    public writeToFile(context: SdkErrorContext): void {
        super.writeToSourceFile(context);
    }

    public generateErrorBody(): GeneratedType<SdkErrorContext> {
        throw new Error("Cannot generate error body because no type is defined for error");
    }

    public build(
        context: SdkErrorContext,
        { referenceToBody }: { referenceToBody: ts.Expression | undefined }
    ): ts.NewExpression {
        if (referenceToBody != null) {
            throw new Error("Cannot build error because reference to body is defined");
        }
        return ts.factory.createNewExpression(
            context.error.getReferenceToError(this.errorName).getExpression(),
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

    protected getReferenceToErrorMesssageInsideConstructor(): ts.Expression | undefined {
        return undefined;
    }

    protected getConstructorStatements(): ts.Statement[] {
        return [];
    }
}
