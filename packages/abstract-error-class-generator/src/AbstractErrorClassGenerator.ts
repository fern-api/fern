import { getTextOfTsNode } from "@fern-typescript/commons";
import { WithBaseContextMixin } from "@fern-typescript/contexts";
import { OptionalKind, ParameterDeclarationStructure, PropertyDeclarationStructure, ts } from "ts-morph";

export declare namespace AbstractErrorClassGenerator {
    export interface Init {
        errorClassName: string;
    }
}

export abstract class AbstractErrorClassGenerator<Context extends WithBaseContextMixin> {
    protected errorClassName: string;

    constructor({ errorClassName }: AbstractErrorClassGenerator.Init) {
        this.errorClassName = errorClassName;
    }

    protected writeToSourceFile(context: Context): void {
        const class_ = context.base.sourceFile.addClass({
            name: this.errorClassName,
            isExported: true,
            extends: "Error",
            properties: this.getClassProperties(context),
        });

        const referenceToErrorMesssageInsideConstructor = this.getReferenceToErrorMesssageInsideConstructor(context);

        class_.addConstructor({
            parameters: this.getConstructorParameters(context),
            statements: [
                ts.factory.createExpressionStatement(
                    ts.factory.createCallExpression(
                        ts.factory.createSuper(),
                        undefined,
                        referenceToErrorMesssageInsideConstructor != null
                            ? [referenceToErrorMesssageInsideConstructor]
                            : []
                    )
                ),
                ts.factory.createExpressionStatement(
                    ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier("Object"),
                            ts.factory.createIdentifier("setPrototypeOf")
                        ),
                        undefined,
                        [
                            ts.factory.createThis(),
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createIdentifier(this.errorClassName),
                                ts.factory.createIdentifier("prototype")
                            ),
                        ]
                    )
                ),
                ...this.getConstructorStatements(context),
            ].map(getTextOfTsNode),
        });
    }

    protected abstract getClassProperties(context: Context): OptionalKind<PropertyDeclarationStructure>[];
    protected abstract getConstructorParameters(context: Context): OptionalKind<ParameterDeclarationStructure>[];
    protected abstract getReferenceToErrorMesssageInsideConstructor(context: Context): ts.Expression | undefined;
    protected abstract getConstructorStatements(context: Context): ts.Statement[];
}
