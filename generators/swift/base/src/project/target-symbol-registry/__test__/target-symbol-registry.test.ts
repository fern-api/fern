import { TargetSymbolRegistry } from "../target-symbol-registry";

describe("TargetSymbolRegistry", () => {
    describe("for no name collisions with Swift types", () => {
        describe("correctly resolves type reference to Swift type", () => {
            it("from module scope", () => {
                const registry = TargetSymbolRegistry.create();
                const moduleSymbol = registry.registerModule("Acme");

                registry.registerType("User");
                registry.registerType("Post");

                const ref = registry.reference({
                    fromSymbolId: moduleSymbol.id,
                    toSymbolId: "Swift.String"
                });

                expect(ref.toString()).toBe("String");
            });

            it("from a custom type scope", () => {
                const registry = TargetSymbolRegistry.create();
                registry.registerModule("Acme");

                const userSymbol = registry.registerType("User");
                registry.registerType("Post");

                const ref = registry.reference({
                    fromSymbolId: userSymbol.id,
                    toSymbolId: "Swift.String"
                });

                expect(ref.toString()).toBe("String");
            });

            it("from a nested custom type scope", () => {
                const registry = TargetSymbolRegistry.create();
                registry.registerModule("Acme");

                const userSymbol = registry.registerType("User");
                const postSymbol = registry.registerNestedType({
                    parentSymbolId: userSymbol.id,
                    symbolName: "Post"
                });

                const ref = registry.reference({
                    fromSymbolId: postSymbol.id,
                    toSymbolId: "Swift.String"
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

                registry.registerType("User");
                const customStringSymbol = registry.registerType("String");

                const ref = registry.reference({
                    fromSymbolId: moduleSymbol.id,
                    toSymbolId: customStringSymbol.id
                });

                expect(ref.toString()).toBe("String");
            });

            it("from a custom type scope", () => {
                const registry = TargetSymbolRegistry.create();
                registry.registerModule("Acme");

                const userSymbol = registry.registerType("User");
                const customStringSymbol = registry.registerType("String");

                const ref = registry.reference({
                    fromSymbolId: userSymbol.id,
                    toSymbolId: customStringSymbol.id
                });

                expect(ref.toString()).toBe("String");
            });

            it("from a nested custom type scope", () => {
                const registry = TargetSymbolRegistry.create();
                registry.registerModule("Acme");

                const userSymbol = registry.registerType("User");
                const postSymbol = registry.registerNestedType({
                    parentSymbolId: userSymbol.id,
                    symbolName: "Post"
                });

                const customStringSymbol = registry.registerType("String");

                const ref = registry.reference({
                    fromSymbolId: postSymbol.id,
                    toSymbolId: customStringSymbol.id
                });

                expect(ref.toString()).toBe("String");
            });
        });

        describe("correctly resolves type reference to Swift type", () => {
            it("from module scope", () => {
                const registry = TargetSymbolRegistry.create();
                const moduleSymbol = registry.registerModule("Acme");

                registry.registerType("User");
                registry.registerType("String");

                const ref = registry.reference({
                    fromSymbolId: moduleSymbol.id,
                    toSymbolId: "Swift.String"
                });

                expect(ref.toString()).toBe("Swift.String");
            });

            it("from a custom type scope", () => {
                const registry = TargetSymbolRegistry.create();
                registry.registerModule("Acme");

                const userSymbol = registry.registerType("User");
                registry.registerType("String");

                const ref = registry.reference({
                    fromSymbolId: userSymbol.id,
                    toSymbolId: "Swift.String"
                });

                expect(ref.toString()).toBe("Swift.String");
            });

            it("from a nested custom type scope", () => {
                const registry = TargetSymbolRegistry.create();
                registry.registerModule("Acme");

                const userSymbol = registry.registerType("User");
                registry.registerType("String");
                const postSymbol = registry.registerNestedType({
                    parentSymbolId: userSymbol.id,
                    symbolName: "Post"
                });

                const ref = registry.reference({
                    fromSymbolId: postSymbol.id,
                    toSymbolId: "Swift.String"
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
                registry.registerType("User");
                const postSymbol = registry.registerType("Post");
                const customDateSymbol = registry.registerNestedType({
                    parentSymbolId: postSymbol.id,
                    symbolName: "Date"
                });
                const ref = registry.reference({
                    fromSymbolId: moduleSymbol.id,
                    toSymbolId: customDateSymbol.id
                });
                expect(ref.toString()).toBe("Post.Date");
            });

            it("from a custom type scope", () => {
                const registry = TargetSymbolRegistry.create();
                registry.registerModule("Acme");
                const userSymbol = registry.registerType("User");
                const postSymbol = registry.registerType("Post");
                const customDateSymbol = registry.registerNestedType({
                    parentSymbolId: postSymbol.id,
                    symbolName: "Date"
                });
                const ref = registry.reference({
                    fromSymbolId: userSymbol.id,
                    toSymbolId: customDateSymbol.id
                });
                expect(ref.toString()).toBe("Post.Date");
            });

            it("from a sibling custom type scope", () => {
                const registry = TargetSymbolRegistry.create();
                registry.registerModule("Acme");
                registry.registerType("User");
                const postSymbol = registry.registerType("Post");
                const contentSymbol = registry.registerNestedType({
                    parentSymbolId: postSymbol.id,
                    symbolName: "Content"
                });
                const customDateSymbol = registry.registerNestedType({
                    parentSymbolId: postSymbol.id,
                    symbolName: "Date"
                });
                const ref = registry.reference({
                    fromSymbolId: contentSymbol.id,
                    toSymbolId: customDateSymbol.id
                });
                expect(ref.toString()).toBe("Date");
            });

            it("from a nested custom type in a different scope", () => {
                const registry = TargetSymbolRegistry.create();
                registry.registerModule("Acme");
                const userSymbol = registry.registerType("User");
                const emailSymbol = registry.registerNestedType({
                    parentSymbolId: userSymbol.id,
                    symbolName: "Email"
                });
                const postSymbol = registry.registerType("Post");
                const customDateSymbol = registry.registerNestedType({
                    parentSymbolId: postSymbol.id,
                    symbolName: "Date"
                });
                const ref = registry.reference({
                    fromSymbolId: emailSymbol.id,
                    toSymbolId: customDateSymbol.id
                });
                expect(ref.toString()).toBe("Post.Date");
            });
        });

        describe("correctly resolves type reference to Foundation type", () => {
            it("from module scope", () => {
                const registry = TargetSymbolRegistry.create();
                const moduleSymbol = registry.registerModule("Acme");
                registry.registerType("User");
                const postSymbol = registry.registerType("Post");
                registry.registerNestedType({
                    parentSymbolId: postSymbol.id,
                    symbolName: "Date"
                });
                const ref = registry.reference({
                    fromSymbolId: moduleSymbol.id,
                    toSymbolId: "Foundation.Date"
                });
                expect(ref.toString()).toBe("Date");
            });

            it("from a custom type scope", () => {
                const registry = TargetSymbolRegistry.create();
                registry.registerModule("Acme");
                const userSymbol = registry.registerType("User");
                const postSymbol = registry.registerType("Post");
                registry.registerNestedType({
                    parentSymbolId: postSymbol.id,
                    symbolName: "Date"
                });
                const ref = registry.reference({
                    fromSymbolId: userSymbol.id,
                    toSymbolId: "Foundation.Date"
                });
                expect(ref.toString()).toBe("Date");
            });

            it("from a sibling custom type scope", () => {
                const registry = TargetSymbolRegistry.create();
                registry.registerModule("Acme");
                registry.registerType("User");
                const postSymbol = registry.registerType("Post");
                const contentSymbol = registry.registerNestedType({
                    parentSymbolId: postSymbol.id,
                    symbolName: "Content"
                });
                registry.registerNestedType({
                    parentSymbolId: postSymbol.id,
                    symbolName: "Date"
                });
                const ref = registry.reference({
                    fromSymbolId: contentSymbol.id,
                    toSymbolId: "Foundation.Date"
                });
                expect(ref.toString()).toBe("Foundation.Date");
            });

            it("from a nested custom type in a different scope", () => {
                const registry = TargetSymbolRegistry.create();
                registry.registerModule("Acme");
                const userSymbol = registry.registerType("User");
                const emailSymbol = registry.registerNestedType({
                    parentSymbolId: userSymbol.id,
                    symbolName: "Email"
                });
                const postSymbol = registry.registerType("Post");
                registry.registerNestedType({
                    parentSymbolId: postSymbol.id,
                    symbolName: "Date"
                });
                const ref = registry.reference({
                    fromSymbolId: emailSymbol.id,
                    toSymbolId: "Foundation.Date"
                });
                expect(ref.toString()).toBe("Date");
            });
        });
    });
});
