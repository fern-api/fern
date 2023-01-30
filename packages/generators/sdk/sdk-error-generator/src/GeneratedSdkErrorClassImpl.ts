import { ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { AbstractErrorClassGenerator } from "@fern-typescript/abstract-error-class-generator";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { GeneratedAliasType, GeneratedSdkErrorClass, GeneratedType, SdkErrorContext } from "@fern-typescript/contexts";
import { TypeGenerator } from "@fern-typescript/type-generator";
import { OptionalKind, ParameterDeclarationStructure, PropertyDeclarationStructure, ts } from "ts-morph";

export declare namespace GeneratedSdkErrorClassImpl {
    export interface Init {
        errorClassName: string;
        errorDeclaration: ErrorDeclaration;
        typeGenerator: TypeGenerator<SdkErrorContext>;
    }
}

export class GeneratedSdkErrorClassImpl
    extends AbstractErrorClassGenerator<SdkErrorContext>
    implements GeneratedSdkErrorClass
{
    public readonly type = "class";

    private static BODY_CONSTRUCTOR_PARAMETER_NAME = "body";

    private generatedType: GeneratedAliasType<SdkErrorContext> | undefined;
    private errorDeclaration: ErrorDeclaration;

    constructor({ errorClassName, errorDeclaration, typeGenerator }: GeneratedSdkErrorClassImpl.Init) {
        super({ errorClassName });
        this.errorDeclaration = errorDeclaration;
        this.generatedType =
            errorDeclaration.type != null
                ? typeGenerator.generateAlias({
                      typeName: errorClassName,
                      aliasOf: errorDeclaration.type,
                      examples: [],
                      docs: errorDeclaration.docs ?? undefined,
                      fernFilepath: errorDeclaration.name.fernFilepath,
                      getReferenceToSelf: (context) => context.sdkError.getReferenceToError(errorDeclaration.name),
                  })
                : undefined;
    }

    public writeToFile(context: SdkErrorContext): void {
        super.writeToSourceFile(context);
    }

    public generateErrorBody(): GeneratedType<SdkErrorContext> {
        if (this.generatedType == null) {
            throw new Error("Cannot generate error body because error has no type");
        }
        return this.generatedType;
    }

    public build(
        context: SdkErrorContext,
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

    protected getConstructorParameters(context: SdkErrorContext): OptionalKind<ParameterDeclarationStructure>[] {
        if (this.errorDeclaration.type == null) {
            return [];
        }
        const referenceToType = context.type.getReferenceToType(this.errorDeclaration.type);
        return [
            {
                name: GeneratedSdkErrorClassImpl.BODY_CONSTRUCTOR_PARAMETER_NAME,
                hasQuestionToken: referenceToType.isOptional,
                type: getTextOfTsNode(referenceToType.typeNodeWithoutUndefined),
            },
        ];
    }

    protected getSuperArguments(context: SdkErrorContext): ts.Expression[] {
        return context.genericAPISdkError.getGeneratedGenericAPISdkError().buildConstructorArguments({
            message: ts.factory.createStringLiteral(this.errorDeclaration.name.name.originalName),
            statusCode: ts.factory.createNumericLiteral(this.errorDeclaration.statusCode),
            responseBody:
                this.errorDeclaration.type != null
                    ? ts.factory.createIdentifier(GeneratedSdkErrorClassImpl.BODY_CONSTRUCTOR_PARAMETER_NAME)
                    : undefined,
        });
    }

    protected getConstructorStatements(): ts.Statement[] {
        return [];
    }

    protected isAbstract(): boolean {
        return false;
    }

    protected override getBaseClass(context: SdkErrorContext): ts.TypeNode {
        return context.genericAPISdkError.getReferenceToGenericAPISdkError().getTypeNode();
    }
}
