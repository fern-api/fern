import { MethodInvocation } from "../MethodInvocation";
import { Writer } from "../core/Writer";
import { python } from "../..";

describe("MethodInvocation", () => {
    it("should write a method invocation with no args", () => {
        const invocation = new MethodInvocation({
            method: "test_method",
            arguments_: []
        });

        const writer = new Writer();
        invocation.write(writer);

        expect(writer.toString()).toBe("test_method()");
    });

    it("should write a method invocation with one positional arg", () => {
        const invocation = new MethodInvocation({
            method: "test_method",
            arguments_: [python.methodArgument({ value: python.codeBlock("42") })]
        });

        const writer = new Writer();
        invocation.write(writer);

        expect(writer.toString()).toBe("test_method(42)");
    });

    it("should write a method invocation with one positional arg and one kwarg", () => {
        const invocation = new MethodInvocation({
            method: "test_method",
            arguments_: [
                python.methodArgument({ value: python.codeBlock("42") }),
                python.methodArgument({ name: "key", value: python.codeBlock("'value'") })
            ]
        });

        const writer = new Writer();
        invocation.write(writer);

        expect(writer.toString()).toBe("test_method(42, key='value')");
    });

    it("should write a method invocation with multiple positional and kwarg args", () => {
        const invocation = new MethodInvocation({
            method: "test_method",
            arguments_: [
                python.methodArgument({ value: python.codeBlock("42") }),
                python.methodArgument({ value: python.codeBlock("'hello'") }),
                python.methodArgument({ name: "key1", value: python.codeBlock("True") }),
                python.methodArgument({ name: "key2", value: python.codeBlock("[1, 2, 3]") })
            ]
        });

        const writer = new Writer();
        invocation.write(writer);

        expect(writer.toString()).toBe("test_method(42, 'hello', key1=True, key2=[1, 2, 3])");
    });
});
