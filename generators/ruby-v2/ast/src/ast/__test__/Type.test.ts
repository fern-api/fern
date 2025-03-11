import { ruby } from "../..";
import { BaseRubyCustomConfigSchema } from "../../custom-config/BaseRubyCustomConfigSchema";
import { Type } from "../Type";
import { Writer } from "../core/Writer";

describe("Type", () => {
    let writerConfig: Writer.Args;

    beforeEach(() => {
        writerConfig = { customConfig: BaseRubyCustomConfigSchema.parse({ clientClassName: "Example" }) };
    });

    test("writes untyped", () => {
        const untyped = Type.untyped();

        expect(untyped.toString(writerConfig)).toMatchSnapshot();
    });

    test("writes nil", () => {
        const nil = Type.nil();

        expect(nil.toString(writerConfig)).toMatchSnapshot();
    });

    test("writes boolean", () => {
        const boolean = Type.boolean();

        expect(boolean.toString(writerConfig)).toMatchSnapshot();
    });

    test("writes integer", () => {
        const integer = Type.integer();

        expect(integer.toString(writerConfig)).toMatchSnapshot();
    });

    test("writes string", () => {
        const string = Type.string();

        expect(string.toString(writerConfig)).toMatchSnapshot();
    });

    test("writes unions", () => {
        const union = Type.union([Type.string(), Type.integer()]);

        expect(union.toString(writerConfig)).toMatchSnapshot();
    });

    test("writes nilable", () => {
        const nilable = Type.boolean().nilable();

        expect(nilable.toString(writerConfig)).toMatchSnapshot();
    });
});
