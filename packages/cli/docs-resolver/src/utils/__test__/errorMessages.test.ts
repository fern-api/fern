import { cannotFindSubpackageByLocatorError } from "../errorMessages";

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
});
