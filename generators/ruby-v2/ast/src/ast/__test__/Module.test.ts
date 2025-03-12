import { ruby } from "../..";
import { BaseRubyCustomConfigSchema } from "../../custom-config/BaseRubyCustomConfigSchema";
import { MethodKind } from "../Method";
import { Type } from "../Type";
import { Writer } from "../core/Writer";

describe("Module", () => {
    let writerConfig: Writer.Args;

    beforeEach(() => {
        writerConfig = { customConfig: BaseRubyCustomConfigSchema.parse({ clientClassName: "Example" }) };
    });

    test("writes empty module", () => {
        const module = ruby.module({ name: "Foobar" });

        expect(module.toString(writerConfig)).toMatchSnapshot();
    });

    test("writes module with a body", () => {
        const module = ruby.module({
            name: "Foobar",
            statements: [
                ruby.method({
                    name: "build",
                    parameters: { keyword: [ruby.parameters.keyword({ name: "name", type: Type.string() })] },
                    returnType: Type.instance()
                })
            ]
        });

        expect(module.toString(writerConfig)).toMatchSnapshot();
    });

    test("writes module with docstring", () => {
        const module = ruby.module({
            name: "Foobar",
            docstring: "A class that does foobar"
        });

        expect(module.toString(writerConfig)).toMatchSnapshot();
    });

    describe("type definitions", () => {
        test("writes module type definition", () => {
            const module = ruby.module({ name: "Foobar" });

            expect(module.typeDefinitionToString(writerConfig)).toMatchSnapshot();
        });

        test("writes module with method type definitions", () => {
            const module = ruby.module({
                name: "Foobar",
                statements: [
                    ruby.method({
                        name: "build",
                        parameters: { keyword: [ruby.parameters.keyword({ name: "name", type: Type.string() })] },
                        returnType: Type.instance()
                    })
                ]
            });

            expect(module.typeDefinitionToString(writerConfig)).toMatchSnapshot();
        });

        test("writes module with type parameters", () => {
            const module = ruby.module({
                name: "IAmGeneric",
                typeParameters: [ruby.typeParameter({ name: "K" })]
            });

            expect(module.typeDefinitionToString(writerConfig)).toMatchSnapshot();
        });
    });

    describe("fullyQualifiedName", () => {
        test("returns only name when not in any namespace", () => {
            const module = ruby.module({ name: "Foobar" });

            expect(module.fullyQualifiedName).toEqual("Foobar");
        });

        test("returns full namespace", () => {
            const module = ruby.module({ name: "Child", namespace: [ruby.module({ name: "Parent" })] });

            expect(module.fullyQualifiedName).toEqual("Parent::Child");
        });
    });
});
