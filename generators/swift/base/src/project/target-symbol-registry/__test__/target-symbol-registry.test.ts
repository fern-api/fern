import { TargetSymbolRegistry } from "../target-symbol-registry";

describe("TargetSymbolRegistry", () => {
    describe("for no name collisions with Swift types", () => {
        describe("correctly resolves type reference to Swift type", () => {
            it("from module scope", () => {
                const registry = TargetSymbolRegistry.create();
                const moduleSymbolId = registry.registerModule("Acme");

                registry.registerType("User");
                registry.registerType("Post");

                const ref = registry.reference({
                    fromSymbolId: moduleSymbolId,
                    toSymbolId: "Swift.String"
                });

                expect(ref.toString()).toBe("String");
            });

            it("from a custom type scope", () => {
                const registry = TargetSymbolRegistry.create();
                registry.registerModule("Acme");

                const userSymbolId = registry.registerType("User");
                registry.registerType("Post");

                const ref = registry.reference({
                    fromSymbolId: userSymbolId,
                    toSymbolId: "Swift.String"
                });

                expect(ref.toString()).toBe("String");
            });

            it("from a nested custom type scope", () => {
                const registry = TargetSymbolRegistry.create();
                registry.registerModule("Acme");

                const userSymbolId = registry.registerType("User");
                const postSymbolId = registry.registerNestedType({
                    parentSymbolId: userSymbolId,
                    symbolName: "Post"
                });

                const ref = registry.reference({
                    fromSymbolId: postSymbolId,
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
                const moduleSymbolId = registry.registerModule("Acme");

                registry.registerType("User");
                const customStringSymbolId = registry.registerType("String");

                const ref = registry.reference({
                    fromSymbolId: moduleSymbolId,
                    toSymbolId: customStringSymbolId
                });

                expect(ref.toString()).toBe("String");
            });

            it("from a custom type scope", () => {
                const registry = TargetSymbolRegistry.create();
                registry.registerModule("Acme");

                const userSymbolId = registry.registerType("User");
                const customStringSymbolId = registry.registerType("String");

                const ref = registry.reference({
                    fromSymbolId: userSymbolId,
                    toSymbolId: customStringSymbolId
                });

                expect(ref.toString()).toBe("String");
            });

            it("from a nested custom type scope", () => {
                const registry = TargetSymbolRegistry.create();
                registry.registerModule("Acme");

                const userSymbolId = registry.registerType("User");
                const postSymbolId = registry.registerNestedType({
                    parentSymbolId: userSymbolId,
                    symbolName: "Post"
                });

                const customStringSymbolId = registry.registerType("String");

                const ref = registry.reference({
                    fromSymbolId: postSymbolId,
                    toSymbolId: customStringSymbolId
                });

                expect(ref.toString()).toBe("String");
            });
        });

        describe("correctly resolves type reference to Swift type", () => {
            it("from module scope", () => {
                const registry = TargetSymbolRegistry.create();
                const moduleSymbolId = registry.registerModule("Acme");

                registry.registerType("User");
                registry.registerType("String");

                const ref = registry.reference({
                    fromSymbolId: moduleSymbolId,
                    toSymbolId: "Swift.String"
                });

                expect(ref.toString()).toBe("Swift.String");
            });

            it("from a custom type scope", () => {
                const registry = TargetSymbolRegistry.create();
                registry.registerModule("Acme");

                const userSymbolId = registry.registerType("User");
                registry.registerType("String");

                const ref = registry.reference({
                    fromSymbolId: userSymbolId,
                    toSymbolId: "Swift.String"
                });

                expect(ref.toString()).toBe("Swift.String");
            });

            it("from a nested custom type scope", () => {
                const registry = TargetSymbolRegistry.create();
                registry.registerModule("Acme");

                const userSymbolId = registry.registerType("User");
                registry.registerType("String");
                const postSymbolId = registry.registerNestedType({
                    parentSymbolId: userSymbolId,
                    symbolName: "Post"
                });

                const ref = registry.reference({
                    fromSymbolId: postSymbolId,
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
                const moduleSymbolId = registry.registerModule("Acme");
                registry.registerType("User");
                const postSymbolId = registry.registerType("Post");
                const customDateSymbolId = registry.registerNestedType({
                    parentSymbolId: postSymbolId,
                    symbolName: "Date"
                });
                const ref = registry.reference({
                    fromSymbolId: moduleSymbolId,
                    toSymbolId: customDateSymbolId
                });
                expect(ref.toString()).toBe("Post.Date");
            });

            it("from a custom type scope", () => {
                const registry = TargetSymbolRegistry.create();
                registry.registerModule("Acme");
                const userSymbolId = registry.registerType("User");
                const postSymbolId = registry.registerType("Post");
                const customDateSymbolId = registry.registerNestedType({
                    parentSymbolId: postSymbolId,
                    symbolName: "Date"
                });
                const ref = registry.reference({
                    fromSymbolId: userSymbolId,
                    toSymbolId: customDateSymbolId
                });
                expect(ref.toString()).toBe("Post.Date");
            });

            it("from a sibling custom type scope", () => {
                const registry = TargetSymbolRegistry.create();
                registry.registerModule("Acme");
                registry.registerType("User");
                const postSymbolId = registry.registerType("Post");
                const contentSymbolId = registry.registerNestedType({
                    parentSymbolId: postSymbolId,
                    symbolName: "Content"
                });
                const customDateSymbolId = registry.registerNestedType({
                    parentSymbolId: postSymbolId,
                    symbolName: "Date"
                });
                const ref = registry.reference({
                    fromSymbolId: contentSymbolId,
                    toSymbolId: customDateSymbolId
                });
                expect(ref.toString()).toBe("Date");
            });

            it("from a nested custom type in a different scope", () => {
                const registry = TargetSymbolRegistry.create();
                registry.registerModule("Acme");
                const userSymbolId = registry.registerType("User");
                const emailSymbolId = registry.registerNestedType({
                    parentSymbolId: userSymbolId,
                    symbolName: "Email"
                });
                const postSymbolId = registry.registerType("Post");
                const customDateSymbolId = registry.registerNestedType({
                    parentSymbolId: postSymbolId,
                    symbolName: "Date"
                });
                const ref = registry.reference({
                    fromSymbolId: emailSymbolId,
                    toSymbolId: customDateSymbolId
                });
                expect(ref.toString()).toBe("Post.Date");
            });
        });

        describe("correctly resolves type reference to Foundation type", () => {
            it("from module scope", () => {
                const registry = TargetSymbolRegistry.create();
                const moduleSymbolId = registry.registerModule("Acme");
                registry.registerType("User");
                const postSymbolId = registry.registerType("Post");
                registry.registerNestedType({
                    parentSymbolId: postSymbolId,
                    symbolName: "Date"
                });
                const ref = registry.reference({
                    fromSymbolId: moduleSymbolId,
                    toSymbolId: "Foundation.Date"
                });
                expect(ref.toString()).toBe("Date");
            });

            it("from a custom type scope", () => {
                const registry = TargetSymbolRegistry.create();
                registry.registerModule("Acme");
                const userSymbolId = registry.registerType("User");
                const postSymbolId = registry.registerType("Post");
                registry.registerNestedType({
                    parentSymbolId: postSymbolId,
                    symbolName: "Date"
                });
                const ref = registry.reference({
                    fromSymbolId: userSymbolId,
                    toSymbolId: "Foundation.Date"
                });
                expect(ref.toString()).toBe("Date");
            });

            it("from a sibling custom type scope", () => {
                const registry = TargetSymbolRegistry.create();
                registry.registerModule("Acme");
                registry.registerType("User");
                const postSymbolId = registry.registerType("Post");
                const contentSymbolId = registry.registerNestedType({
                    parentSymbolId: postSymbolId,
                    symbolName: "Content"
                });
                registry.registerNestedType({
                    parentSymbolId: postSymbolId,
                    symbolName: "Date"
                });
                const ref = registry.reference({
                    fromSymbolId: contentSymbolId,
                    toSymbolId: "Foundation.Date"
                });
                expect(ref.toString()).toBe("Foundation.Date");
            });

            it("from a nested custom type in a different scope", () => {
                const registry = TargetSymbolRegistry.create();
                registry.registerModule("Acme");
                const userSymbolId = registry.registerType("User");
                const emailSymbolId = registry.registerNestedType({
                    parentSymbolId: userSymbolId,
                    symbolName: "Email"
                });
                const postSymbolId = registry.registerType("Post");
                registry.registerNestedType({
                    parentSymbolId: postSymbolId,
                    symbolName: "Date"
                });
                const ref = registry.reference({
                    fromSymbolId: emailSymbolId,
                    toSymbolId: "Foundation.Date"
                });
                expect(ref.toString()).toBe("Date");
            });
        });
    });
});
