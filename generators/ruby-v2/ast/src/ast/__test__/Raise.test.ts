import { ruby } from "../..";
import { BaseRubyCustomConfigSchema } from "../../custom-config/BaseRubyCustomConfigSchema";
import { Writer } from "../core/Writer";

describe("Raise", () => {
    let writerConfig: Writer.Args;

    beforeEach(() => {
        writerConfig = { customConfig: BaseRubyCustomConfigSchema.parse({ clientClassName: "Example" }) };
    });

    test("writes raise with no arguments", () => {
        const class_ = ruby.raise({});
        expect(class_.toString(writerConfig)).toMatchSnapshot();
    });

    test("writes raise with a specific error class", () => {
        const class_ = ruby.raise({ errorClass: ruby.classReference({ name: "StandardError" }) });
        expect(class_.toString(writerConfig)).toMatchSnapshot();
    });

    test("writes raise with a specific error class and a message", () => {
        const class_ = ruby.raise({
            errorClass: ruby.classReference({ name: "StandardError" }),
            message: ruby.codeblock(`"my message"`)
        });
        expect(class_.toString(writerConfig)).toMatchSnapshot();
    });

    test("writes raise with an arbitrary expression", () => {
        const class_ = ruby.raise({
            errorClass: ruby.codeblock(`condition ? StandardError : RuntimeError`)
        });
        expect(class_.toString(writerConfig)).toMatchSnapshot();
    });
});
