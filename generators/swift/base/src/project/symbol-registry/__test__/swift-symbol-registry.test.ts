import { SwiftSymbolRegistry } from "../swift-symbol-registry";

describe("SwiftSymbolRegistry", () => {
    describe("for top level type name collisions with Swift types", () => {
        it("correctly resolves type reference to custom type", () => {
            const registry = SwiftSymbolRegistry.create();
            registry.registerModule("Acme");

            const userSymbol = registry.registerType("User");
            const customStringSymbol = registry.registerType("String");

            const ref = registry.reference({
                fromSymbolId: userSymbol.id,
                toSymbolId: customStringSymbol.id
            });

            expect(ref.toString()).toBe("String");
        });

        it("correctly resolves type reference to Swift type", () => {
            const registry = SwiftSymbolRegistry.create();
            registry.registerModule("Acme");

            const userSymbol = registry.registerType("User");
            registry.registerType("String");

            const ref = registry.reference({
                fromSymbolId: userSymbol.id,
                toSymbolId: "Swift.String"
            });

            expect(ref.toString()).toBe("Swift.String");
        });
    });
});
