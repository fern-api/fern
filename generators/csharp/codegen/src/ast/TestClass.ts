import { CodeBlock } from "./CodeBlock";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { Class } from "./Class";
import { Access } from "./Access";
import { Annotation } from "./Annotation";
import { ClassReference } from "./ClassReference";
import { Method } from "./Method";
import * as test from "node:test";

export declare namespace TestClass {
    interface Args {
        /* The name of the C# class */
        name: string;
        /* The namespace of the C# class*/
        namespace: string;
    }

    interface TestMethod {
        /* The name of the C# test method */
        name: string;
        /* The body of the test method */
        body: CodeBlock;
    }
}

export class TestClass extends AstNode {
    public readonly name: string;
    public readonly namespace: string;

    private testMethods: TestClass.TestMethod[] = [];

    constructor({ name, namespace }: TestClass.Args) {
        super();
        this.name = name;
        this.namespace = namespace;
    }

    public write(writer: Writer): void {
        writer.writeNode(this.getClass());
    }

    public getClass(): Class {
        const _class = new Class({
            access: Access.Public,
            name: this.name,
            namespace: this.namespace,
            annotations: [
                new Annotation({
                    reference: new ClassReference({ name: "TestFixture", namespace: "NUnit.Framework" })
                })
            ]
        });
        for (const testMethod of this.testMethods) {
            _class.addMethod(
                new Method({
                    access: Access.Public,
                    isAsync: false,
                    name: testMethod.name,
                    parameters: [],
                    body: testMethod.body,
                    annotations: [
                        new Annotation({
                            reference: new ClassReference({ name: "Test", namespace: "NUnit.Framework" })
                        })
                    ]
                })
            );
        }
        return _class;
    }

    public addTestMethod(testMethod: TestClass.TestMethod): void {
        this.testMethods.push(testMethod);
    }
}
