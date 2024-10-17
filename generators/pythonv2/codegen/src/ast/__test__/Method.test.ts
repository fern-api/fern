import { ClassMethodType } from "../Method";
import { Type } from "../Type";
import { CodeBlock } from "../CodeBlock";
import { python } from "../..";

describe("Method", () => {
    describe("toString", () => {
        it("should generate a static method", () => {
            const method = python.method({
                name: "static_method",
                parameters: [],
                type: ClassMethodType.STATIC
            });
            expect(method.toString()).toMatchSnapshot();
        });

        it("should generate an instance method", () => {
            const method = python.method({
                name: "instance_method",
                parameters: [],
                type: ClassMethodType.INSTANCE
            });
            expect(method.toString()).toMatchSnapshot();
        });

        it("should generate a class method", () => {
            const method = python.method({
                name: "class_method",
                parameters: [],
                type: ClassMethodType.CLASS
            });
            expect(method.toString()).toMatchSnapshot();
        });

        it("should generate a method with one argument", () => {
            const method = python.method({
                name: "one_arg",
                parameters: [python.parameter({ name: "arg1", type: python.Type.str() })]
            });
            expect(method.toString()).toMatchSnapshot();
        });

        it("should generate a method with multiple arguments", () => {
            const method = python.method({
                name: "multi_args",
                parameters: [
                    python.parameter({ name: "arg1", type: python.Type.str() }),
                    python.parameter({ name: "arg2", type: python.Type.int() })
                ]
            });
            expect(method.toString()).toMatchSnapshot();
        });

        it("should generate a method with a specified return type", () => {
            const method = python.method({
                name: "with_return",
                parameters: [],
                return_: python.Type.bool()
            });
            expect(method.toString()).toMatchSnapshot();
        });

        it("should generate a method without a specified return type", () => {
            const method = python.method({
                name: "without_return",
                parameters: []
            });
            expect(method.toString()).toMatchSnapshot();
        });

        it("should generate a method with a body", () => {
            const method = python.method({
                name: "with_body",
                parameters: [],
                body: python.codeBlock("return True")
            });
            expect(method.toString()).toMatchSnapshot();
        });

        it("should generate a method without a body", () => {
            const method = python.method({
                name: "without_body",
                parameters: []
            });
            expect(method.toString()).toMatchSnapshot();
        });

        it("should generate a method with a docstring", () => {
            const method = python.method({
                name: "with_docstring",
                parameters: [],
                docstring: "This is a docstring"
            });
            expect(method.toString()).toMatchSnapshot();
        });

        it("should generate a method without a docstring", () => {
            const method = python.method({
                name: "without_docstring",
                parameters: []
            });
            expect(method.toString()).toMatchSnapshot();
        });

        it("should generate a method with a decorator", () => {
            const method = python.method({
                name: "with_decorator",
                parameters: [],
                decorators: [
                    python.decorator({
                        reference: python.reference({ name: "decorator_with_reference", modulePath: ["decorators"] })
                    })
                ]
            });
            expect(method.toString()).toMatchSnapshot();
        });
    });
});
