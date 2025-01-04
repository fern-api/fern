import { python } from "..";
import { ClassMethodType } from "../Method";
import { Writer } from "../core/Writer";

describe("Method", () => {
    let writer: Writer;

    beforeEach(() => {
        writer = new Writer();
    });

    describe("toString", () => {
        it("should generate a static method", async () => {
            const method = python.method({
                name: "static_method",
                parameters: [],
                type: ClassMethodType.STATIC
            });
            method.write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
            expect(method.getReferences().length).toBe(0);
        });

        it("should generate an instance method", async () => {
            const method = python.method({
                name: "instance_method",
                parameters: [],
                type: ClassMethodType.INSTANCE
            });
            method.write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
            expect(method.getReferences().length).toBe(0);
        });

        it("should generate a class method", async () => {
            const method = python.method({
                name: "class_method",
                parameters: [],
                type: ClassMethodType.CLASS
            });
            method.write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
            expect(method.getReferences().length).toBe(0);
        });

        it("should generate a method with one argument", async () => {
            const method = python.method({
                name: "one_arg",
                parameters: [python.parameter({ name: "arg1", type: python.Type.str() })]
            });
            method.write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
            expect(method.getReferences().length).toBe(0);
        });

        it("should generate a method with multiple arguments", async () => {
            const method = python.method({
                name: "multi_args",
                parameters: [
                    python.parameter({ name: "arg1", type: python.Type.str() }),
                    python.parameter({ name: "arg2", type: python.Type.int() })
                ]
            });
            method.write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
            expect(method.getReferences().length).toBe(0);
        });

        it("should generate a method with a specified return type", async () => {
            const method = python.method({
                name: "with_return",
                parameters: [],
                return_: python.Type.bool()
            });
            method.write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
            expect(method.getReferences().length).toBe(0);
        });

        it("should generate a method without a specified return type", async () => {
            const method = python.method({
                name: "without_return",
                parameters: []
            });
            method.write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
            expect(method.getReferences().length).toBe(0);
        });

        it("should generate a method with a body", async () => {
            const method = python.method({
                name: "with_body",
                parameters: []
            });
            method.addStatement(python.codeBlock("return True"));
            method.write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
            expect(method.getReferences().length).toBe(0);
        });

        it("should generate a method without a body", async () => {
            const method = python.method({
                name: "without_body",
                parameters: []
            });
            method.write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
            expect(method.getReferences().length).toBe(0);
        });

        it("should generate a method with a docstring", async () => {
            const method = python.method({
                name: "with_docstring",
                parameters: [],
                docstring: "This is a docstring"
            });
            method.write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
            expect(method.getReferences().length).toBe(0);
        });

        it("should generate a method without a docstring", async () => {
            const method = python.method({
                name: "without_docstring",
                parameters: []
            });
            method.write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
            expect(method.getReferences().length).toBe(0);
        });

        it("should generate a method with a decorator", async () => {
            const method = python.method({
                name: "with_decorator",
                parameters: [],
                decorators: [
                    python.decorator({
                        callable: python.reference({
                            name: "decorator_with_reference",
                            modulePath: ["decorators"]
                        })
                    })
                ]
            });
            method.write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
            expect(method.getReferences().length).toBe(1);
        });

        it("should generate a method with local classes", async () => {
            const method = python.method({
                name: "method_with_local_classes",
                parameters: []
            });

            const parentClassRef = python.reference({
                name: "ParentClass",
                modulePath: ["some_module"]
            });

            const childClassDef = python.class_({
                name: "ChildClass",
                extends_: [parentClassRef]
            });
            const childMethod = python.method({
                name: "child_method",
                parameters: [python.parameter({ name: "self", type: python.Type.str() })]
            });
            childMethod.addStatement(python.codeBlock("self.parent_method()"));
            childMethod.addStatement(python.codeBlock('return "Child method called"'));
            childClassDef.add(childMethod);

            method.addStatement(childClassDef);
            method.addStatement(python.codeBlock("return ChildClass()"));

            method.write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
            expect(method.getReferences().length).toBe(1);
        });
    });
});
