import { getTextOfTsNode } from "@fern-typescript/commons"
import { BaseContext } from "@fern-typescript/contexts"
import {
    ClassDeclaration,
    OptionalKind,
    ParameterDeclarationStructure,
    PropertyDeclarationStructure,
    ts
} from "ts-morph"

export declare namespace AbstractErrorClassGenerator {
    export interface Init {
        errorClassName: string
    }
}

export abstract class AbstractErrorClassGenerator<Context extends BaseContext> {
    protected errorClassName: string

    constructor({ errorClassName }: AbstractErrorClassGenerator.Init) {
        this.errorClassName = errorClassName
    }

    protected writeToSourceFile(context: Context): void {
        const class_ = context.sourceFile.addClass({
            name: this.errorClassName,
            isAbstract: this.isAbstract(),
            isExported: true,
            extends: getTextOfTsNode(this.getBaseClass(context)),
            properties: this.getClassProperties(context)
        })

        class_.addConstructor({
            parameters: this.getConstructorParameters(context),
            statements: [
                ts.factory.createExpressionStatement(
                    ts.factory.createCallExpression(
                        ts.factory.createSuper(),
                        undefined,
                        this.getSuperArguments(context)
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
                            )
                        ]
                    )
                ),
                ...this.getConstructorStatements(context)
            ].map(getTextOfTsNode)
        })

        this.addToClass(class_, context)
    }

    protected getBaseClass(_context: Context): ts.TypeNode {
        return ts.factory.createTypeReferenceNode("Error")
    }

    protected abstract getClassProperties(context: Context): OptionalKind<PropertyDeclarationStructure>[]
    protected abstract getConstructorParameters(context: Context): OptionalKind<ParameterDeclarationStructure>[]
    protected abstract getSuperArguments(context: Context): ts.Expression[]
    protected abstract getConstructorStatements(context: Context): ts.Statement[]
    protected abstract addToClass(class_: ClassDeclaration, context: Context): void
    protected abstract isAbstract(): boolean
}
