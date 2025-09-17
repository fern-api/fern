import { ruby } from "../..";
import { BaseRubyCustomConfigSchema } from "../../custom-config/BaseRubyCustomConfigSchema";
import { Writer } from "../core/Writer";

describe("MethodInvocation", () => {
    let writerConfig: Writer.Args;

    beforeEach(() => {
        writerConfig = { customConfig: BaseRubyCustomConfigSchema.parse({ clientClassName: "Example" }) };
    });

    test("writes method invocation with no arguments", () => {
        const method = ruby.invokeMethod({ on: ruby.codeblock(`2`), method: "my_method", arguments_: [] });
        expect(method.toString(writerConfig)).toMatchSnapshot();
    });

    test("writes method invocation with 1 argument", () => {
        const method = ruby.invokeMethod({
            on: ruby.codeblock(`2`),
            method: "my_method",
            arguments_: [ruby.codeblock(`1`)]
        });
        expect(method.toString(writerConfig)).toMatchSnapshot();
    });

    test("writes method invocation with 2 arguments", () => {
        const method = ruby.invokeMethod({
            on: ruby.codeblock(`2`),
            method: "my_method",
            arguments_: [ruby.codeblock(`1`), ruby.codeblock(`3`)]
        });
        expect(method.toString(writerConfig)).toMatchSnapshot();
    });

    test("writes method invocation with no arguments but a block", () => {
        const method = ruby.invokeMethod({
            on: ruby.codeblock(`2`),
            method: "my_method",
            arguments_: [],
            block: ruby.codeblock(`Time.now`)
        });
        expect(method.toString(writerConfig)).toMatchSnapshot();
    });

    test("writes method invocation with 1 argument and a block", () => {
        const method = ruby.invokeMethod({
            on: ruby.codeblock(`2`),
            method: "my_method",
            arguments_: [ruby.codeblock(`1`)],
            block: ruby.codeblock(`Time.now`)
        });
        expect(method.toString(writerConfig)).toMatchSnapshot();
    });

    test("writes method invocation with 2 arguments and a block", () => {
        const method = ruby.invokeMethod({
            on: ruby.codeblock(`2`),
            method: "my_method",
            arguments_: [ruby.codeblock(`1`), ruby.codeblock(`3`)],
            block: ruby.codeblock(`Time.now`)
        });
        expect(method.toString(writerConfig)).toMatchSnapshot();
    });
});
