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

    describe("fullyQualifiedNamespace", () => {
        test("returns only name when not in any namespace", () => {
            const module = ruby.module({ name: "Foobar" });

            expect(module.fullyQualifiedNamespace).toEqual("Foobar");
        });

        test("returns full namespace", () => {
            const module = ruby.module({ name: "Child", namespace: new Set([ruby.module({ name: "Parent" })]) });

            expect(module.fullyQualifiedNamespace).toEqual("Parent::Child");
        });
    });

    describe("populateChildNamespaces", () => {
        test("includes full ancestry", () => {
            const child = ruby.class_({ name: "Child" });
            const parent = ruby.module({ name: "Parent", statements: [child] });
            const grandparent = ruby.module({ name: "Grandparent", statements: [parent] });

            expect(child.namespace).toEqual(new Set([grandparent, parent]));
            expect(parent.namespace).toEqual(new Set([grandparent]));
            expect(grandparent.namespace).toEqual(new Set([]));
        });
    });
});
