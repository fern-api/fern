import { python } from "../..";
import { Writer } from "../core/Writer";

describe("Reference", () => {
    let writer: Writer;

    beforeEach(() => {
        writer = new Writer();
    });

    describe("toString", () => {
        it("returns the fully qualified name", () => {
            const reference = python.reference({ name: "MyClass", modulePath: ["module", "submodule"] });
            expect(reference.toString()).toBe("MyClass");
        });

        it("handles single-level module path", () => {
            const reference = python.reference({ name: "SimpleClass", modulePath: ["simple"] });
            expect(reference.toString()).toBe("SimpleClass");
        });

        it("handles class without module path", () => {
            const reference = python.reference({ name: "StandaloneClass", modulePath: [] });
            expect(reference.toString()).toBe("StandaloneClass");
        });

        it("handles deeply nested module path", () => {
            const reference = python.reference({
                name: "DeepClass",
                modulePath: ["very", "deep", "nested", "module"]
            });
            expect(reference.toString()).toBe("DeepClass");
        });

        it("handles class with one generic type", () => {
            const reference = python.reference({
                name: "GenericClass",
                modulePath: ["module"],
                genericTypes: [python.Type.str()]
            });
            expect(reference.toString()).toBe("GenericClass[str]");
        });

        it("handles class with two generic types", () => {
            const reference = python.reference({
                name: "DoubleGenericClass",
                modulePath: ["module"],
                genericTypes: [python.Type.str(), python.Type.int()]
            });
            expect(reference.toString()).toBe("DoubleGenericClass[str, int]");
        });

        it("handles class with alias", () => {
            const reference = python.reference({
                name: "AliasClass",
                modulePath: ["module"],
                alias: "Alias"
            });
            expect(reference.toString()).toBe("AliasClass as Alias");
        });
    });
});
