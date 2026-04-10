import { describe, expect, it } from "vitest";

import { substituteGenericParams } from "../substituteGenericParams.js";

describe("substituteGenericParams", () => {
    describe("basic substitution", () => {
        it("replaces a single param with its argument", () => {
            expect(substituteGenericParams("T", ["T"], ["User"])).toBe("User");
        });

        it("replaces multiple params", () => {
            expect(substituteGenericParams("map<A, B>", ["A", "B"], ["string", "integer"])).toBe(
                "map<string, integer>"
            );
        });

        it("returns the original string when no params are provided", () => {
            expect(substituteGenericParams("SomeType", [], [])).toBe("SomeType");
        });

        it("returns the original string when param is not found", () => {
            expect(substituteGenericParams("SomeType", ["T"], ["User"])).toBe("SomeType");
        });
    });

    describe("nested generics", () => {
        it("substitutes inside nested generic types", () => {
            expect(substituteGenericParams("list<Data<T>>", ["T"], ["User"])).toBe("list<Data<User>>");
        });

        it("substitutes in deeply nested generics", () => {
            expect(substituteGenericParams("optional<list<Data<T>>>", ["T"], ["Movie"])).toBe(
                "optional<list<Data<Movie>>>"
            );
        });

        it("substitutes multiple params in nested types", () => {
            expect(substituteGenericParams("map<A, list<B>>", ["A", "B"], ["string", "integer"])).toBe(
                "map<string, list<integer>>"
            );
        });
    });

    describe("word-boundary safety", () => {
        it("does not replace param name inside longer identifiers", () => {
            expect(substituteGenericParams("TypeName", ["T"], ["User"])).toBe("TypeName");
        });

        it("does not replace param name that is a prefix of a type", () => {
            expect(substituteGenericParams("Thing", ["T"], ["User"])).toBe("Thing");
        });

        it("does not replace param name that is a suffix of a type", () => {
            expect(substituteGenericParams("MyT", ["T"], ["User"])).toBe("MyT");
        });

        it("does not replace param name embedded in a word", () => {
            expect(substituteGenericParams("DataType", ["Data"], ["User"])).toBe("DataType");
        });

        it("replaces param adjacent to angle brackets", () => {
            expect(substituteGenericParams("list<T>", ["T"], ["User"])).toBe("list<User>");
        });

        it("replaces param adjacent to commas", () => {
            expect(substituteGenericParams("map<T, U>", ["T", "U"], ["string", "integer"])).toBe(
                "map<string, integer>"
            );
        });

        it("replaces param that is the entire string", () => {
            expect(substituteGenericParams("T", ["T"], ["User"])).toBe("User");
        });
    });

    describe("single-pass clobbering prevention", () => {
        it("does not clobber when arg matches a later param name", () => {
            // A->B, B->string: "map<A, B>" should become "map<B, string>", NOT "map<string, string>"
            expect(substituteGenericParams("map<A, B>", ["A", "B"], ["B", "string"])).toBe("map<B, string>");
        });

        it("does not clobber with swapped params", () => {
            // A->B, B->A: "Pair<A, B>" should become "Pair<B, A>", NOT "Pair<A, A>" or "Pair<B, B>"
            expect(substituteGenericParams("Pair<A, B>", ["A", "B"], ["B", "A"])).toBe("Pair<B, A>");
        });

        it("does not clobber in nested context", () => {
            // A->B, B->C: "list<map<A, B>>" should become "list<map<B, C>>"
            expect(substituteGenericParams("list<map<A, B>>", ["A", "B"], ["B", "C"])).toBe("list<map<B, C>>");
        });

        it("handles chained substitution scenario correctly", () => {
            // A->B, B->C, C->D: each replaced in one pass only
            expect(substituteGenericParams("Triple<A, B, C>", ["A", "B", "C"], ["B", "C", "D"])).toBe(
                "Triple<B, C, D>"
            );
        });
    });

    describe("edge cases", () => {
        it("handles null/undefined args gracefully (mismatched lengths)", () => {
            // More params than args: extra params are skipped
            expect(substituteGenericParams("Pair<A, B>", ["A", "B"], ["string"])).toBe("Pair<string, B>");
        });

        it("handles empty type reference", () => {
            expect(substituteGenericParams("", ["T"], ["User"])).toBe("");
        });

        it("handles multiple occurrences of the same param", () => {
            expect(substituteGenericParams("Pair<T, T>", ["T"], ["User"])).toBe("Pair<User, User>");
        });

        it("handles param with underscores", () => {
            expect(substituteGenericParams("list<my_type>", ["my_type"], ["User"])).toBe("list<User>");
        });

        it("handles single-char and multi-char params together", () => {
            expect(substituteGenericParams("map<T, Value>", ["T", "Value"], ["string", "integer"])).toBe(
                "map<string, integer>"
            );
        });
    });
});
