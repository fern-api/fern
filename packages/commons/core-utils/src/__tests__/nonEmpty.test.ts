import { nonEmpty } from "../nonEmpty.js";

describe("nonEmpty", () => {
    it("returns undefined for missing and blank values", () => {
        for (const value of [undefined, null, "", "   ", "\n\t"]) {
            expect(nonEmpty(value)).toBeUndefined();
        }
    });

    it("returns the string with surrounding whitespace removed", () => {
        expect(nonEmpty("acme")).toBe("acme");
        expect(nonEmpty("  acme sdk \n")).toBe("acme sdk");
    });
});
