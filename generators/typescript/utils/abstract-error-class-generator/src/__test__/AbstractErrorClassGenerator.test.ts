import { BaseContext } from "@fern-typescript/contexts";
import {
    ClassDeclaration,
    OptionalKind,
    ParameterDeclarationStructure,
    Project,
    PropertyDeclarationStructure,
    ts
} from "ts-morph";
import { describe, expect, it } from "vitest";

import { AbstractErrorClassGenerator } from "../AbstractErrorClassGenerator.js";

// ────────────────────────────────────────────────────────────────────────────
// Concrete test subclass
// ────────────────────────────────────────────────────────────────────────────

class TestErrorClassGenerator extends AbstractErrorClassGenerator<BaseContext> {
    private readonly classProperties: OptionalKind<PropertyDeclarationStructure>[];
    private readonly constructorParams: OptionalKind<ParameterDeclarationStructure>[];
    private readonly superArgs: ts.Expression[];
    private readonly constructorStmts: ts.Statement[];
    private readonly abstract: boolean;
    private readonly customBaseClass: ts.TypeNode | undefined;
    private addToClassFn: ((class_: ClassDeclaration, context: BaseContext) => void) | undefined;

    constructor(opts: {
        errorClassName: string;
        classProperties?: OptionalKind<PropertyDeclarationStructure>[];
        constructorParams?: OptionalKind<ParameterDeclarationStructure>[];
        superArgs?: ts.Expression[];
        constructorStmts?: ts.Statement[];
        isAbstract?: boolean;
        baseClass?: ts.TypeNode;
        addToClassFn?: (class_: ClassDeclaration, context: BaseContext) => void;
    }) {
        super({ errorClassName: opts.errorClassName });
        this.classProperties = opts.classProperties ?? [];
        this.constructorParams = opts.constructorParams ?? [];
        this.superArgs = opts.superArgs ?? [ts.factory.createStringLiteral("error")];
        this.constructorStmts = opts.constructorStmts ?? [];
        this.abstract = opts.isAbstract ?? false;
        this.customBaseClass = opts.baseClass;
        this.addToClassFn = opts.addToClassFn;
    }

    public writeToFile(context: BaseContext): void {
        super.writeToSourceFile(context);
    }

    protected getClassProperties(): OptionalKind<PropertyDeclarationStructure>[] {
        return this.classProperties;
    }

    protected getConstructorParameters(): OptionalKind<ParameterDeclarationStructure>[] {
        return this.constructorParams;
    }

    protected getSuperArguments(): ts.Expression[] {
        return this.superArgs;
    }

    protected getConstructorStatements(): ts.Statement[] {
        return this.constructorStmts;
    }

    protected addToClass(class_: ClassDeclaration, context: BaseContext): void {
        if (this.addToClassFn) {
            this.addToClassFn(class_, context);
        }
    }

    protected isAbstract(): boolean {
        return this.abstract;
    }

    protected override getBaseClass(context: BaseContext): ts.TypeNode {
        if (this.customBaseClass) {
            return this.customBaseClass;
        }
        return super.getBaseClass(context);
    }
}

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

function createMockContext(): BaseContext {
    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFile = project.createSourceFile("test.ts", "");
    return {
        sourceFile
        // biome-ignore lint/suspicious/noExplicitAny: test mock — BaseContext only needs sourceFile
    } as any;
}

// ────────────────────────────────────────────────────────────────────────────
// Tests
// ────────────────────────────────────────────────────────────────────────────

describe("AbstractErrorClassGenerator", () => {
    describe("writeToSourceFile", () => {
        it("writes basic error class extending Error", () => {
            const generator = new TestErrorClassGenerator({
                errorClassName: "MyError"
            });
            const context = createMockContext();
            generator.writeToFile(context);
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });

        it("writes error class with constructor parameters", () => {
            const generator = new TestErrorClassGenerator({
                errorClassName: "BadRequestError",
                constructorParams: [
                    { name: "message", type: "string" },
                    { name: "statusCode", type: "number", hasQuestionToken: true }
                ],
                superArgs: [ts.factory.createIdentifier("message")]
            });
            const context = createMockContext();
            generator.writeToFile(context);
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });

        it("writes error class with class properties", () => {
            const generator = new TestErrorClassGenerator({
                errorClassName: "ApiError",
                classProperties: [
                    { name: "statusCode", type: "number", isReadonly: true },
                    { name: "body", type: "unknown", hasQuestionToken: true }
                ],
                constructorParams: [{ name: "message", type: "string" }],
                superArgs: [ts.factory.createIdentifier("message")]
            });
            const context = createMockContext();
            generator.writeToFile(context);
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });

        it("writes error class with constructor statements", () => {
            const generator = new TestErrorClassGenerator({
                errorClassName: "CustomError",
                constructorParams: [{ name: "statusCode", type: "number" }],
                superArgs: [ts.factory.createStringLiteral("custom error")],
                constructorStmts: [
                    ts.factory.createExpressionStatement(
                        ts.factory.createBinaryExpression(
                            ts.factory.createPropertyAccessExpression(ts.factory.createThis(), "statusCode"),
                            ts.factory.createToken(ts.SyntaxKind.EqualsToken),
                            ts.factory.createIdentifier("statusCode")
                        )
                    )
                ]
            });
            const context = createMockContext();
            generator.writeToFile(context);
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });

        it("writes abstract error class", () => {
            const generator = new TestErrorClassGenerator({
                errorClassName: "BaseApiError",
                isAbstract: true
            });
            const context = createMockContext();
            generator.writeToFile(context);
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });

        it("writes error class with custom base class", () => {
            const generator = new TestErrorClassGenerator({
                errorClassName: "SpecificError",
                baseClass: ts.factory.createTypeReferenceNode("BaseApiError")
            });
            const context = createMockContext();
            generator.writeToFile(context);
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });

        it("includes Object.setPrototypeOf in constructor", () => {
            const generator = new TestErrorClassGenerator({
                errorClassName: "ProtoError"
            });
            const context = createMockContext();
            generator.writeToFile(context);
            const text = context.sourceFile.getFullText();
            expect(text).toContain("Object.setPrototypeOf");
            expect(text).toContain("new.target.prototype");
        });

        it("includes conditional Error.captureStackTrace", () => {
            const generator = new TestErrorClassGenerator({
                errorClassName: "StackError"
            });
            const context = createMockContext();
            generator.writeToFile(context);
            const text = context.sourceFile.getFullText();
            expect(text).toContain("Error.captureStackTrace");
            expect(text).toContain("this.constructor");
        });

        it("sets this.name = this.constructor.name", () => {
            const generator = new TestErrorClassGenerator({
                errorClassName: "NamedError"
            });
            const context = createMockContext();
            generator.writeToFile(context);
            const text = context.sourceFile.getFullText();
            expect(text).toContain("this.name = this.constructor.name");
        });

        it("invokes addToClass callback", () => {
            let classDecl: ClassDeclaration | undefined;
            const generator = new TestErrorClassGenerator({
                errorClassName: "HookError",
                addToClassFn: (class_) => {
                    classDecl = class_;
                }
            });
            const context = createMockContext();
            generator.writeToFile(context);
            expect(classDecl).toBeDefined();
            expect(classDecl?.getName()).toBe("HookError");
        });
    });

    describe("getBaseClass default", () => {
        it("defaults to Error when no custom base class", () => {
            const generator = new TestErrorClassGenerator({
                errorClassName: "DefaultBaseError"
            });
            const context = createMockContext();
            generator.writeToFile(context);
            const text = context.sourceFile.getFullText();
            expect(text).toContain("extends Error");
        });
    });
});
