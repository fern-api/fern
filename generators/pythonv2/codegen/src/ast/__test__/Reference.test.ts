import { python } from "../..";
import { Writer } from "../core/Writer";

describe("Reference", () => {
    let writer: Writer;

    beforeEach(() => {
        writer = new Writer();
    });

    describe("toString", () => {
        it("returns the fully qualified name", async () => {
            const reference = python.reference({ name: "MyClass", modulePath: ["module", "submodule"] });
            reference.write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
        });

        it("handles single-level module path", async () => {
            const reference = python.reference({ name: "SimpleClass", modulePath: ["simple"] });
            reference.write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
        });

        it("handles class without module path", async () => {
            const reference = python.reference({ name: "StandaloneClass", modulePath: [] });
            reference.write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
        });

        it("handles deeply nested module path", async () => {
            const reference = python.reference({
                name: "DeepClass",
                modulePath: ["very", "deep", "nested", "module"]
            });
            reference.write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
        });

        it("handles class with one generic type", async () => {
            const reference = python.reference({
                name: "GenericClass",
                modulePath: ["module"],
                genericTypes: [python.Type.str()]
            });
            reference.write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
        });

        it("handles class with two generic types", async () => {
            const reference = python.reference({
                name: "DoubleGenericClass",
                modulePath: ["module"],
                genericTypes: [python.Type.str(), python.Type.int()]
            });
            reference.write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
        });

        it("handles class with generic type referencing another class", async () => {
            const otherClassReference = python.reference({
                name: "OtherClass",
                modulePath: ["other_module"]
            });
            const reference = python.reference({
                name: "ComplexGenericClass",
                modulePath: ["module"],
                genericTypes: [
                    python.Type.reference(
                        python.reference({
                            name: otherClassReference.getName(),
                            modulePath: otherClassReference.getModulePath()
                        })
                    )
                ]
            });
            reference.write(writer);
            expect(await writer.toString()).toMatchSnapshot();
        });

        it("handles class with alias", async () => {
            const reference = python.reference({
                name: "AliasClass",
                modulePath: ["module"],
                alias: "Alias"
            });
            reference.write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
        });
    });
});
