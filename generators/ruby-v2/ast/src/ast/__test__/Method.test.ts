import { ruby } from "../..";
import { BaseRubyCustomConfigSchema } from "../../custom-config/BaseRubyCustomConfigSchema";
import { Writer } from "../core/Writer";

describe("Method", () => {
    let writer: Writer;
    let writerConfig: Writer.Args;

    beforeEach(() => {
        writerConfig = { customConfig: BaseRubyCustomConfigSchema.parse({ clientClassName: "Example" }) };

        writer = new Writer({ customConfig: BaseRubyCustomConfigSchema.parse({ clientClassName: "Example" }) });
    });

    test("writes method with no parameters", () => {
        const method = ruby.method({ name: "fizzbuzz" });

        expect(method.toString(writerConfig)).toMatchSnapshot();
    });

    test("writes method with positional parameters", () => {
        const method = ruby.method({
            name: "fizzbuzz",
            parameters: { positional: [ruby.parameter({ name: "one" }), ruby.parameter({ name: "two" })] }
        });

        expect(method.toString(writerConfig)).toMatchSnapshot();
    });

    test("writes method with keyword parameters", () => {
        const method = ruby.method({
            name: "fizzbuzz",
            parameters: {
                keyword: [ruby.keywordParameter({ name: "one" }), ruby.keywordParameter({ name: "two" })]
            }
        });

        expect(method.toString(writerConfig)).toMatchSnapshot();
    });

    test("writes method with single splat parameter", () => {
        const method = ruby.method({
            name: "fizzbuzz",
            parameters: { positionalSplat: ruby.positionalSplatParameter({ name: "one" }) }
        });

        expect(method.toString(writerConfig)).toMatchSnapshot();
    });

    test("writes method with double splat parameter", () => {
        const method = ruby.method({
            name: "fizzbuzz",
            parameters: { keywordSplat: ruby.keywordSplatParameter({ name: "one" }) }
        });

        expect(method.toString(writerConfig)).toMatchSnapshot();
    });

    test("writes method with yield parameter", () => {
        const method = ruby.method({
            name: "fizzbuzz",
            parameters: { yield: ruby.yieldParameter({ name: "one" }) }
        });

        expect(method.toString(writerConfig)).toMatchSnapshot();
    });

    test("writes method with mix of positional and keyword parameters", () => {
        const method = ruby.method({
            name: "fizzbuzz",
            parameters: {
                positional: [ruby.parameter({ name: "one" }), ruby.parameter({ name: "two" })],
                keyword: [ruby.keywordParameter({ name: "three" }), ruby.keywordParameter({ name: "four" })]
            }
        });

        expect(method.toString(writerConfig)).toMatchSnapshot();
    });

    test("writes method with mix of positional, keyword, and single-splat parameters", () => {
        const method = ruby.method({
            name: "fizzbuzz",
            parameters: {
                positional: [ruby.parameter({ name: "one" }), ruby.parameter({ name: "two" })],
                keyword: [ruby.keywordParameter({ name: "three" }), ruby.keywordParameter({ name: "four" })],
                positionalSplat: ruby.positionalSplatParameter({ name: "splatted" })
            }
        });

        expect(method.toString(writerConfig)).toMatchSnapshot();
    });

    test("writes method with mix of positional, keyword, and double-splat parameters", () => {
        const method = ruby.method({
            name: "fizzbuzz",
            parameters: {
                positional: [ruby.parameter({ name: "one" }), ruby.parameter({ name: "two" })],
                keyword: [ruby.keywordParameter({ name: "three" }), ruby.keywordParameter({ name: "four" })],
                keywordSplat: ruby.keywordSplatParameter({ name: "double_splatted" })
            }
        });

        expect(method.toString(writerConfig)).toMatchSnapshot();
    });

    test("writes method with mix of positional, keyword, and yield parameters", () => {
        const method = ruby.method({
            name: "fizzbuzz",
            parameters: {
                positional: [ruby.parameter({ name: "one" }), ruby.parameter({ name: "two" })],
                keyword: [ruby.keywordParameter({ name: "three" }), ruby.keywordParameter({ name: "four" })],
                yield: ruby.yieldParameter({ name: "block" })
            }
        });

        expect(method.toString(writerConfig)).toMatchSnapshot();
    });
});
