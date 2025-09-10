import { ruby } from "../..";
import { BaseRubyCustomConfigSchema } from "../../custom-config/BaseRubyCustomConfigSchema";
import { Writer } from "../core/Writer";
import { Type } from "../Type";
import { Variance } from "../TypeParameter";

describe("TypeParameter", () => {
    let writerConfig: Writer.Args;

    beforeEach(() => {
        writerConfig = { customConfig: BaseRubyCustomConfigSchema.parse({ clientClassName: "Example" }) };
    });

    describe("writeTypeDefinition", () => {
        test("writes basic type parameter", () => {
            const tp = ruby.typeParameter({ name: "K" });

            expect(tp.typeDefinitionToString(writerConfig)).toMatchSnapshot();
        });

        test("writes unchecked type parameter", () => {
            const tp = ruby.typeParameter({ name: "K", unchecked: true });

            expect(tp.typeDefinitionToString(writerConfig)).toMatchSnapshot();
        });

        test("writes bound type parameters", () => {
            const tp = ruby.typeParameter({ name: "K", bound: Type.string() });

            expect(tp.typeDefinitionToString(writerConfig)).toMatchSnapshot();
        });

        test("writes covariant type parameters", () => {
            const tp = ruby.typeParameter({ name: "K", variance: Variance.Covariant });

            expect(tp.typeDefinitionToString(writerConfig)).toMatchSnapshot();
        });

        test("writes contravariant type parameters", () => {
            const tp = ruby.typeParameter({ name: "K", variance: Variance.Contravariant });

            expect(tp.typeDefinitionToString(writerConfig)).toMatchSnapshot();
        });

        test("write type parameter with default type", () => {
            const tp = ruby.typeParameter({ name: "K", defaultType: Type.string() });

            expect(tp.typeDefinitionToString(writerConfig)).toMatchSnapshot();
        });

        test("writes type parameter with mixture of options", () => {
            const tp = ruby.typeParameter({
                name: "K",
                unchecked: true,
                variance: Variance.Contravariant,
                bound: Type.object("Object"),
                defaultType: Type.string()
            });

            expect(tp.typeDefinitionToString(writerConfig)).toMatchSnapshot();
        });
    });
});
