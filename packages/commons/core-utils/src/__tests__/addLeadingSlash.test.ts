import { addLeadingSlash } from "../addLeadingSlash.js";

describe("addLeadingSlash", () => {
    it.each([
        ["a/b", "/a/b"],
        ["/a/b", "/a/b"],
        ["//a", "//a"],
        ["", "/"],
        ["/", "/"]
    ])("%j -> %j", (input, expected) => {
        expect(addLeadingSlash(input)).toBe(expected);
    });
});
