import { describe, expect, it } from "vitest";

import { getPublishWarnings } from "../getPublishWarnings.js";

describe("getPublishWarnings", () => {
    it("returns the warnings FDR sent", () => {
        expect(
            getPublishWarnings({
                deploymentId: "d",
                warnings: ["This site uses custom CSS, which requires an Enterprise plan."]
            })
        ).toEqual(["This site uses custom CSS, which requires an Enterprise plan."]);
    });

    it("returns nothing when the response has no warnings", () => {
        expect(getPublishWarnings({ deploymentId: "d" })).toEqual([]);
        expect(getPublishWarnings(undefined)).toEqual([]);
        expect(getPublishWarnings({ warnings: "not a list" })).toEqual([]);
    });

    it("drops empty and non-string entries", () => {
        expect(getPublishWarnings({ warnings: ["", 1, null, "kept"] })).toEqual(["kept"]);
    });
});
