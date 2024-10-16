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

        it("handles class with one generic type", () => {
            const classRef = python.classReference({
                name: "GenericClass",
                modulePath: ["module"],
                genericTypes: [python.Type.str()]
            });
            expect(classRef.toString()).toBe("GenericClass[str]");
        });

        it("handles class with two generic types", () => {
            const classRef = python.classReference({
                name: "DoubleGenericClass",
                modulePath: ["module"],
                genericTypes: [python.Type.str(), python.Type.int()]
            });
            expect(classRef.toString()).toBe("DoubleGenericClass[str, int]");
        });
    });

    describe("constructor", () => {
        it("does not throw an error if only the first item in modulePath starts with a '.'", () => {
            expect(() => {
                python.classReference({
                    name: "ValidClass",
                    modulePath: [".", "path"]
                });
            }).not.toThrow();
        });

        it("throws an error if an item other than the first in modulePath starts with a '.'", () => {
            expect(() => {
                python.classReference({
                    name: "ErrorClass",
                    modulePath: ["valid", ".invalid", "path"]
                });
            }).toThrow("Only the first item in modulePath may start with a '.'");
        });

        it("throws an error if the first item starts with a '.' but contains other characters", () => {
            expect(() => {
                python.classReference({
                    name: "ErrorClass",
                    modulePath: [".invalid_start", "path"]
                });
            }).toThrow("If the first item in modulePath starts with '.', it must only contain '.' characters");
        });
    });
});
