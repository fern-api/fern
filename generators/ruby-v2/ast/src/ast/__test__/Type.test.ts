import { ruby } from "../..";
import { BaseRubyCustomConfigSchema } from "../../custom-config/BaseRubyCustomConfigSchema";
import { Type } from "../Type";
import { Writer } from "../core/Writer";

describe("Type", () => {
    let writerConfig: Writer.Args;

    beforeEach(() => {
        writerConfig = { customConfig: BaseRubyCustomConfigSchema.parse({ clientClassName: "Example" }) };
    });

    test("untyped", () => {
        const untyped = Type.untyped();

        expect(untyped.toString(writerConfig)).toMatchSnapshot();
    });

    test("self", () => {
        const self = Type.self();

        expect(self.toString(writerConfig)).toMatchSnapshot();
    });

    test("class", () => {
        const classType = Type.class_();

        expect(classType.toString(writerConfig)).toMatchSnapshot();
    });

    test("instance", () => {
        const instance = Type.instance();

        expect(instance.toString(writerConfig)).toMatchSnapshot();
    });

    test("boolean", () => {
        const boolean = Type.boolean();

        expect(boolean.toString(writerConfig)).toMatchSnapshot();
    });

    test("nil", () => {
        const nil = Type.nil();

        expect(nil.toString(writerConfig)).toMatchSnapshot();
    });

    test("top", () => {
        const top = Type.top();

        expect(top.toString(writerConfig)).toMatchSnapshot();
    });

    test("bot", () => {
        const bot = Type.bot();

        expect(bot.toString(writerConfig)).toMatchSnapshot();
    });

    test("void", () => {
        const voidType = Type.void();

        expect(voidType.toString(writerConfig)).toMatchSnapshot();
    });

    test("boolish", () => {
        const boolish = Type.boolish();

        expect(boolish.toString(writerConfig)).toMatchSnapshot();
    });

    test("string", () => {
        const string = Type.string();

        expect(string.toString(writerConfig)).toMatchSnapshot();
    });

    test("integer", () => {
        const integer = Type.integer();

        expect(integer.toString(writerConfig)).toMatchSnapshot();
    });

    test("unions", () => {
        const union = Type.union([Type.string(), Type.integer()]);

        expect(union.toString(writerConfig)).toMatchSnapshot();
    });

    test("array", () => {
        const array = Type.array(Type.string());

        expect(array.toString(writerConfig)).toMatchSnapshot();
    });

    test("hash", () => {
        const hash = Type.hash(Type.string(), Type.integer());

        expect(hash.toString(writerConfig)).toMatchSnapshot();
    });

    test("generics", () => {
        const generic = Type.generic("Foo", [Type.string(), Type.integer()]);

        expect(generic.toString(writerConfig)).toMatchSnapshot();
    });
});
