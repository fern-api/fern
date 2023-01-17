import { DeclaredErrorName, ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { TypeReference } from "@fern-fern/ir-model/types";
import { AbstractErrorClassGenerator } from "@fern-typescript/abstract-error-class-generator";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { ErrorContext, GeneratedAliasType, GeneratedErrorClass, GeneratedType } from "@fern-typescript/contexts";
import { TypeGenerator } from "@fern-typescript/type-generator";
import { OptionalKind, ParameterDeclarationStructure, PropertyDeclarationStructure, ts } from "ts-morph";

export declare namespace GeneratedErrorClassImpl {
    export interface Init {
        errorClassName: string;
        errorDeclaration: ErrorDeclaration;
        type: TypeReference;
        typeGenerator: TypeGenerator<ErrorContext>;
    }
}

export class GeneratedErrorClassImpl extends AbstractErrorClassGenerator<ErrorContext> implements GeneratedErrorClass {
    public readonly type = "class";

    private static BODY_PROPERTY_NAME = "body";
    private static BODY_CONSTRUCTOR_PARAMETER_NAME = GeneratedErrorClassImpl.BODY_PROPERTY_NAME;

    private generatedType: GeneratedAliasType<ErrorContext>;
    private errorBodyType: TypeReference;
    private errorName: DeclaredErrorName;

    constructor({ errorClassName, errorDeclaration, type, typeGenerator }: GeneratedErrorClassImpl.Init) {
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

    public writeToFile(context: ErrorContext): void {
        super.writeToSourceFile(context);
    }

    public generateErrorBody(): GeneratedType<ErrorContext> {
        return this.generatedType;
    }

    public build(
        context: ErrorContext,
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

    protected getClassProperties(context: ErrorContext): OptionalKind<PropertyDeclarationStructure>[] {
        const referenceToType = context.type.getReferenceToType(this.errorBodyType);
        return [
            {
                name: GeneratedErrorClassImpl.BODY_PROPERTY_NAME,
                isReadonly: true,
                hasQuestionToken: referenceToType.isOptional,
                type: getTextOfTsNode(referenceToType.typeNodeWithoutUndefined),
            },
        ];
    }

    protected getConstructorParameters(context: ErrorContext): OptionalKind<ParameterDeclarationStructure>[] {
        const referenceToType = context.type.getReferenceToType(this.errorBodyType);
        return [
            {
                name: GeneratedErrorClassImpl.BODY_CONSTRUCTOR_PARAMETER_NAME,
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
                        ts.factory.createIdentifier(GeneratedErrorClassImpl.BODY_PROPERTY_NAME)
                    ),
                    ts.factory.createToken(ts.SyntaxKind.EqualsToken),
                    ts.factory.createIdentifier(GeneratedErrorClassImpl.BODY_CONSTRUCTOR_PARAMETER_NAME)
                )
            ),
        ];
    }
}
