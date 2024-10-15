import { python } from "../..";
import { Writer } from "../core/Writer";

describe("ClassReference", () => {
    let writer: Writer;

    beforeEach(() => {
        writer = new Writer();
    });

    describe("toString", () => {
        it("returns the fully qualified name", () => {
            const classRef = python.classReference("MyClass", ["module", "submodule"]);
            expect(classRef.toString()).toBe("MyClass");
        });

        it("handles single-level module path", () => {
            const classRef = python.classReference("SimpleClass", ["simple"]);
            expect(classRef.toString()).toBe("SimpleClass");
        });

        it("handles class without module path", () => {
            const classRef = python.classReference("StandaloneClass", []);
            expect(classRef.toString()).toBe("StandaloneClass");
        });

        it("handles deeply nested module path", () => {
            const classRef = python.classReference("DeepClass", ["very", "deep", "nested", "module"]);
            expect(classRef.toString()).toBe("DeepClass");
        });
    });
});
