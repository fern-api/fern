import { errorMessageOrString } from "../errorMessageOrString.js";

describe("errorMessageOrString", () => {
    it("returns the message of an Error", () => {
        expect(errorMessageOrString(new Error("boom"))).toBe("boom");
    });

    it("keeps an empty Error message empty", () => {
        expect(errorMessageOrString(new Error(""))).toBe("");
    });

    it("stringifies non-Error values", () => {
        expect(errorMessageOrString("plain")).toBe("plain");
        expect(errorMessageOrString(42)).toBe("42");
        expect(errorMessageOrString(undefined)).toBe("undefined");
        expect(errorMessageOrString({ message: "ignored" })).toBe("[object Object]");
    });
});
