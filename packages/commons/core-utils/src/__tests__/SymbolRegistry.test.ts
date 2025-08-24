import { describe, expect, test } from "vitest";
import { SymbolRegistry } from "../SymbolRegistry";

describe("SymbolRegistry", () => {
    describe("basic functionality", () => {
        test("registers and retrieves symbols", () => {
            const registry = new SymbolRegistry();
            const symbolName = registry.registerSymbol("id1", ["mySymbol"]);
            
            expect(symbolName).toBe("mySymbol");
            expect(registry.getSymbolNameById("id1")).toBe("mySymbol");
            expect(registry.getSymbolNameByIdOrThrow("id1")).toBe("mySymbol");
        });

        test("throws error when registering same ID twice", () => {
            const registry = new SymbolRegistry();
            registry.registerSymbol("id1", ["mySymbol"]);
            
            expect(() => registry.registerSymbol("id1", ["anotherSymbol"])).toThrow(
                "Symbol with ID 'id1' is already registered."
            );
        });

        test("returns undefined for non-existent symbol ID", () => {
            const registry = new SymbolRegistry();
            expect(registry.getSymbolNameById("nonexistent")).toBeUndefined();
        });

        test("throws error when getting non-existent symbol by ID", () => {
            const registry = new SymbolRegistry();
            expect(() => registry.getSymbolNameByIdOrThrow("nonexistent")).toThrow(
                "Symbol with ID 'nonexistent' not found for in registry."
            );
        });
    });

    describe("reserved symbol names", () => {
        test("avoids reserved symbol names", () => {
            const registry = new SymbolRegistry({
                reservedSymbolNames: ["reserved1", "reserved2"]
            });

            expect(registry.isSymbolNameRegistered("reserved1")).toBe(true);
            expect(registry.isSymbolNameRegistered("reserved2")).toBe(true);
            expect(registry.isSymbolNameRegistered("notReserved")).toBe(false);
        });

        test("resolves conflicts with reserved names using append-underscore", () => {
            const registry = new SymbolRegistry({
                reservedSymbolNames: ["reserved"]
            });

            const symbolName = registry.registerSymbol("id1", ["reserved"]);
            expect(symbolName).toBe("reserved_");
        });

        test("resolves conflicts with reserved names using append-number", () => {
            const registry = new SymbolRegistry({
                reservedSymbolNames: ["reserved"],
                conflictResolutionStrategy: "append-number"
            });

            const symbolName = registry.registerSymbol("id1", ["reserved"]);
            expect(symbolName).toBe("reserved2");
        });
    });

    describe("candidate selection", () => {
        test("selects first available candidate", () => {
            const registry = new SymbolRegistry();
            registry.registerSymbol("id1", ["taken"]);

            const symbolName = registry.registerSymbol("id2", ["taken", "available", "alsofree"]);
            expect(symbolName).toBe("available");
        });

        test("tries all candidates before conflict resolution", () => {
            const registry = new SymbolRegistry();
            registry.registerSymbol("id1", ["taken1"]);
            registry.registerSymbol("id2", ["taken2"]);

            const symbolName = registry.registerSymbol("id3", ["taken1", "taken2", "available"]);
            expect(symbolName).toBe("available");
        });
    });

    describe("append-underscore strategy", () => {
        test("appends underscores for conflicts", () => {
            const registry = new SymbolRegistry({
                conflictResolutionStrategy: "append-underscore"
            });
            
            expect(registry.registerSymbol("id1", ["symbol"])).toBe("symbol");
            expect(registry.registerSymbol("id2", ["symbol"])).toBe("symbol_");
            expect(registry.registerSymbol("id3", ["symbol"])).toBe("symbol__");
        });

        test("handles multiple consecutive underscores", () => {
            const registry = new SymbolRegistry({
                conflictResolutionStrategy: "append-underscore"
            });
            
            registry.registerSymbol("id1", ["test"]);
            registry.registerSymbol("id2", ["test_"]);
            registry.registerSymbol("id3", ["test__"]);
            
            expect(registry.registerSymbol("id4", ["test"])).toBe("test___");
        });
    });

    describe("append-number strategy", () => {
        test("appends numbers for conflicts starting from 2", () => {
            const registry = new SymbolRegistry({
                conflictResolutionStrategy: "append-number"
            });
            
            expect(registry.registerSymbol("id1", ["symbol"])).toBe("symbol");
            expect(registry.registerSymbol("id2", ["symbol"])).toBe("symbol2");
            expect(registry.registerSymbol("id3", ["symbol"])).toBe("symbol3");
        });

        test("handles existing numbered variants", () => {
            const registry = new SymbolRegistry({
                conflictResolutionStrategy: "append-number"
            });
            
            registry.registerSymbol("id1", ["test"]);
            registry.registerSymbol("id2", ["test2"]);
            registry.registerSymbol("id3", ["test4"]);
            
            expect(registry.registerSymbol("id4", ["test"])).toBe("test3");
        });

        test("works with numbers in base name", () => {
            const registry = new SymbolRegistry({
                conflictResolutionStrategy: "append-number"
            });
            
            expect(registry.registerSymbol("id1", ["item1"])).toBe("item1");
            expect(registry.registerSymbol("id2", ["item1"])).toBe("item12");
            expect(registry.registerSymbol("id3", ["item1"])).toBe("item13");
        });
    });

    describe("symbol registration checks", () => {
        test("correctly identifies registered symbol names", () => {
            const registry = new SymbolRegistry();
            
            expect(registry.isSymbolNameRegistered("test")).toBe(false);
            registry.registerSymbol("id1", ["test"]);
            expect(registry.isSymbolNameRegistered("test")).toBe(true);
        });

        test("correctly identifies registered symbol IDs", () => {
            const registry = new SymbolRegistry();
            
            expect(registry.isSymbolIdRegistered("id1")).toBe(false);
            registry.registerSymbol("id1", ["test"]);
            expect(registry.isSymbolIdRegistered("id1")).toBe(true);
        });
    });

    describe("default options", () => {
        test("uses default options when none provided", () => {
            const registry = new SymbolRegistry();
            
            // Should use append-underscore by default
            registry.registerSymbol("id1", ["test"]);
            expect(registry.registerSymbol("id2", ["test"])).toBe("test_");
        });

        test("default options are correct", () => {
            expect(SymbolRegistry.defaultOptions).toEqual({
                reservedSymbolNames: [],
                conflictResolutionStrategy: "append-underscore"
            });
        });
    });
});
