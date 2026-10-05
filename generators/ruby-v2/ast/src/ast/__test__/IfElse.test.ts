import { BaseRubyCustomConfigSchema } from "../../custom-config/BaseRubyCustomConfigSchema.js";
import { ruby } from "../../index.js";
import { Writer } from "../core/Writer.js";

describe("IfElse", () => {
    let writerConfig: Writer.Args;

    beforeEach(() => {
        writerConfig = { customConfig: BaseRubyCustomConfigSchema.parse({}) };
    });

    test("writes a single-statement if in modifier form", () => {
        const ifElse = ruby.ifElse({
            if: {
                condition: ruby.codeblock("params[:foo]"),
                thenBody: [ruby.codeblock("body.add(name: :foo)")]
            }
        });
        expect(ifElse.toString(writerConfig)).toMatchSnapshot();
    });

    test("writes a negated single-statement if as an unless modifier", () => {
        const ifElse = ruby.ifElse({
            negated: true,
            if: {
                condition: ruby.codeblock("params[:foo].nil?"),
                thenBody: [ruby.codeblock("body.add(name: :foo)")]
            }
        });
        expect(ifElse.toString(writerConfig)).toMatchSnapshot();
    });

    test("writes a negated multi-statement if in explicit unless/end form", () => {
        const ifElse = ruby.ifElse({
            negated: true,
            if: {
                condition: ruby.codeblock("params[:foo].nil?"),
                thenBody: [ruby.codeblock("first = 1"), ruby.codeblock("second = 2")]
            }
        });
        expect(ifElse.toString(writerConfig)).toMatchSnapshot();
    });

    test("writes a negated if with an else branch", () => {
        const ifElse = ruby.ifElse({
            negated: true,
            if: {
                condition: ruby.codeblock("params[:foo].nil?"),
                thenBody: [ruby.codeblock("first = 1")]
            },
            elseBody: ruby.codeblock("second = 2")
        });
        expect(ifElse.toString(writerConfig)).toMatchSnapshot();
    });

    test("rejects a negated if with elsif, which Ruby cannot express", () => {
        expect(() =>
            ruby.ifElse({
                negated: true,
                if: {
                    condition: ruby.codeblock("params[:foo].nil?"),
                    thenBody: [ruby.codeblock("first = 1")]
                },
                elseIf: [
                    {
                        condition: ruby.codeblock("params[:bar].nil?"),
                        thenBody: [ruby.codeblock("second = 2")]
                    }
                ]
            })
        ).toThrow("Ruby has no `elsunless`");
    });
});
