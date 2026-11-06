import { isHttpUrl } from "../isHttpUrl.js";

describe("isHttpUrl", () => {
    it("accepts http and https", () => {
        expect(isHttpUrl("http://example.com")).toBe(true);
        expect(isHttpUrl("https://example.com/path?q=1")).toBe(true);
    });

    it("rejects other schemes, relative paths and bare domains", () => {
        expect(isHttpUrl("ftp://example.com")).toBe(false);
        expect(isHttpUrl("./openapi.yml")).toBe(false);
        expect(isHttpUrl("example.com")).toBe(false);
        expect(isHttpUrl("")).toBe(false);
    });

    it("is case sensitive on the scheme", () => {
        expect(isHttpUrl("HTTPS://example.com")).toBe(false);
    });
});
