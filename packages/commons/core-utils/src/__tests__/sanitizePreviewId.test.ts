import { sanitizePreviewId } from "../sanitizePreviewId.js";

describe("sanitizePreviewId", () => {
    it("lowercases", () => {
        expect(sanitizePreviewId("My-Feature")).toBe("my-feature");
    });

    it("replaces invalid characters and collapses dashes", () => {
        expect(sanitizePreviewId("feat/my_feature!")).toBe("feat-my-feature");
        expect(sanitizePreviewId("a---b")).toBe("a-b");
    });

    it("trims leading and trailing dashes", () => {
        expect(sanitizePreviewId("--abc--")).toBe("abc");
    });

    it("falls back to default when nothing is left", () => {
        expect(sanitizePreviewId("")).toBe("default");
        expect(sanitizePreviewId("!!!")).toBe("default");
    });
});
