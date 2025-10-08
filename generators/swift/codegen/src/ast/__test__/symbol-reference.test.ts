import { describe, expect, it } from "vitest";

import { swift } from "../..";

describe("SymbolReference", () => {
    describe("write", () => {
        it("should write without generic arguments", () => {
            const symbolReference = swift.symbolReference({
                name: "Symbol1"
            });
            expect(symbolReference.toString()).toBe("Symbol1");
        });

        it("should write with 1 generic argument", () => {
            const symbolReference = swift.symbolReference({
                name: "Symbol1",
                genericArguments: [swift.symbolReference({ name: "Symbol2" })]
            });
            expect(symbolReference.toString()).toBe("Symbol1<Symbol2>");
        });

        it("should write with 2 generic arguments", () => {
            const symbolReference = swift.symbolReference({
                name: "Symbol1",
                genericArguments: [
                    swift.symbolReference({ name: "Symbol2" }),
                    swift.symbolReference({ name: "Symbol3" })
                ]
            });
            expect(symbolReference.toString()).toBe("Symbol1<Symbol2, Symbol3>");
        });

        it("should write with nested generic arguments", () => {
            const symbolReference = swift.symbolReference({
                name: "Symbol1",
                genericArguments: [
                    swift.symbolReference({
                        name: "Symbol2",
                        genericArguments: [swift.symbolReference({ name: "Symbol3" })]
                    })
                ]
            });
            expect(symbolReference.toString()).toBe("Symbol1<Symbol2<Symbol3>>");
        });
    });
});
