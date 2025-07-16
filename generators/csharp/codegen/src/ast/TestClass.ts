import { Access } from "./Access";
import { Annotation } from "./Annotation";
import { Class } from "./Class";
import { ClassReference } from "./ClassReference";
import { CodeBlock } from "./CodeBlock";
import { Method } from "./Method";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace TestClass {
    interface Args {
        /* The name of the C# class */
        name: string;
        /* The namespace of the C# class*/
        namespace: string;
        /* The class to inherit from if any */
        parentClassReference?: ClassReference;
    }

    interface TestMethod {
        /* The name of the C# test method */
        name: string;
        /* The body of the test method */
        body: CodeBlock;
        /* Whether the method is sync or async */
        isAsync: boolean;
    }
}

export class TestClass extends AstNode {
    public readonly name: string;
    public readonly namespace: string;
    public readonly parentClassReference: ClassReference | undefined;

    private testMethods: TestClass.TestMethod[] = [];

    constructor({ name, namespace, parentClassReference }: TestClass.Args) {
        super();
        this.name = name;
        this.namespace = namespace;
        this.parentClassReference = parentClassReference;
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
            ],
            parentClassReference: this.parentClassReference
        });
        for (const testMethod of this.testMethods) {
            _class.addMethod(
                new Method({
                    access: Access.Public,
                    isAsync: testMethod.isAsync,
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
