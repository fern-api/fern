import { getPathSegments } from "../getPathSegments.js";

describe("getPathSegments", () => {
    it.each([
        ["/a/b/c", ["a", "b", "c"]],
        ["a/b/c/", ["a", "b", "c"]],
        ["/a//b///c/", ["a", "b", "c"]],
        ["a", ["a"]],
        ["/", []],
        ["", []]
    ])("%j -> %j", (input, expected) => {
        expect(getPathSegments(input)).toEqual(expected);
    });
});
