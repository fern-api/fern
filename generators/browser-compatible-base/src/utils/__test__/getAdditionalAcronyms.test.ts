import { describe, expect, it } from "vitest";
import { getAdditionalAcronyms } from "../getAdditionalAcronyms.js";

describe("getAdditionalAcronyms", () => {
    it("reads the field even when it is absent from the generator's IR types", () => {
        expect(getAdditionalAcronyms({ smartCasing: true, additionalAcronyms: ["FDX", "CRA"] })).toEqual([
            "FDX",
            "CRA"
        ]);
    });

    it("returns undefined when the casings config has no acronyms", () => {
        expect(getAdditionalAcronyms(undefined)).toBeUndefined();
        expect(getAdditionalAcronyms({ smartCasing: true })).toBeUndefined();
        expect(getAdditionalAcronyms({ additionalAcronyms: null })).toBeUndefined();
    });

    it("drops non-string entries", () => {
        expect(getAdditionalAcronyms({ additionalAcronyms: ["FDX", 1, null] })).toEqual(["FDX"]);
    });
});
