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
            block: [[], [ruby.codeblock(`Time.now`)]]
        });
        expect(method.toString(writerConfig)).toMatchSnapshot();
    });

    test("writes method invocation with a block with one block arg", () => {
        const method = ruby.invokeMethod({
            on: ruby.codeblock(`2`),
            method: "my_method",
            arguments_: [],
            block: [["duration"], [ruby.codeblock(`Time.now + duration`)]]
        });
        expect(method.toString(writerConfig)).toMatchSnapshot();
    });

    test("writes method invocation with a block with two block args", () => {
        const method = ruby.invokeMethod({
            on: ruby.codeblock(`2`),
            method: "my_method",
            arguments_: [],
            block: [["duration1", "duration2"], [ruby.codeblock(`Time.now + duration1 + duration2`)]]
        });
        expect(method.toString(writerConfig)).toMatchSnapshot();
    });

    test("writes method invocation with a block with three block args", () => {
        const method = ruby.invokeMethod({
            on: ruby.codeblock(`2`),
            method: "my_method",
            arguments_: [],
            block: [
                ["duration1", "duration2", "duration3"],
                [ruby.codeblock(`Time.now + duration1 + duration2 + duration3`)]
            ]
        });
        expect(method.toString(writerConfig)).toMatchSnapshot();
    });

    test("writes method invocation with 1 argument and a block", () => {
        const method = ruby.invokeMethod({
            on: ruby.codeblock(`2`),
            method: "my_method",
            arguments_: [ruby.codeblock(`1`)],
            block: [[], [ruby.codeblock(`Time.now`)]]
        });
        expect(method.toString(writerConfig)).toMatchSnapshot();
    });

    test("writes method invocation with 2 arguments and a block", () => {
        const method = ruby.invokeMethod({
            on: ruby.codeblock(`2`),
            method: "my_method",
            arguments_: [ruby.codeblock(`1`), ruby.codeblock(`3`)],
            block: [[], [ruby.codeblock(`Time.now`)]]
        });
        expect(method.toString(writerConfig)).toMatchSnapshot();
    });

    test("writes method invocation with 1 keyword argument", () => {
        const method = ruby.invokeMethod({
            on: ruby.codeblock(`2`),
            method: "my_method",
            arguments_: [],
            keywordArguments: [["keyword", ruby.codeblock(`1`)]]
        });
        expect(method.toString(writerConfig)).toMatchSnapshot();
    });

    test("writes method invocation with 2 keyword arguments", () => {
        const method = ruby.invokeMethod({
            on: ruby.codeblock(`2`),
            method: "my_method",
            arguments_: [],
            keywordArguments: [
                ["keyword1", ruby.codeblock(`1`)],
                ["keyword2", ruby.codeblock(`2`)]
            ]
        });
        expect(method.toString(writerConfig)).toMatchSnapshot();
    });

    test("writes method invocation with a mix of positional and keyword arguments", () => {
        const method = ruby.invokeMethod({
            on: ruby.codeblock(`2`),
            method: "my_method",
            arguments_: [ruby.codeblock(`1`), ruby.codeblock(`3`)],
            keywordArguments: [
                ["keyword1", ruby.codeblock(`1`)],
                ["keyword2", ruby.codeblock(`2`)]
            ]
        });
        expect(method.toString(writerConfig)).toMatchSnapshot();
    });
});
