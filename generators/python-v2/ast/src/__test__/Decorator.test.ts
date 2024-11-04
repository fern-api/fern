import { python } from "..";

describe("Decorator", () => {
    describe("toString", () => {
        it("should generate a simple decorator", () => {
            const decorator = python.decorator({
                callable: python.reference({ name: "simple_decorator" })
            });
            expect(decorator.toString()).toMatchSnapshot();
        });

        it("should generate a decorator with a reference", () => {
            const decorator = python.decorator({
                callable: python.reference({ name: "decorator_with_reference", modulePath: ["decorators"] })
            });
            expect(decorator.toString()).toMatchSnapshot();
        });

        it("should generate a decorator with arguments", () => {
            const decorator = python.decorator({
                callable: python.invokeMethod({
                    methodReference: python.reference({ name: "parameterized_decorator", modulePath: [] }),
                    arguments_: [
                        python.methodArgument({ value: python.codeBlock("arg1") }),
                        python.methodArgument({ name: "kwarg", value: python.codeBlock("42") })
                    ]
                })
            });
            expect(decorator.toString()).toMatchSnapshot();
        });

        it("should generate a decorator with a reference and arguments", () => {
            const decorator = python.decorator({
                callable: python.invokeMethod({
                    methodReference: python.reference({ name: "complex_decorator", modulePath: ["decorators"] }),
                    arguments_: [
                        python.methodArgument({ value: python.codeBlock("'test'") }),
                        python.methodArgument({ name: "value", value: python.codeBlock("True") })
                    ]
                })
            });
            expect(decorator.toString()).toMatchSnapshot();
        });
    });
});
