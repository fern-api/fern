import { AbstractErrorClassGenerator } from "@fern-typescript/abstract-error-class-generator";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { ExpressContext, GeneratedGenericAPIExpressError } from "@fern-typescript/contexts";
import {
    ClassDeclaration,
    MethodDeclarationStructure,
    OptionalKind,
    ParameterDeclarationStructure,
    PropertyDeclarationStructure,
    Scope,
    ts
} from "ts-morph";

export class GeneratedGenericAPIExpressErrorImpl
    extends AbstractErrorClassGenerator<ExpressContext>
    implements GeneratedGenericAPIExpressError
{
    private static SEND_METHOD_NAME = "send";
    private static SEND_RESPONSE_PARAMETER_NAME = "res";
    private static ERROR_NAME_PROPERTY_NAME = "errorName";

    public writeToFile(context: ExpressContext): void {
        super.writeToSourceFile(context);
    }

    protected getClassProperties(): OptionalKind<PropertyDeclarationStructure>[] {
        return [];
    }

    protected getConstructorParameters(): OptionalKind<ParameterDeclarationStructure>[] {
        return [
            {
                name: GeneratedGenericAPIExpressErrorImpl.ERROR_NAME_PROPERTY_NAME,
                type: "string",
                hasQuestionToken: true,
                isReadonly: true,
                scope: Scope.Public
            }
        ];
    }

    protected getSuperArguments(): ts.Expression[] {
        return [];
    }

    protected getConstructorStatements(): ts.Statement[] {
        return [];
    }

    protected addToClass(class_: ClassDeclaration, context: ExpressContext): void {
        class_.addMethod(this.getSendMethod(context));
    }

    private getSendMethod(context: ExpressContext): OptionalKind<MethodDeclarationStructure> {
        return {
            name: GeneratedGenericAPIExpressErrorImpl.SEND_METHOD_NAME,
            scope: Scope.Public,
            isAbstract: true,
            parameters: [
                {
                    name: GeneratedGenericAPIExpressErrorImpl.SEND_RESPONSE_PARAMETER_NAME,
                    type: getTextOfTsNode(context.externalDependencies.express.Response._getReferenceToType())
                }
            ],
            returnType: getTextOfTsNode(
                ts.factory.createTypeReferenceNode("Promise", [
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword)
                ])
            )
        };
    }

    protected isAbstract(): boolean {
        return true;
    }

    public implementSend(
        context: ExpressContext,
        generateBody: ({ expressResponse }: { expressResponse: ts.Expression }) => ts.Statement[]
    ): OptionalKind<MethodDeclarationStructure> {
        return {
            ...this.getSendMethod(context),
            isAbstract: false,
            isAsync: true,
            statements: generateBody({
                expressResponse: ts.factory.createIdentifier(
                    GeneratedGenericAPIExpressErrorImpl.SEND_RESPONSE_PARAMETER_NAME
                )
            }).map(getTextOfTsNode)
        };
    }

    public send({ error, expressResponse }: { error: ts.Expression; expressResponse: ts.Expression }): ts.Expression {
        return ts.factory.createAwaitExpression(
            ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(error, GeneratedGenericAPIExpressErrorImpl.SEND_METHOD_NAME),
                undefined,
                [expressResponse]
            )
        );
    }

    public getConstructorArguments({ errorName }: { errorName: string }): ts.Expression[] {
        return [ts.factory.createStringLiteral(errorName)];
    }

    public getErrorClassName({ referenceToError }: { referenceToError: ts.Expression }): ts.Expression {
        return ts.factory.createPropertyAccessExpression(
            referenceToError,
            GeneratedGenericAPIExpressErrorImpl.ERROR_NAME_PROPERTY_NAME
        );
    }
}
