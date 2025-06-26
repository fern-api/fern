import { normalizeLocatorString } from "../errorMessages";
import { getLexicallyNearestNeighbors } from "../getLexicallyNearestNeighbors";

describe("getLexicallyNearestNeighbors", () => {
    it("returns empty array if numNeighbors is 0", () => {
        expect(getLexicallyNearestNeighbors("foo", ["bar", "baz"], 0)).toEqual([]);
    });
    it("returns closest match by Levenshtein distance", () => {
        expect(getLexicallyNearestNeighbors("foo", ["boo", "bar", "baz"], 1)).toEqual(["boo"]);
    });
    it("returns multiple closest matches, sorted by distance then lexicographically", () => {
        expect(getLexicallyNearestNeighbors("foo", ["boo", "fob", "foa", "bar"], 2)).toEqual(["boo", "foa"]);
    });
    it("returns all if fewer neighbors than requested", () => {
        expect(getLexicallyNearestNeighbors("foo", ["boo", "bar"], 5)).toEqual(["boo", "bar"]);
    });
    it("handles empty neighbors iterable", () => {
        expect(getLexicallyNearestNeighbors("foo", [], 3)).toEqual([]);
    });
});

describe("getLexicallyNearestNeighbors with normalization", () => {
    it("finds neighbors ignoring case and symbols", () => {
        const neighbors = ["Foo-Bar", "foo_bar", "baz"];
        const result = getLexicallyNearestNeighbors("foo.bar", neighbors, 2, normalizeLocatorString);
        // Both 'Foo-Bar' and 'foo_bar' normalize to 'foobar', so both are equally close
        expect(result).toContain("Foo-Bar");
        expect(result).toContain("foo_bar");
    });
});
