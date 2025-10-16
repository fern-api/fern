import { describe, expect, it } from "vitest";

import { swift } from "../..";

describe("TypeReference", () => {
    describe("generic", () => {
        it("should write without generic arguments", () => {
            const ref = swift.TypeReference.generic(swift.TypeReference.symbol("Symbol1"), []);
            expect(ref.toString()).toBe("Symbol1");
        });

        it("should write with 1 generic argument", () => {
            const ref = swift.TypeReference.generic(swift.TypeReference.symbol("Symbol1"), [
                swift.TypeReference.symbol("Symbol2")
            ]);
            expect(ref.toString()).toBe("Symbol1<Symbol2>");
        });

        it("should write with 2 generic arguments", () => {
            const ref = swift.TypeReference.generic(swift.TypeReference.symbol("Symbol1"), [
                swift.TypeReference.symbol("Symbol2"),
                swift.TypeReference.symbol("Symbol3")
            ]);
            expect(ref.toString()).toBe("Symbol1<Symbol2, Symbol3>");
        });

        it("should write with nested generic arguments", () => {
            const ref = swift.TypeReference.generic(swift.TypeReference.symbol("Symbol1"), [
                swift.TypeReference.generic(swift.TypeReference.symbol("Symbol2"), [
                    swift.TypeReference.symbol("Symbol3")
                ])
            ]);
            expect(ref.toString()).toBe("Symbol1<Symbol2<Symbol3>>");
        });
    });
});
