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
                const postSymbol = registry.registerType("Post");
                userSymbol.setChild(postSymbol);

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
                const postSymbol = registry.registerType("Post");
                userSymbol.setChild(postSymbol);

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
                const postSymbol = registry.registerType("Post");
                userSymbol.setChild(postSymbol);

                const ref = registry.reference({
                    fromSymbolId: postSymbol.id,
                    toSymbolId: "Swift.String"
                });

                expect(ref.toString()).toBe("Swift.String");
            });
        });
    });
});
