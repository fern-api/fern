import { python } from "..";
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
            expect(reference.getReferences().length).toBe(1);
        });

        it("handles single-level module path", async () => {
            const reference = python.reference({ name: "SimpleClass", modulePath: ["simple"] });
            reference.write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
            expect(reference.getReferences().length).toBe(1);
        });

        it("handles class without module path", async () => {
            const reference = python.reference({ name: "StandaloneClass", modulePath: [] });
            reference.write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
            expect(reference.getReferences().length).toBe(1);
        });

        it("handles deeply nested module path", async () => {
            const reference = python.reference({
                name: "DeepClass",
                modulePath: ["very", "deep", "nested", "module"]
            });
            reference.write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
            expect(reference.getReferences().length).toBe(1);
        });

        it("handles class with one generic type", async () => {
            const reference = python.reference({
                name: "GenericClass",
                modulePath: ["module"],
                genericTypes: [python.Type.str()]
            });
            reference.write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
            expect(reference.getReferences().length).toBe(1);
        });

        it("handles class with two generic types", async () => {
            const reference = python.reference({
                name: "DoubleGenericClass",
                modulePath: ["module"],
                genericTypes: [python.Type.str(), python.Type.int()]
            });
            reference.write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
            expect(reference.getReferences().length).toBe(1);
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
                            name: otherClassReference.name,
                            modulePath: otherClassReference.modulePath
                        })
                    )
                ]
            });
            reference.write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
            expect(reference.getReferences().length).toBe(2);
        });

        it("handles class with alias", async () => {
            const reference = python.reference({
                name: "AliasClass",
                modulePath: ["module"],
                alias: "Alias"
            });
            reference.write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
            expect(reference.getReferences().length).toBe(1);
        });

        it("handles list with reference as inner type", async () => {
            const innerReference = python.reference({
                name: "InnerClass",
                modulePath: ["inner_module"]
            });
            const listType = python.Type.list(python.Type.reference(innerReference));
            listType.write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
            expect(listType.getReferences().length).toBe(2);
        });

        it("handles tuple with reference as inner type", async () => {
            const innerReference = python.reference({
                name: "InnerClass",
                modulePath: ["inner_module"]
            });
            const tupleType = python.Type.tuple([python.Type.reference(innerReference), python.Type.str()]);
            tupleType.write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
            expect(tupleType.getReferences().length).toBe(2);
        });

        it("handles set with reference as inner type", async () => {
            const innerReference = python.reference({
                name: "InnerClass",
                modulePath: ["inner_module"]
            });
            const setType = python.Type.set(python.Type.reference(innerReference));
            setType.write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
            expect(setType.getReferences().length).toBe(2);
        });

        it("handles union with reference as inner type", async () => {
            const innerReference = python.reference({
                name: "InnerClass",
                modulePath: ["inner_module"]
            });
            const unionType = python.Type.union([python.Type.reference(innerReference), python.Type.str()]);
            unionType.write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
            expect(unionType.getReferences().length).toBe(2);
        });

        it("handles dict with reference as inner type", async () => {
            const innerReference = python.reference({
                name: "InnerClass",
                modulePath: ["inner_module"]
            });
            const dictType = python.Type.dict(python.Type.str(), python.Type.reference(innerReference));
            const reference = python.reference({
                name: "DictClass",
                modulePath: ["module"],
                genericTypes: [dictType]
            });
            reference.write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
            expect(reference.getReferences().length).toBe(3);
        });

        it("handles reference with attr path", async () => {
            const reference = python.reference({
                name: "AttrPathClass",
                modulePath: ["module"],
                attribute: ["attr1", "attr2"]
            });
            reference.write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
        });
    });
});
