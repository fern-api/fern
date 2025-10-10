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
                    fromSymbol: moduleSymbol,
                    toSymbol: "Swift.String"
                });

                expect(ref.toString()).toBe("String");
            });

            it("from a custom type scope", () => {
                const registry = TargetSymbolRegistry.create();
                registry.registerModule("Acme");

                const userSymbol = registry.registerType("User");
                registry.registerType("Post");

                const ref = registry.reference({
                    fromSymbol: userSymbol,
                    toSymbol: "Swift.String"
                });

                expect(ref.toString()).toBe("String");
            });

            it("from a nested custom type scope", () => {
                const registry = TargetSymbolRegistry.create();
                registry.registerModule("Acme");

                const userSymbol = registry.registerType("User");
                const postSymbol = registry.registerNestedType({
                    parentSymbol: userSymbol,
                    symbolName: "Post"
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

                registry.registerType("User");
                const customStringSymbol = registry.registerType("String");

                const ref = registry.reference({
                    fromSymbol: moduleSymbol,
                    toSymbol: customStringSymbol
                });

                expect(ref.toString()).toBe("String");
            });

            it("from a custom type scope", () => {
                const registry = TargetSymbolRegistry.create();
                registry.registerModule("Acme");

                const userSymbol = registry.registerType("User");
                const customStringSymbol = registry.registerType("String");

                const ref = registry.reference({
                    fromSymbol: userSymbol,
                    toSymbol: customStringSymbol
                });

                expect(ref.toString()).toBe("String");
            });

            it("from a nested custom type scope", () => {
                const registry = TargetSymbolRegistry.create();
                registry.registerModule("Acme");

                const userSymbol = registry.registerType("User");
                const postSymbol = registry.registerNestedType({
                    parentSymbol: userSymbol,
                    symbolName: "Post"
                });

                const customStringSymbol = registry.registerType("String");

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

                registry.registerType("User");
                registry.registerType("String");

                const ref = registry.reference({
                    fromSymbol: moduleSymbol,
                    toSymbol: "Swift.String"
                });

                expect(ref.toString()).toBe("Swift.String");
            });

            it("from a custom type scope", () => {
                const registry = TargetSymbolRegistry.create();
                registry.registerModule("Acme");

                const userSymbol = registry.registerType("User");
                registry.registerType("String");

                const ref = registry.reference({
                    fromSymbol: userSymbol,
                    toSymbol: "Swift.String"
                });

                expect(ref.toString()).toBe("Swift.String");
            });

            it("from a nested custom type scope", () => {
                const registry = TargetSymbolRegistry.create();
                registry.registerModule("Acme");

                const userSymbol = registry.registerType("User");
                registry.registerType("String");
                const postSymbol = registry.registerNestedType({
                    parentSymbol: userSymbol,
                    symbolName: "Post"
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
                registry.registerType("User");
                const postSymbol = registry.registerType("Post");
                const customDateSymbol = registry.registerNestedType({
                    parentSymbol: postSymbol,
                    symbolName: "Date"
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
                const userSymbol = registry.registerType("User");
                const postSymbol = registry.registerType("Post");
                const customDateSymbol = registry.registerNestedType({
                    parentSymbol: postSymbol,
                    symbolName: "Date"
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
                registry.registerType("User");
                const postSymbol = registry.registerType("Post");
                const contentSymbol = registry.registerNestedType({
                    parentSymbol: postSymbol,
                    symbolName: "Content"
                });
                const customDateSymbol = registry.registerNestedType({
                    parentSymbol: postSymbol,
                    symbolName: "Date"
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
                const userSymbol = registry.registerType("User");
                const emailSymbolId = registry.registerNestedType({
                    parentSymbol: userSymbol,
                    symbolName: "Email"
                });
                const postSymbolId = registry.registerType("Post");
                const customDateSymbolId = registry.registerNestedType({
                    parentSymbol: postSymbolId,
                    symbolName: "Date"
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
                registry.registerType("User");
                const postSymbol = registry.registerType("Post");
                registry.registerNestedType({
                    parentSymbol: postSymbol,
                    symbolName: "Date"
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
                const userSymbol = registry.registerType("User");
                const postSymbol = registry.registerType("Post");
                registry.registerNestedType({
                    parentSymbol: postSymbol,
                    symbolName: "Date"
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
                registry.registerType("User");
                const postSymbol = registry.registerType("Post");
                const contentSymbol = registry.registerNestedType({
                    parentSymbol: postSymbol,
                    symbolName: "Content"
                });
                registry.registerNestedType({
                    parentSymbol: postSymbol,
                    symbolName: "Date"
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
                const userSymbol = registry.registerType("User");
                const emailSymbol = registry.registerNestedType({
                    parentSymbol: userSymbol,
                    symbolName: "Email"
                });
                const postSymbol = registry.registerType("Post");
                registry.registerNestedType({
                    parentSymbol: postSymbol,
                    symbolName: "Date"
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
