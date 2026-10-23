import { removeLeadingSlash } from "../removeLeadingSlash.js";
import { removeTrailingSlash } from "../removeTrailingSlash.js";

describe("removeTrailingSlash", () => {
    it.each([
        ["https://example.com/", "https://example.com"],
        ["https://example.com", "https://example.com"],
        ["a//", "a/"],
        ["/", ""],
        ["", ""],
        ["/a/b", "/a/b"]
    ])("%j -> %j", (input, expected) => {
        expect(removeTrailingSlash(input)).toBe(expected);
    });
});

describe("removeLeadingSlash", () => {
    it.each([
        ["/a/b", "a/b"],
        ["a/b", "a/b"],
        ["//a", "/a"],
        ["/", ""],
        ["", ""],
        ["a/", "a/"]
    ])("%j -> %j", (input, expected) => {
        expect(removeLeadingSlash(input)).toBe(expected);
    });
});
