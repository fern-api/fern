import { sanitizeChangelogEntry } from "../sanitizeChangelogEntry.js";

describe("sanitizeChangelogEntry", () => {
    it("wraps simple generic types in backticks", () => {
        expect(sanitizeChangelogEntry("Added Optional<String> support")).toBe("Added `Optional<String>` support");
    });

    it("wraps Map with two type parameters", () => {
        expect(sanitizeChangelogEntry("Returns Map<String, Object>")).toBe("Returns `Map<String, Object>`");
    });

    it("wraps single type parameter", () => {
        expect(sanitizeChangelogEntry("Use List<Integer> instead")).toBe("Use `List<Integer>` instead");
    });

    it("wraps two-level nested generics", () => {
        expect(sanitizeChangelogEntry("Returns CompletableFuture<List<Integer>>")).toBe(
            "Returns `CompletableFuture<List<Integer>>`"
        );
        expect(sanitizeChangelogEntry("Takes Map<String, List<Integer>>")).toBe("Takes `Map<String, List<Integer>>`");
    });

    it("wraps three-level nested generics", () => {
        expect(sanitizeChangelogEntry("Uses Map<String, Map<String, List<Integer>>>")).toBe(
            "Uses `Map<String, Map<String, List<Integer>>>`"
        );
    });

    it("does not double-wrap already backticked spans", () => {
        expect(sanitizeChangelogEntry("Already wrapped `Optional<String>` stays")).toBe(
            "Already wrapped `Optional<String>` stays"
        );
    });

    it("handles mixed backticked and unwrapped types", () => {
        expect(sanitizeChangelogEntry("Already `List<String>` and new Optional<String>")).toBe(
            "Already `List<String>` and new `Optional<String>`"
        );
    });

    it("wraps multiple type references in one line", () => {
        expect(sanitizeChangelogEntry("Changed Optional<String> to Map<String, Object>")).toBe(
            "Changed `Optional<String>` to `Map<String, Object>`"
        );
    });

    it("does not match bare angle brackets without identifier prefix", () => {
        expect(sanitizeChangelogEntry("use <br> tags")).toBe("use <br> tags");
        expect(sanitizeChangelogEntry("<String>")).toBe("<String>");
    });

    it("does not match comparison operators", () => {
        expect(sanitizeChangelogEntry("a < b > c")).toBe("a < b > c");
    });

    it("returns text unchanged when there are no angle brackets", () => {
        expect(sanitizeChangelogEntry("No angle brackets here")).toBe("No angle brackets here");
    });

    it("handles empty string", () => {
        expect(sanitizeChangelogEntry("")).toBe("");
    });

    it("handles type at start of string", () => {
        expect(sanitizeChangelogEntry("Optional<String> is now supported")).toBe("`Optional<String>` is now supported");
    });

    it("handles type at end of string", () => {
        expect(sanitizeChangelogEntry("Now returns Optional<String>")).toBe("Now returns `Optional<String>`");
    });

    it("handles multiline entries", () => {
        const input = "Added Optional<String> support.\nAlso changed Map<String, Object> handling.";
        const expected = "Added `Optional<String>` support.\nAlso changed `Map<String, Object>` handling.";
        expect(sanitizeChangelogEntry(input)).toBe(expected);
    });
});
