import { DeclaredErrorName, ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { TypeReference } from "@fern-fern/ir-model/types";
import { AbstractErrorClassGenerator } from "@fern-typescript/abstract-error-class-generator";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { GeneratedAliasType, GeneratedSdkErrorClass, GeneratedType, SdkErrorContext } from "@fern-typescript/contexts";
import { TypeGenerator } from "@fern-typescript/type-generator";
import { OptionalKind, ParameterDeclarationStructure, PropertyDeclarationStructure, ts } from "ts-morph";

export declare namespace GeneratedSdkErrorClassImpl {
    export interface Init {
        errorClassName: string;
        errorDeclaration: ErrorDeclaration;
        type: TypeReference;
        typeGenerator: TypeGenerator<SdkErrorContext>;
    }
}

export class GeneratedSdkErrorClassImpl
    extends AbstractErrorClassGenerator<SdkErrorContext>
    implements GeneratedSdkErrorClass
{
    public readonly type = "class";

    private static BODY_PROPERTY_NAME = "body";
    private static BODY_CONSTRUCTOR_PARAMETER_NAME = GeneratedSdkErrorClassImpl.BODY_PROPERTY_NAME;

    private generatedType: GeneratedAliasType<SdkErrorContext>;
    private errorBodyType: TypeReference;
    private errorName: DeclaredErrorName;

    constructor({ errorClassName, errorDeclaration, type, typeGenerator }: GeneratedSdkErrorClassImpl.Init) {
        super({ errorClassName });
        this.errorBodyType = type;
        this.errorName = errorDeclaration.name;
        this.generatedType = typeGenerator.generateAlias({
            typeName: errorClassName,
            aliasOf: type,
            examples: [],
            docs: errorDeclaration.docs ?? undefined,
            fernFilepath: errorDeclaration.name.fernFilepath,
            getReferenceToSelf: (context) => context.error.getReferenceToError(errorDeclaration.name),
        });
    }

    public writeToFile(context: SdkErrorContext): void {
        super.writeToSourceFile(context);
    }

    public generateErrorBody(): GeneratedType<SdkErrorContext> {
        return this.generatedType;
    }

    public build(
        context: SdkErrorContext,
        { referenceToBody }: { referenceToBody: ts.Expression | undefined }
    ): ts.NewExpression {
        if (referenceToBody == null) {
            throw new Error("Cannot build error because reference to body is not defined");
        }
        return ts.factory.createNewExpression(
            context.error.getReferenceToError(this.errorName).getExpression(),
            undefined,
            [referenceToBody]
        );
    }

    protected getClassProperties(context: SdkErrorContext): OptionalKind<PropertyDeclarationStructure>[] {
        const referenceToType = context.type.getReferenceToType(this.errorBodyType);
        return [
            {
                name: GeneratedSdkErrorClassImpl.BODY_PROPERTY_NAME,
                isReadonly: true,
                hasQuestionToken: referenceToType.isOptional,
                type: getTextOfTsNode(referenceToType.typeNodeWithoutUndefined),
            },
        ];
    }

    protected getConstructorParameters(context: SdkErrorContext): OptionalKind<ParameterDeclarationStructure>[] {
        const referenceToType = context.type.getReferenceToType(this.errorBodyType);
        return [
            {
                name: GeneratedSdkErrorClassImpl.BODY_CONSTRUCTOR_PARAMETER_NAME,
                hasQuestionToken: referenceToType.isOptional,
                type: getTextOfTsNode(referenceToType.typeNodeWithoutUndefined),
            },
        ];
    }

    protected getReferenceToErrorMesssageInsideConstructor(): ts.Expression | undefined {
        return undefined;
    }

    protected getConstructorStatements(): ts.Statement[] {
        return [
            ts.factory.createExpressionStatement(
                ts.factory.createBinaryExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createThis(),
                        ts.factory.createIdentifier(GeneratedSdkErrorClassImpl.BODY_PROPERTY_NAME)
                    ),
                    ts.factory.createToken(ts.SyntaxKind.EqualsToken),
                    ts.factory.createIdentifier(GeneratedSdkErrorClassImpl.BODY_CONSTRUCTOR_PARAMETER_NAME)
                )
            ),
        ];
    }
}
