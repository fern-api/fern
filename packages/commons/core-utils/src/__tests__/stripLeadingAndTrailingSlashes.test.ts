import { stripLeadingAndTrailingSlashes } from "../stripLeadingAndTrailingSlashes.js";

describe("stripLeadingAndTrailingSlashes", () => {
    it.each([
        ["/a/b/", "a/b"],
        ["///a//b///", "a//b"],
        ["a/b", "a/b"],
        ["/", ""],
        ["//", ""],
        ["", ""]
    ])("%j -> %j", (input, expected) => {
        expect(stripLeadingAndTrailingSlashes(input)).toBe(expected);
    });
});
