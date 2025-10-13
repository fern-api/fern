import { TargetSymbolRegistry } from "../target-symbol-registry";

describe("TargetSymbolRegistry", () => {
    describe("for no name collisions with Swift types", () => {
        describe("correctly resolves type reference to Swift type", () => {
            it("from module scope", () => {
                const registry = TargetSymbolRegistry.create();
                const moduleSymbol = registry.registerModule("Acme");

                registry.registerType("User", { type: "struct" });
                registry.registerType("Post", { type: "struct" });

                const ref = registry.reference({
                    fromSymbol: moduleSymbol,
                    toSymbol: "Swift.String"
                });

                expect(ref.toString()).toBe("String");
            });

            it("from a custom type scope", () => {
                const registry = TargetSymbolRegistry.create();
                registry.registerModule("Acme");

                const userSymbol = registry.registerType("User", { type: "struct" });
                registry.registerType("Post", { type: "struct" });

                const ref = registry.reference({
                    fromSymbol: userSymbol,
                    toSymbol: "Swift.String"
                });

                expect(ref.toString()).toBe("String");
            });

            it("from a nested custom type scope", () => {
                const registry = TargetSymbolRegistry.create();
                registry.registerModule("Acme");

                const userSymbol = registry.registerType("User", { type: "struct" });
                const postSymbol = registry.registerNestedType({
                    parentSymbol: userSymbol,
                    symbolName: "Post",
                    shape: { type: "struct" }
                });

                const ref = registry.reference({
                    fromSymbol: postSymbol,
                    toSymbol: "Swift.String"
                });

                expect(ref.toString()).toBe("String");
            });
        });
    });

    describe("for a top level type name collision with a Swift type", () => {
        describe("correctly resolves type reference to custom type", () => {
            it("from module scope", () => {
                const registry = TargetSymbolRegistry.create();
                const moduleSymbol = registry.registerModule("Acme");

                registry.registerType("User", { type: "struct" });
                const customStringSymbol = registry.registerType("String", { type: "struct" });

                const ref = registry.reference({
                    fromSymbol: moduleSymbol,
                    toSymbol: customStringSymbol
                });

                expect(ref.toString()).toBe("String");
            });

            it("from a custom type scope", () => {
                const registry = TargetSymbolRegistry.create();
                registry.registerModule("Acme");

                const userSymbol = registry.registerType("User", { type: "struct" });
                const customStringSymbol = registry.registerType("String", { type: "struct" });

                const ref = registry.reference({
                    fromSymbol: userSymbol,
                    toSymbol: customStringSymbol
                });

                expect(ref.toString()).toBe("String");
            });

            it("from a nested custom type scope", () => {
                const registry = TargetSymbolRegistry.create();
                registry.registerModule("Acme");

                const userSymbol = registry.registerType("User", { type: "struct" });
                const postSymbol = registry.registerNestedType({
                    parentSymbol: userSymbol,
                    symbolName: "Post",
                    shape: { type: "struct" }
                });

                const customStringSymbol = registry.registerType("String", { type: "struct" });

                const ref = registry.reference({
                    fromSymbol: postSymbol,
                    toSymbol: customStringSymbol
                });

                expect(ref.toString()).toBe("String");
            });
        });

        describe("correctly resolves type reference to Swift type", () => {
            it("from module scope", () => {
                const registry = TargetSymbolRegistry.create();
                const moduleSymbol = registry.registerModule("Acme");

                registry.registerType("User", { type: "struct" });
                registry.registerType("String", { type: "struct" });

                const ref = registry.reference({
                    fromSymbol: moduleSymbol,
                    toSymbol: "Swift.String"
                });

                expect(ref.toString()).toBe("Swift.String");
            });

            it("from a custom type scope", () => {
                const registry = TargetSymbolRegistry.create();
                registry.registerModule("Acme");

                const userSymbol = registry.registerType("User", { type: "struct" });
                registry.registerType("String", { type: "struct" });

                const ref = registry.reference({
                    fromSymbol: userSymbol,
                    toSymbol: "Swift.String"
                });

                expect(ref.toString()).toBe("Swift.String");
            });

            it("from a nested custom type scope", () => {
                const registry = TargetSymbolRegistry.create();
                registry.registerModule("Acme");

                const userSymbol = registry.registerType("User", { type: "struct" });
                registry.registerType("String", { type: "struct" });
                const postSymbol = registry.registerNestedType({
                    parentSymbol: userSymbol,
                    symbolName: "Post",
                    shape: { type: "struct" }
                });

                const ref = registry.reference({
                    fromSymbol: postSymbol,
                    toSymbol: "Swift.String"
                });

                expect(ref.toString()).toBe("Swift.String");
            });
        });
    });

    describe("for a nested type name collision with a Foundation type", () => {
        describe("correctly resolves type reference to custom type", () => {
            it("from module scope", () => {
                const registry = TargetSymbolRegistry.create();
                const moduleSymbol = registry.registerModule("Acme");
                registry.registerType("User", { type: "struct" });
                const postSymbol = registry.registerType("Post", { type: "struct" });
                const customDateSymbol = registry.registerNestedType({
                    parentSymbol: postSymbol,
                    symbolName: "Date",
                    shape: { type: "struct" }
                });
                const ref = registry.reference({
                    fromSymbol: moduleSymbol,
                    toSymbol: customDateSymbol
                });
                expect(ref.toString()).toBe("Post.Date");
            });

            it("from a custom type scope", () => {
                const registry = TargetSymbolRegistry.create();
                registry.registerModule("Acme");
                const userSymbol = registry.registerType("User", { type: "struct" });
                const postSymbol = registry.registerType("Post", { type: "struct" });
                const customDateSymbol = registry.registerNestedType({
                    parentSymbol: postSymbol,
                    symbolName: "Date",
                    shape: { type: "struct" }
                });
                const ref = registry.reference({
                    fromSymbol: userSymbol,
                    toSymbol: customDateSymbol
                });
                expect(ref.toString()).toBe("Post.Date");
            });

            it("from a sibling custom type scope", () => {
                const registry = TargetSymbolRegistry.create();
                registry.registerModule("Acme");
                registry.registerType("User", { type: "struct" });
                const postSymbol = registry.registerType("Post", { type: "struct" });
                const contentSymbol = registry.registerNestedType({
                    parentSymbol: postSymbol,
                    symbolName: "Content",
                    shape: { type: "struct" }
                });
                const customDateSymbol = registry.registerNestedType({
                    parentSymbol: postSymbol,
                    symbolName: "Date",
                    shape: { type: "struct" }
                });
                const ref = registry.reference({
                    fromSymbol: contentSymbol,
                    toSymbol: customDateSymbol
                });
                expect(ref.toString()).toBe("Date");
            });

            it("from a nested custom type in a different scope", () => {
                const registry = TargetSymbolRegistry.create();
                registry.registerModule("Acme");
                const userSymbol = registry.registerType("User", { type: "struct" });
                const emailSymbolId = registry.registerNestedType({
                    parentSymbol: userSymbol,
                    symbolName: "Email",
                    shape: { type: "struct" }
                });
                const postSymbolId = registry.registerType("Post", { type: "struct" });
                const customDateSymbolId = registry.registerNestedType({
                    parentSymbol: postSymbolId,
                    symbolName: "Date",
                    shape: { type: "struct" }
                });
                const ref = registry.reference({
                    fromSymbol: emailSymbolId,
                    toSymbol: customDateSymbolId
                });
                expect(ref.toString()).toBe("Post.Date");
            });
        });

        describe("correctly resolves type reference to Foundation type", () => {
            it("from module scope", () => {
                const registry = TargetSymbolRegistry.create();
                const moduleSymbol = registry.registerModule("Acme");
                registry.registerType("User", { type: "struct" });
                const postSymbol = registry.registerType("Post", { type: "struct" });
                registry.registerNestedType({
                    parentSymbol: postSymbol,
                    symbolName: "Date",
                    shape: { type: "struct" }
                });
                const ref = registry.reference({
                    fromSymbol: moduleSymbol,
                    toSymbol: "Foundation.Date"
                });
                expect(ref.toString()).toBe("Date");
            });

            it("from a custom type scope", () => {
                const registry = TargetSymbolRegistry.create();
                registry.registerModule("Acme");
                const userSymbol = registry.registerType("User", { type: "struct" });
                const postSymbol = registry.registerType("Post", { type: "struct" });
                registry.registerNestedType({
                    parentSymbol: postSymbol,
                    symbolName: "Date",
                    shape: { type: "struct" }
                });
                const ref = registry.reference({
                    fromSymbol: userSymbol,
                    toSymbol: "Foundation.Date"
                });
                expect(ref.toString()).toBe("Date");
            });

            it("from a sibling custom type scope", () => {
                const registry = TargetSymbolRegistry.create();
                registry.registerModule("Acme");
                registry.registerType("User", { type: "struct" });
                const postSymbol = registry.registerType("Post", { type: "struct" });
                const contentSymbol = registry.registerNestedType({
                    parentSymbol: postSymbol,
                    symbolName: "Content",
                    shape: { type: "struct" }
                });
                registry.registerNestedType({
                    parentSymbol: postSymbol,
                    symbolName: "Date",
                    shape: { type: "struct" }
                });
                const ref = registry.reference({
                    fromSymbol: contentSymbol,
                    toSymbol: "Foundation.Date"
                });
                expect(ref.toString()).toBe("Foundation.Date");
            });

            it("from a nested custom type in a different scope", () => {
                const registry = TargetSymbolRegistry.create();
                registry.registerModule("Acme");
                const userSymbol = registry.registerType("User", { type: "struct" });
                const emailSymbol = registry.registerNestedType({
                    parentSymbol: userSymbol,
                    symbolName: "Email",
                    shape: { type: "struct" }
                });
                const postSymbol = registry.registerType("Post", { type: "struct" });
                registry.registerNestedType({
                    parentSymbol: postSymbol,
                    symbolName: "Date",
                    shape: { type: "struct" }
                });
                const ref = registry.reference({
                    fromSymbol: emailSymbol,
                    toSymbol: "Foundation.Date"
                });
                expect(ref.toString()).toBe("Date");
            });
        });
    });
});
