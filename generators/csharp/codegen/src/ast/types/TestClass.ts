import { type Generation } from "../../context/generation-info.js";
import { Node } from "../core/AstNode.js";
import { Writer } from "../core/Writer.js";
import { Access } from "../language/Access.js";
import { CodeBlock } from "../language/CodeBlock.js";
import { Class } from "./Class.js";
import { type ClassReference } from "./ClassReference.js";

export declare namespace TestClass {
    interface Args extends Node.Args {
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

export class TestClass extends Node {
    public get name() {
        return this.reference.name;
    }
    public get namespace() {
        return this.reference.namespace;
    }
    public readonly reference: ClassReference;
    public readonly parentClassReference: ClassReference | undefined;

    private testMethods: TestClass.TestMethod[] = [];

    constructor({ name, namespace, parentClassReference, origin }: TestClass.Args, generation: Generation) {
        super(origin, generation);
        this.reference = this.csharp.classReference({
            name: name,
            namespace: namespace,
            origin
        });
        this.parentClassReference = parentClassReference;
    }

    public write(writer: Writer): void {
        writer.writeNode(this.getClass());
    }

    public getClass(): Class {
        const _class = new Class(
            {
                access: Access.Public,
                name: this.name,
                namespace: this.namespace,
                annotations: [this.NUnit.Framework.TestFixture],
                parentClassReference: this.parentClassReference,
                origin: this.origin
            },
            this.generation
        );
        for (const testMethod of this.testMethods) {
            _class.addMethod({
                access: Access.Public,
                isAsync: testMethod.isAsync,
                name: testMethod.name,
                parameters: [],
                body: testMethod.body,
                annotations: [this.NUnit.Framework.Test]
            });
        }
        return _class;
    }

    public addTestMethod(testMethod: TestClass.TestMethod): void {
        this.testMethods.push(testMethod);
    }
}
