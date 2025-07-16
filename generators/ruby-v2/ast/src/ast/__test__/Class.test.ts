import { ruby } from "../..";
import { BaseRubyCustomConfigSchema } from "../../custom-config/BaseRubyCustomConfigSchema";
import { MethodKind } from "../Method";
import { Type } from "../Type";
import { Writer } from "../core/Writer";

describe("Class", () => {
    let writerConfig: Writer.Args;

    beforeEach(() => {
        writerConfig = { customConfig: BaseRubyCustomConfigSchema.parse({ clientClassName: "Example" }) };
    });

    test("writes empty class", () => {
        const class_ = ruby.class_({ name: "Foobar" });

        expect(class_.toString(writerConfig)).toMatchSnapshot();
    });

    test("writes class with superclass", () => {
        const superclass = ruby.class_({ name: "Parent" });
        const class_ = ruby.class_({ name: "Child", superclass });

        expect(class_.toString(writerConfig)).toMatchSnapshot();
    });

    test("writes class with a body", () => {
        const class_ = ruby.class_({
            name: "Foobar",
            statements: [
                ruby.method({
                    name: "initialize",
                    parameters: { positional: [ruby.parameters.positional({ name: "name", type: Type.string() })] },
                    returnType: Type.void()
                }),
                ruby.method({
                    name: "build",
                    kind: MethodKind.Class_,
                    parameters: { keyword: [ruby.parameters.keyword({ name: "name", type: Type.string() })] },
                    returnType: Type.instance()
                }),
                ruby.method({ name: "call", returnType: Type.string() })
            ]
        });

        expect(class_.toString(writerConfig)).toMatchSnapshot();
    });

    test("writes class with docstring", () => {
        const class_ = ruby.class_({
            name: "Foobar",
            docstring: "A class that does foobar"
        });

        expect(class_.toString(writerConfig)).toMatchSnapshot();
    });

    describe("type definitions", () => {
        test("writes class type definition", () => {
            const class_ = ruby.class_({ name: "Foobar" });

            expect(class_.typeDefinitionToString(writerConfig)).toMatchSnapshot();
        });

        test("write class with type parameters", () => {
            const class_ = ruby.class_({ name: "Foobar", typeParameters: [ruby.typeParameter({ name: "K" })] });

            expect(class_.typeDefinitionToString(writerConfig)).toMatchSnapshot();
        });

        test("writes class with method type definitions", () => {
            const class_ = ruby.class_({
                name: "Foobar",
                statements: [
                    ruby.method({
                        name: "initialize",
                        parameters: { positional: [ruby.parameters.positional({ name: "name", type: Type.string() })] },
                        returnType: Type.void()
                    }),
                    ruby.method({
                        name: "build",
                        kind: MethodKind.Class_,
                        parameters: { keyword: [ruby.parameters.keyword({ name: "name", type: Type.string() })] },
                        returnType: Type.instance()
                    }),
                    ruby.method({ name: "call", returnType: Type.string() })
                ]
            });

            expect(class_.typeDefinitionToString(writerConfig)).toMatchSnapshot();
        });
    });
});
