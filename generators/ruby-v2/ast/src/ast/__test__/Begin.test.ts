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
});
