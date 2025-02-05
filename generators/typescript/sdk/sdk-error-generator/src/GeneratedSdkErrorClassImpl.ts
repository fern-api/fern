import { AbstractErrorClassGenerator } from "@fern-typescript/abstract-error-class-generator";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { GeneratedSdkErrorClass, SdkContext } from "@fern-typescript/contexts";
import { OptionalKind, ParameterDeclarationStructure, PropertyDeclarationStructure, ts } from "ts-morph";

import { ErrorDeclaration } from "@fern-fern/ir-sdk/api";

export declare namespace GeneratedSdkErrorClassImpl {
    export interface Init {
        errorClassName: string;
        errorDeclaration: ErrorDeclaration;
    }
}

export class GeneratedSdkErrorClassImpl
    extends AbstractErrorClassGenerator<SdkContext>
    implements GeneratedSdkErrorClass
{
    public readonly type = "class";

    private static BODY_CONSTRUCTOR_PARAMETER_NAME = "body";

    private errorDeclaration: ErrorDeclaration;

    constructor({ errorClassName, errorDeclaration }: GeneratedSdkErrorClassImpl.Init) {
        super({ errorClassName });
        this.errorDeclaration = errorDeclaration;
    }

    public writeToFile(context: SdkContext): void {
        super.writeToSourceFile(context);
    }

    public build(
        context: SdkContext,
        { referenceToBody }: { referenceToBody: ts.Expression | undefined }
    ): ts.NewExpression {
        return ts.factory.createNewExpression(
            context.sdkError.getReferenceToError(this.errorDeclaration.name).getExpression(),
            undefined,
            referenceToBody != null ? [referenceToBody] : []
        );
    }

    protected addToClass(): void {
        // no-op
    }

    protected getClassProperties(): OptionalKind<PropertyDeclarationStructure>[] {
        return [];
    }

    protected getConstructorParameters(context: SdkContext): OptionalKind<ParameterDeclarationStructure>[] {
        if (this.errorDeclaration.type == null) {
            return [];
        }
        const referenceToType = context.type.getReferenceToType(this.errorDeclaration.type);
        return [
            {
                name: GeneratedSdkErrorClassImpl.BODY_CONSTRUCTOR_PARAMETER_NAME,
                hasQuestionToken: referenceToType.isOptional,
                type: getTextOfTsNode(referenceToType.typeNodeWithoutUndefined)
            }
        ];
    }

    protected getSuperArguments(context: SdkContext): ts.Expression[] {
        return context.genericAPISdkError.getGeneratedGenericAPISdkError().buildConstructorArguments({
            message: ts.factory.createStringLiteral(this.errorDeclaration.name.name.originalName),
            statusCode: ts.factory.createNumericLiteral(this.errorDeclaration.statusCode),
            responseBody:
                this.errorDeclaration.type != null
                    ? ts.factory.createIdentifier(GeneratedSdkErrorClassImpl.BODY_CONSTRUCTOR_PARAMETER_NAME)
                    : undefined
        });
    }

    protected getConstructorStatements(): ts.Statement[] {
        return [];
    }

    protected isAbstract(): boolean {
        return false;
    }

    protected override getBaseClass(context: SdkContext): ts.TypeNode {
        return context.genericAPISdkError.getReferenceToGenericAPISdkError().getTypeNode();
    }
}
