import { python } from "../..";
import { Writer } from "../core/Writer";

describe("ClassReference", () => {
    let writer: Writer;

    beforeEach(() => {
        writer = new Writer();
    });

    describe("toString", () => {
        it("returns the fully qualified name", () => {
            const classRef = python.classReference({ name: "MyClass", modulePath: ["module", "submodule"] });
            expect(classRef.toString()).toBe("MyClass");
        });

        it("handles single-level module path", () => {
            const classRef = python.classReference({ name: "SimpleClass", modulePath: ["simple"] });
            expect(classRef.toString()).toBe("SimpleClass");
        });

        it("handles class without module path", () => {
            const classRef = python.classReference({ name: "StandaloneClass", modulePath: [] });
            expect(classRef.toString()).toBe("StandaloneClass");
        });

        it("handles deeply nested module path", () => {
            const classRef = python.classReference({
                name: "DeepClass",
                modulePath: ["very", "deep", "nested", "module"]
            });
            expect(classRef.toString()).toBe("DeepClass");
        });
    });
});
