/* eslint-disable jest/no-mocks-import */
import urlJoin from "url-join";

require("jest-specific-snapshot");

describe("encodeURIComponent", () => {
    it("echo", async () => {
        const echo = encodeURIComponent("echo");
        expect(echo).toEqual("echo");
    });

    it("escaped", async () => {
        const escaped = encodeURIComponent("\\example");
        expect(escaped).toEqual("%5Cexample");
    });

    it("url", async () => {
        const url = urlJoin("https://example.com", encodeURIComponent("echo"), encodeURIComponent("\\example"));
        expect(url).toEqual("https://example.com/echo/%5Cexample");
    });
});
