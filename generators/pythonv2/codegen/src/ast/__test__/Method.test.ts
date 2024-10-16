import { MethodType } from "../Method";
import { Type } from "../Type";
import { CodeBlock } from "../CodeBlock";
import { python } from "../..";

describe("Method", () => {
    describe("toString", () => {
        it("should generate a static method", () => {
            const method = python.method({
                name: "static_method",
                parameters: [],
                type: MethodType.STATIC
            });
            expect(method.toString()).toMatchSnapshot();
        });

        it("should generate an instance method", () => {
            const method = python.method({
                name: "instance_method",
                parameters: [],
                type: MethodType.INSTANCE
            });
            expect(method.toString()).toMatchSnapshot();
        });

        it("should generate a class method", () => {
            const method = python.method({
                name: "class_method",
                parameters: [],
                type: MethodType.CLASS
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

        it("should generate a method with a single decorator", () => {
            const method = python.method({
                name: "single_decorator",
                parameters: [],
                decorators: ["decorator1"]
            });
            expect(method.toString()).toMatchSnapshot();
        });

        it("should generate a method with multiple decorators", () => {
            const method = python.method({
                name: "multiple_decorators",
                parameters: [],
                decorators: ["decorator1", "decorator2"]
            });
            expect(method.toString()).toMatchSnapshot();
        });
    });
});
