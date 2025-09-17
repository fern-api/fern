import { ruby } from "../..";
import { BaseRubyCustomConfigSchema } from "../../custom-config/BaseRubyCustomConfigSchema";
import { Writer } from "../core/Writer";

describe("Begin", () => {
    let writerConfig: Writer.Args;

    beforeEach(() => {
        writerConfig = { customConfig: BaseRubyCustomConfigSchema.parse({ clientClassName: "Example" }) };
    });

    test("writes empty begin block", () => {
        const class_ = ruby.begin({ rescues: [] });

        expect(class_.toString(writerConfig)).toMatchSnapshot();
    });

    test("writes begin block with no rescues", () => {
        const class_ = ruby.begin({ body: ruby.codeblock(`2 + 2`), rescues: [] });
        expect(class_.toString(writerConfig)).toMatchSnapshot();
    });

    test("writes begin block with one empty rescue", () => {
        const class_ = ruby.begin({ body: ruby.codeblock(`2 + 2`), rescues: [{}] });
        expect(class_.toString(writerConfig)).toMatchSnapshot();
    });

    test("writes begin block with one blanket rescue that assigns", () => {
        const class_ = ruby.begin({
            body: ruby.codeblock(`2 + 2`),
            rescues: [
                {
                    errorVariable: "e",
                    body: ruby.codeblock(`puts e`)
                }
            ]
        });
        expect(class_.toString(writerConfig)).toMatchSnapshot();
    });

    test("writes begin block with one rescue specific to a class that doesn't assign", () => {
        const class_ = ruby.begin({
            body: ruby.codeblock(`2 + 2`),
            rescues: [
                {
                    errorClass: ruby.classReference({ name: "RuntimeError" }),
                    body: ruby.codeblock(`puts "couldn't add"`)
                }
            ]
        });
        expect(class_.toString(writerConfig)).toMatchSnapshot();
    });

    test("writes begin block with one class-specific rescue that assigns", () => {
        const class_ = ruby.begin({
            body: ruby.codeblock(`2 + 2`),
            rescues: [
                {
                    errorClass: ruby.classReference({ name: "RuntimeError" }),
                    errorVariable: "e",
                    body: ruby.codeblock(`puts e`)
                }
            ]
        });
        expect(class_.toString(writerConfig)).toMatchSnapshot();
    });

    test("writes begin block with multiple rescue clauses", () => {
        const class_ = ruby.begin({
            body: ruby.codeblock(`2 + 2`),
            rescues: [
                {
                    errorClass: ruby.classReference({ name: "StandardError" }),
                    errorVariable: "e",
                    body: ruby.codeblock(`puts "standard = #{e}"`)
                },
                {
                    errorClass: ruby.classReference({ name: "RuntimeError" }),
                    errorVariable: "e",
                    body: ruby.codeblock(`puts "runtime = #{e}"`)
                }
            ]
        });
        expect(class_.toString(writerConfig)).toMatchSnapshot();
    });
});
