import { AbstractErrorClassGenerator } from "@fern-typescript/abstract-error-class-generator";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { ExpressContext, GeneratedExpressError } from "@fern-typescript/contexts";
import {
    ClassDeclaration,
    OptionalKind,
    ParameterDeclarationStructure,
    PropertyDeclarationStructure,
    Scope,
    ts
} from "ts-morph";

import { ErrorDeclaration } from "@fern-fern/ir-sdk/api";

export declare namespace GeneratedExpressErrorImpl {
    export interface Init {
        errorClassName: string;
        errorDeclaration: ErrorDeclaration;
    }
}

export class GeneratedExpressErrorImpl
    extends AbstractErrorClassGenerator<ExpressContext>
    implements GeneratedExpressError
{
    public readonly type = "class";

    private static BODY_CONSTRUCTOR_PARAMETER_NAME = "body";

    private errorDeclaration: ErrorDeclaration;

    constructor({ errorClassName, errorDeclaration }: GeneratedExpressErrorImpl.Init) {
        super({ errorClassName });
        this.errorClassName = errorClassName;
        this.errorDeclaration = errorDeclaration;
    }

    public writeToFile(context: ExpressContext): void {
        super.writeToSourceFile(context);
    }

    protected addToClass(class_: ClassDeclaration, context: ExpressContext): void {
        class_.addMethod(
            context.genericAPIExpressError
                .getGeneratedGenericAPIExpressError()
                .implementSend(context, ({ expressResponse }) => {
                    if (this.errorDeclaration.type == null) {
                        return [
                            ts.factory.createExpressionStatement(
                                context.externalDependencies.express.Response.sendStatus({
                                    referenceToExpressResponse: expressResponse,
                                    status: this.errorDeclaration.statusCode
                                })
                            )
                        ];
                    }

                    const errorSchema = context.expressErrorSchema.getGeneratedExpressErrorSchema(
                        this.errorDeclaration.name
                    );
                    if (errorSchema == null) {
                        throw new Error("Error schema was not generated.");
                    }

                    return [
                        ts.factory.createExpressionStatement(
                            context.externalDependencies.express.Response.json({
                                referenceToExpressResponse: context.externalDependencies.express.Response.status({
                                    referenceToExpressResponse: expressResponse,
                                    status: this.errorDeclaration.statusCode
                                }),
                                valueToSend: errorSchema.serializeBody(context, {
                                    referenceToBody: ts.factory.createPropertyAccessExpression(
                                        ts.factory.createThis(),
                                        GeneratedExpressErrorImpl.BODY_CONSTRUCTOR_PARAMETER_NAME
                                    )
                                })
                            })
                        )
                    ];
                })
        );
    }

    protected getClassProperties(): OptionalKind<PropertyDeclarationStructure>[] {
        return [];
    }

    protected getConstructorParameters(context: ExpressContext): OptionalKind<ParameterDeclarationStructure>[] {
        if (this.errorDeclaration.type == null) {
            return [];
        }
        const referenceToType = context.type.getReferenceToType(this.errorDeclaration.type);
        return [
            {
                name: GeneratedExpressErrorImpl.BODY_CONSTRUCTOR_PARAMETER_NAME,
                hasQuestionToken: referenceToType.isOptional,
                type: getTextOfTsNode(referenceToType.typeNodeWithoutUndefined),
                scope: Scope.Private,
                isReadonly: true
            }
        ];
    }

    protected getSuperArguments(context: ExpressContext): ts.Expression[] {
        return context.genericAPIExpressError.getGeneratedGenericAPIExpressError().getConstructorArguments({
            errorName: this.errorClassName
        });
    }

    protected getConstructorStatements(): ts.Statement[] {
        return [];
    }

    protected isAbstract(): boolean {
        return false;
    }

    protected override getBaseClass(context: ExpressContext): ts.TypeNode {
        return context.genericAPIExpressError.getReferenceToGenericAPIExpressError().getTypeNode();
    }
}
