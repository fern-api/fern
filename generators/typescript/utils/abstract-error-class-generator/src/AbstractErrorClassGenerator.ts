import { getTextOfTsNode } from "@fern-typescript/commons";
import { BaseContext } from "@fern-typescript/contexts";
import {
    ClassDeclaration,
    OptionalKind,
    ParameterDeclarationStructure,
    PropertyDeclarationStructure,
    ts
} from "ts-morph";

export declare namespace AbstractErrorClassGenerator {
    export interface Init {
        errorClassName: string;
    }
}

export abstract class AbstractErrorClassGenerator<Context extends BaseContext> {
    protected errorClassName: string;

    constructor({ errorClassName }: AbstractErrorClassGenerator.Init) {
        this.errorClassName = errorClassName;
    }

    protected writeToSourceFile(context: Context): void {
        const class_ = context.sourceFile.addClass({
            name: this.errorClassName,
            isAbstract: this.isAbstract(),
            isExported: true,
            extends: getTextOfTsNode(this.getBaseClass(context)),
            properties: this.getClassProperties(context)
        });

        class_.addConstructor({
            parameters: this.getConstructorParameters(context),
            statements: [
                // 1. Call super(message) - must be first
                ts.factory.createExpressionStatement(
                    ts.factory.createCallExpression(
                        ts.factory.createSuper(),
                        undefined,
                        this.getSuperArguments(context)
                    )
                ),
                // 2. Fix the prototype chain - Object.setPrototypeOf(this, new.target.prototype)
                // Use new.target.prototype (not ErrorClassName.prototype) to support subclassing
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
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createIdentifier("new"),
                                    ts.factory.createIdentifier("target")
                                ),
                                ts.factory.createIdentifier("prototype")
                            )
                        ]
                    )
                ),
                // 3. Capture stack trace - conditionally call if Error.captureStackTrace exists (V8-specific)
                ts.factory.createIfStatement(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier("Error"),
                        ts.factory.createIdentifier("captureStackTrace")
                    ),
                    ts.factory.createBlock(
                        [
                            ts.factory.createExpressionStatement(
                                ts.factory.createCallExpression(
                                    ts.factory.createPropertyAccessExpression(
                                        ts.factory.createIdentifier("Error"),
                                        ts.factory.createIdentifier("captureStackTrace")
                                    ),
                                    undefined,
                                    [
                                        ts.factory.createThis(),
                                        ts.factory.createPropertyAccessExpression(
                                            ts.factory.createThis(),
                                            ts.factory.createIdentifier("constructor")
                                        )
                                    ]
                                )
                            )
                        ],
                        true
                    ),
                    undefined
                ),
                // 4. Set the error name - this.name = this.constructor.name
                ts.factory.createExpressionStatement(
                    ts.factory.createBinaryExpression(
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createThis(),
                            ts.factory.createIdentifier("name")
                        ),
                        ts.factory.createToken(ts.SyntaxKind.EqualsToken),
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createThis(),
                                ts.factory.createIdentifier("constructor")
                            ),
                            ts.factory.createIdentifier("name")
                        )
                    )
                ),
                ...this.getConstructorStatements(context)
            ].map(getTextOfTsNode)
        });

        this.addToClass(class_, context);
    }

    protected getBaseClass(_context: Context): ts.TypeNode {
        return ts.factory.createTypeReferenceNode("Error");
    }

    protected abstract getClassProperties(context: Context): OptionalKind<PropertyDeclarationStructure>[];
    protected abstract getConstructorParameters(context: Context): OptionalKind<ParameterDeclarationStructure>[];
    protected abstract getSuperArguments(context: Context): ts.Expression[];
    protected abstract getConstructorStatements(context: Context): ts.Statement[];
    protected abstract addToClass(class_: ClassDeclaration, context: Context): void;
    protected abstract isAbstract(): boolean;
}
