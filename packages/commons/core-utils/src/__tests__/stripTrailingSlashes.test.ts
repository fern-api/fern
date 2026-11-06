import { stripTrailingSlashes } from "../stripTrailingSlashes.js";

describe("stripTrailingSlashes", () => {
    it("removes one or many trailing slashes", () => {
        expect(stripTrailingSlashes("https://example.com/")).toBe("https://example.com");
        expect(stripTrailingSlashes("/a/b///")).toBe("/a/b");
    });

    it("leaves other slashes alone", () => {
        expect(stripTrailingSlashes("/a/b")).toBe("/a/b");
        expect(stripTrailingSlashes("/a//b")).toBe("/a//b");
    });

    it("turns a lone slash into an empty string", () => {
        expect(stripTrailingSlashes("/")).toBe("");
    });

    it("passes undefined through", () => {
        expect(stripTrailingSlashes(undefined)).toBeUndefined();
    });
});
