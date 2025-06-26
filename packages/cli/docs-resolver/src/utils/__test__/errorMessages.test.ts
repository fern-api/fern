import { cannotFindSubpackageByLocatorError, normalizeLocatorString } from "../errorMessages";

describe("cannotFindSubpackageByLocatorError", () => {
    it("returns base error when no matches", () => {
        const result = cannotFindSubpackageByLocatorError("foo.bar", []);
        expect(result).toBe("Failed to locate API section foo.bar.");
    });
    it("returns suggestion for one match", () => {
        const result = cannotFindSubpackageByLocatorError("foo.bar", ["foo.baz"]);
        expect(result).toBe("Failed to locate API section foo.bar. Did you mean foo.baz?");
    });
    it("returns suggestions for two matches", () => {
        const result = cannotFindSubpackageByLocatorError("foo.bar", ["foo.baz", "foo.bat"]);
        expect(result).toBe("Failed to locate API section foo.bar. Did you mean foo.bat or foo.baz?");
    });
    it("returns suggestions for three matches", () => {
        const result = cannotFindSubpackageByLocatorError("foo.bar", ["foo.baz", "foo.bat", "foo.baq"]);
        expect(result).toBe("Failed to locate API section foo.bar. Did you mean foo.baq, foo.bat, or foo.baz?");
    });
    it("returns only three suggestions even if more exist", () => {
        const result = cannotFindSubpackageByLocatorError("foo.bar", ["foo.baz", "foo.bat", "foo.baq", "foo.bam"]);
        expect(result).toBe("Failed to locate API section foo.bar. Did you mean foo.bam, foo.baq, or foo.bat?");
    });
    it("suggests ignoring case and symbols", () => {
        // 'Foo-Bar' and 'foo_bar' should be considered similar to 'foo.bar' after normalization
        const result = cannotFindSubpackageByLocatorError("foo.bar", ["Foo-Bar", "foo_bar", "baz"]);
        // Both 'Foo-Bar' and 'foo_bar' normalize to 'foobar', so both are equally close
        expect(result).toContain("Foo-Bar");
        expect(result).toContain("foo_bar");
    });
});

describe("normalizeLocatorString", () => {
    it("removes non-alphanumeric and lowercases", () => {
        expect(normalizeLocatorString("Foo.Bar-Baz_123")).toBe("foobarbaz123");
    });
    it("handles empty string", () => {
        expect(normalizeLocatorString("")).toBe("");
    });
    it("removes all symbols", () => {
        expect(normalizeLocatorString("-._!@# ")).toBe("");
    });
});
