import { MethodType } from "../Method";
import { Type } from "../Type";
import { CodeBlock } from "../CodeBlock";
import { python } from "../..";

describe("Method", () => {
    describe("toString", () => {
        it("should generate a static method", () => {
            const method = python.method({
                name: "static_method",
                arguments_: [],
                type: MethodType.STATIC
            });
            expect(method.toString()).toMatchSnapshot();
        });

        it("should generate an instance method", () => {
            const method = python.method({
                name: "instance_method",
                arguments_: [],
                type: MethodType.INSTANCE
            });
            expect(method.toString()).toMatchSnapshot();
        });

        it("should generate a class method", () => {
            const method = python.method({
                name: "class_method",
                arguments_: [],
                type: MethodType.CLASS
            });
            expect(method.toString()).toMatchSnapshot();
        });

        it("should generate a method with one argument", () => {
            const method = python.method({
                name: "one_arg",
                arguments_: [python.field({ name: "arg1", type: python.Type.str() })]
            });
            expect(method.toString()).toMatchSnapshot();
        });

        it("should generate a method with multiple arguments", () => {
            const method = python.method({
                name: "multi_args",
                arguments_: [
                    python.field({ name: "arg1", type: python.Type.str() }),
                    python.field({ name: "arg2", type: python.Type.int() })
                ]
            });
            expect(method.toString()).toMatchSnapshot();
        });

        it("should generate a method with a specified return type", () => {
            const method = python.method({
                name: "with_return",
                arguments_: [],
                return_: python.Type.bool()
            });
            expect(method.toString()).toMatchSnapshot();
        });

        it("should generate a method without a specified return type", () => {
            const method = python.method({
                name: "without_return",
                arguments_: []
            });
            expect(method.toString()).toMatchSnapshot();
        });

        it("should generate a method with a body", () => {
            const method = python.method({
                name: "with_body",
                arguments_: [],
                body: python.codeBlock("return True")
            });
            expect(method.toString()).toMatchSnapshot();
        });

        it("should generate a method without a body", () => {
            const method = python.method({
                name: "without_body",
                arguments_: []
            });
            expect(method.toString()).toMatchSnapshot();
        });

        it("should generate a method with a docstring", () => {
            const method = python.method({
                name: "with_docstring",
                arguments_: [],
                docstring: "This is a docstring"
            });
            expect(method.toString()).toMatchSnapshot();
        });

        it("should generate a method without a docstring", () => {
            const method = python.method({
                name: "without_docstring",
                arguments_: []
            });
            expect(method.toString()).toMatchSnapshot();
        });

        it("should generate a method with a single decorator", () => {
            const method = python.method({
                name: "single_decorator",
                arguments_: [],
                decorators: ["decorator1"]
            });
            expect(method.toString()).toMatchSnapshot();
        });

        it("should generate a method with multiple decorators", () => {
            const method = python.method({
                name: "multiple_decorators",
                arguments_: [],
                decorators: ["decorator1", "decorator2"]
            });
            expect(method.toString()).toMatchSnapshot();
        });
    });
});
