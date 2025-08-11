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

        expect(untyped.typeDefinitionToString(writerConfig)).toMatchSnapshot();
    });

    test("self", () => {
        const self = Type.self();

        expect(self.typeDefinitionToString(writerConfig)).toMatchSnapshot();
    });

    test("class", () => {
        const classType = Type.class_({
            name: "Client",
            modules: ["MyApi", "V1"]
        });

        expect(classType.typeDefinitionToString(writerConfig)).toMatchSnapshot();
    });

    test("instance", () => {
        const instance = Type.instance();

        expect(instance.typeDefinitionToString(writerConfig)).toMatchSnapshot();
    });

    test("boolean", () => {
        const boolean = Type.boolean();

        expect(boolean.typeDefinitionToString(writerConfig)).toMatchSnapshot();
    });

    test("nil", () => {
        const nil = Type.nil();

        expect(nil.typeDefinitionToString(writerConfig)).toMatchSnapshot();
    });

    test("top", () => {
        const top = Type.top();

        expect(top.typeDefinitionToString(writerConfig)).toMatchSnapshot();
    });

    test("bot", () => {
        const bot = Type.bot();

        expect(bot.typeDefinitionToString(writerConfig)).toMatchSnapshot();
    });

    test("void", () => {
        const voidType = Type.void();

        expect(voidType.typeDefinitionToString(writerConfig)).toMatchSnapshot();
    });

    test("boolish", () => {
        const boolish = Type.boolish();

        expect(boolish.typeDefinitionToString(writerConfig)).toMatchSnapshot();
    });

    test("string", () => {
        const string = Type.string();

        expect(string.typeDefinitionToString(writerConfig)).toMatchSnapshot();
    });

    test("integer", () => {
        const integer = Type.integer();

        expect(integer.typeDefinitionToString(writerConfig)).toMatchSnapshot();
    });

    test("unions", () => {
        const union = Type.union([Type.string(), Type.integer()]);

        expect(union.typeDefinitionToString(writerConfig)).toMatchSnapshot();
    });

    test("array", () => {
        const array = Type.array(Type.string());

        expect(array.typeDefinitionToString(writerConfig)).toMatchSnapshot();
    });

    test("hash", () => {
        const hash = Type.hash(Type.string(), Type.integer());

        expect(hash.typeDefinitionToString(writerConfig)).toMatchSnapshot();
    });

    test("generics", () => {
        const generic = Type.generic("Foo", [Type.string(), Type.integer()]);

        expect(generic.typeDefinitionToString(writerConfig)).toMatchSnapshot();
    });
});
