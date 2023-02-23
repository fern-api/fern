import { ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { AbstractErrorClassGenerator } from "@fern-typescript/abstract-error-class-generator";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { ExpressErrorContext, GeneratedExpressError } from "@fern-typescript/contexts";
import {
    ClassDeclaration,
    OptionalKind,
    ParameterDeclarationStructure,
    PropertyDeclarationStructure,
    Scope,
    ts,
} from "ts-morph";

/**
 * this is disabled because we don't currently generate the zurg schemas,
 * which are necessary to serialize the error body
 */
const ENABLE_ERROR_BODIES: boolean = false;

export declare namespace GeneratedExpressErrorImpl {
    export interface Init {
        errorClassName: string;
        errorDeclaration: ErrorDeclaration;
    }
}

export class GeneratedExpressErrorImpl
    extends AbstractErrorClassGenerator<ExpressErrorContext>
    implements GeneratedExpressError
{
    public readonly type = "class";

    private static BODY_CONSTRUCTOR_PARAMETER_NAME = "body";

    private errorDeclaration: ErrorDeclaration;

    constructor({ errorClassName, errorDeclaration }: GeneratedExpressErrorImpl.Init) {
        super({ errorClassName });
        this.errorDeclaration = errorDeclaration;
    }

    public writeToFile(context: ExpressErrorContext): void {
        super.writeToSourceFile(context);
    }

    protected addToClass(class_: ClassDeclaration, context: ExpressErrorContext): void {
        class_.addMethod(
            context.genericAPIExpressError
                .getGeneratedGenericAPIExpressError()
                .implementSend(context, ({ expressResponse }) => {
                    return [
                        ts.factory.createExpressionStatement(
                            context.base.externalDependencies.express.Response.sendStatus({
                                referenceToExpressResponse: expressResponse,
                                status: this.errorDeclaration.statusCode,
                            })
                        ),
                    ];
                })
        );
    }

    protected getClassProperties(): OptionalKind<PropertyDeclarationStructure>[] {
        return [];
    }

    protected getConstructorParameters(context: ExpressErrorContext): OptionalKind<ParameterDeclarationStructure>[] {
        if (this.errorDeclaration.type == null || !ENABLE_ERROR_BODIES) {
            return [];
        }
        const referenceToType = context.type.getReferenceToType(this.errorDeclaration.type);
        return [
            {
                name: GeneratedExpressErrorImpl.BODY_CONSTRUCTOR_PARAMETER_NAME,
                hasQuestionToken: referenceToType.isOptional,
                type: getTextOfTsNode(referenceToType.typeNodeWithoutUndefined),
                scope: Scope.Private,
                isReadonly: true,
            },
        ];
    }

    protected getSuperArguments(): ts.Expression[] {
        return [];
    }

    protected getConstructorStatements(): ts.Statement[] {
        return [];
    }

    protected isAbstract(): boolean {
        return false;
    }

    protected override getBaseClass(context: ExpressErrorContext): ts.TypeNode {
        return context.genericAPIExpressError.getReferenceToGenericAPIExpressError().getTypeNode();
    }
}
