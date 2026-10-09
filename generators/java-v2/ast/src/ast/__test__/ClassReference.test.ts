import { describe, expect, it } from "vitest";
import { ClassReference } from "../ClassReference.js";
import { Writer } from "../core/Writer.js";

function makeWriter(): Writer {
    return new Writer({ packageName: "com.example", customConfig: {} as never });
}

describe("ClassReference", () => {
    describe("without enclosingClasses", () => {
        it("writes the simple class name and imports the full package path", () => {
            const ref = new ClassReference({ name: "Foo", packageName: "com.example.types" });
            const writer = makeWriter();
            ref.write(writer);
            expect(writer.toString()).toBe("Foo");
            expect([...writer.getImports()]).toContain("com.example.types.Foo");
        });

        it("writes the fully qualified name when fullyQualified is true", () => {
            const ref = new ClassReference({ name: "Foo", packageName: "com.example.types", fullyQualified: true });
            const writer = makeWriter();
            ref.write(writer);
            expect(writer.toString()).toBe("com.example.types.Foo");
        });
    });

    describe("with enclosingClasses (nested class)", () => {
        it("writes Parent.Child and imports only the outermost class", () => {
            const ref = new ClassReference({
                name: "Child",
                packageName: "com.example.types",
                enclosingClasses: ["Parent"]
            });
            const writer = makeWriter();
            ref.write(writer);
            // Written name uses dotted path
            expect(writer.toString()).toBe("Parent.Child");
            // Import is for the top-level class only — NOT Parent.Child
            expect([...writer.getImports()]).toContain("com.example.types.Parent");
            expect([...writer.getImports()]).not.toContain("com.example.types.Parent.Child");
            expect([...writer.getImports()]).not.toContain("com.example.types.Child");
        });

        it("writes A.B.C and imports only the outermost class for deep nesting", () => {
            const ref = new ClassReference({
                name: "C",
                packageName: "com.example.types",
                enclosingClasses: ["A", "B"]
            });
            const writer = makeWriter();
            ref.write(writer);
            expect(writer.toString()).toBe("A.B.C");
            expect([...writer.getImports()]).toContain("com.example.types.A");
            expect([...writer.getImports()]).not.toContain("com.example.types.A.B");
            expect([...writer.getImports()]).not.toContain("com.example.types.A.B.C");
        });

        it("writes the fully qualified dotted path when fullyQualified is true", () => {
            const ref = new ClassReference({
                name: "Bar",
                packageName: "com.example.requests",
                enclosingClasses: ["PostRootRequest"],
                fullyQualified: true
            });
            const writer = makeWriter();
            ref.write(writer);
            expect(writer.toString()).toBe("com.example.requests.PostRootRequest.Bar");
        });

        it("defaults enclosingClasses to empty array", () => {
            const ref = new ClassReference({ name: "Solo", packageName: "com.example" });
            expect(ref.enclosingClasses).toEqual([]);
        });
    });
});
