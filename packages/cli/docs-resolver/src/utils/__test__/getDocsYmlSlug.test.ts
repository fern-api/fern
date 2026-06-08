import { getDocsYmlSlug } from "../getDocsYmlSlug.js";

describe("getDocsYmlSlug", () => {
    it("treats slash-only slugs as the parent path", () => {
        expect(getDocsYmlSlug("/", "fallback")).toBe("");
    });

    it("preserves leading and trailing slashes for non-root slugs", () => {
        expect(getDocsYmlSlug("/learn/", "fallback")).toBe("/learn/");
    });

    it("preserves multi-segment slugs", () => {
        expect(getDocsYmlSlug("api/v2", "fallback")).toBe("api/v2");
    });

    it("preserves empty slugs", () => {
        expect(getDocsYmlSlug("", "fallback")).toBe("");
    });

    it("uses the fallback slug when no slug is configured", () => {
        expect(getDocsYmlSlug(undefined, "fallback")).toBe("fallback");
    });
});
